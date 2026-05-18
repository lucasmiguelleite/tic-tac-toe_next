'use client';

import { useState, useCallback, useRef } from 'react';
import { BoardState, GameResult, Player } from '@/domain/types';

const ACTIVE_TURN_POLL_MS = 1000;
const WAITING_TURN_POLL_MS = 2000;
const BACKGROUND_POLL_MS = 5000;
const DISCONNECT_GRACE_CHECKS = 3;

export const useOnlineRoom = (roomId: string | null, playerId: string | null) => {
  const [squares, setSquares] = useState<BoardState>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<GameResult>(null);
  const [opponentConnected, setOpponentConnected] = useState(true);
  const [yourRole, setYourRole] = useState<Player | null>(null);
  const [yourNickname, setYourNickname] = useState('');
  const [opponentNickname, setOpponentNickname] = useState('');
  const [restartRequestedBy, setRestartRequestedBy] = useState<Player | null>(null);
  const [createdAt, setCreatedAt] = useState<number | null>(null);

  // Track pending optimistic move to prevent flickering
  const pendingMoveRef = useRef<{ index: number; player: Player } | null>(null);

  const applyState = useCallback((data: Record<string, unknown>) => {
    const serverBoard = data.board as BoardState;
    const pm = pendingMoveRef.current;

    if (pm && serverBoard[pm.index] === pm.player) {
      // Server confirmed the move — clear pending
      pendingMoveRef.current = null;
    }

    setSquares(() => {
      if (pm && serverBoard[pm.index] !== pm.player) {
        // Server hasn't registered our move yet — preserve it on top of server state
        const merged = [...serverBoard];
        merged[pm.index] = pm.player;
        return merged;
      }
      return serverBoard;
    });
    setCurrentPlayer(data.currentPlayer as Player);
    setWinner(data.winner as GameResult);
    setOpponentConnected(data.opponentConnected as boolean);
    if (data.yourRole) setYourRole(data.yourRole as Player);
    if (data.yourNickname) setYourNickname(data.yourNickname as string);
    if (data.opponentNickname) setOpponentNickname(data.opponentNickname as string);
    setRestartRequestedBy((data.restartRequestedBy as Player) || null);
    if (data.createdAt) setCreatedAt((prev) => prev ?? (data.createdAt as number));
  }, []);

  const fetchState = useCallback(async () => {
    if (!roomId || !playerId) return;
    try {
      const res = await fetch(`/api/online/room/state?roomId=${roomId}&playerId=${playerId}`);
      if (res.ok) applyState(await res.json());
    } catch {
      // Will be retried by polling
    }
  }, [roomId, playerId, applyState]);

  const pollGameState = useCallback((onDisconnect: () => void, onExpired: () => void) => {
    if (!roomId || !playerId) return () => {};
    let active = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let inFlight = false;
    let disconnectCheckCount = 0;

    const scheduleNext = (delay: number) => {
      if (!active) return;
      timeoutId = setTimeout(tick, delay);
    };

    const nextPollDelay = (data?: Record<string, unknown>) => {
      if (typeof document !== 'undefined' && document.hidden) return BACKGROUND_POLL_MS;
      if (!data) return WAITING_TURN_POLL_MS;

      const role = data.yourRole as Player | null;
      const nextPlayer = data.currentPlayer as Player | null;
      return role && nextPlayer && role === nextPlayer ? ACTIVE_TURN_POLL_MS : WAITING_TURN_POLL_MS;
    };

    const tick = async () => {
      if (!active || inFlight) return;
      inFlight = true;
      try {
        const res = await fetch(`/api/online/room/state?roomId=${roomId}&playerId=${playerId}`);
        if (!active) return;
        if (res.status === 404) {
          active = false;
          onExpired();
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (!active) return;
          applyState(data);
          if (!data.opponentConnected && data.roomStatus === 'playing') {
            disconnectCheckCount++;
            if (disconnectCheckCount >= DISCONNECT_GRACE_CHECKS) {
              active = false;
              onDisconnect();
              return;
            }
          } else {
            disconnectCheckCount = 0;
          }
          scheduleNext(nextPollDelay(data));
          return;
        }
      } catch {
        // Retry
      } finally {
        inFlight = false;
      }
      scheduleNext(nextPollDelay());
    };
    tick();
    return () => {
      active = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [roomId, playerId, applyState]);

  const pollLobby = useCallback((onOpponentJoined: (data: Record<string, unknown>) => void) => {
    if (!roomId || !playerId) return () => {};
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/online/room/state?roomId=${roomId}&playerId=${playerId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.roomStatus === 'playing') onOpponentJoined(data);
        }
      } catch {
        // Retry
      }
    }, 2000);
    return () => clearInterval(id);
  }, [roomId, playerId]);

  const makeMove = useCallback(async (index: number) => {
    if (yourRole !== currentPlayer || !roomId || !playerId) return;
    // Optimistic update with pending tracking
    pendingMoveRef.current = { index, player: currentPlayer };
    setSquares((prev) => prev.map((cell, i) => (i === index ? currentPlayer : cell)));
    try {
      const res = await fetch('/api/online/room/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerId, index }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentPlayer(data.currentPlayer);
        setWinner(data.winner);
        pendingMoveRef.current = null;
      } else {
        pendingMoveRef.current = null;
      }
    } catch {
      pendingMoveRef.current = null;
    }
  }, [yourRole, currentPlayer, roomId, playerId]);

  const restart = useCallback(async (currentRole: Player | null) => {
    if (!roomId || !playerId) return false;
    try {
      const res = await fetch('/api/online/room/restart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.waitingForOpponent) {
          setRestartRequestedBy(currentRole);
          return false;
        } else {
          setSquares(Array(9).fill(null));
          setCurrentPlayer('X');
          setWinner(null);
          setRestartRequestedBy(null);
          pendingMoveRef.current = null;
          return true;
        }
      }
    } catch {
      // Retry on next action
    }
    return false;
  }, [roomId, playerId]);

  const setInitialRoomState = useCallback((role: Player, nickname: string, fetchedState?: Record<string, unknown>) => {
    setYourRole(role);
    setYourNickname(nickname);
    if (fetchedState) applyState(fetchedState);
  }, [applyState]);

  const resetRoom = useCallback(() => {
    setSquares(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setOpponentConnected(true);
    setOpponentNickname('');
    setYourNickname('');
    setYourRole(null);
    setRestartRequestedBy(null);
    setCreatedAt(null);
    pendingMoveRef.current = null;
  }, []);

  return {
    squares, currentPlayer, winner, opponentConnected,
    yourRole, yourNickname, opponentNickname, restartRequestedBy, createdAt,
    fetchState, pollGameState, pollLobby, applyState,
    makeMove, restart, setInitialRoomState, resetRoom,
  };
};
