'use client';

import { useState, useEffect, useCallback } from 'react';
import { BoardState, GameResult, Player } from '@/domain/types';

export const useOnlineRoom = (roomId: string | null, playerId: string | null) => {
  const [squares, setSquares] = useState<BoardState>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<GameResult>(null);
  const [opponentConnected, setOpponentConnected] = useState(true);
  const [yourRole, setYourRole] = useState<Player | null>(null);
  const [yourNickname, setYourNickname] = useState('');
  const [opponentNickname, setOpponentNickname] = useState('');
  const [restartRequestedBy, setRestartRequestedBy] = useState<Player | null>(null);

  const applyState = useCallback((data: Record<string, unknown>) => {
    setSquares(data.board as BoardState);
    setCurrentPlayer(data.currentPlayer as Player);
    setWinner(data.winner as GameResult);
    setOpponentConnected(data.opponentConnected as boolean);
    if (data.yourRole) setYourRole(data.yourRole as Player);
    if (data.yourNickname) setYourNickname(data.yourNickname as string);
    if (data.opponentNickname) setOpponentNickname(data.opponentNickname as string);
    setRestartRequestedBy((data.restartRequestedBy as Player) || null);
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
    const tick = async () => {
      if (!active) return;
      try {
        const res = await fetch(`/api/online/room/state?roomId=${roomId}&playerId=${playerId}`);
        if (res.status === 404) { onExpired(); return; }
        if (res.ok) {
          const data = await res.json();
          applyState(data);
          if (!data.opponentConnected && data.roomStatus === 'playing') onDisconnect();
        }
      } catch {
        // Retry
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => { active = false; clearInterval(id); };
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
      }
    } catch {
      // Next poll will correct state
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
  }, []);

  return {
    squares, currentPlayer, winner, opponentConnected,
    yourRole, yourNickname, opponentNickname, restartRequestedBy,
    fetchState, pollGameState, pollLobby, applyState,
    makeMove, restart, setInitialRoomState, resetRoom,
  };
};
