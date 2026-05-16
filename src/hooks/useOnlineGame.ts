'use client';

import { useState, useEffect, useCallback } from 'react';
import { BoardState, GameResult, OnlinePhase, Player } from '@/domain/types';

export const useOnlineGame = (nickname?: string) => {
  const [phase, setPhase] = useState<OnlinePhase>('select-mode');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [yourRole, setYourRole] = useState<Player | null>(null);
  const [squares, setSquares] = useState<BoardState>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<GameResult>(null);
  const [opponentConnected, setOpponentConnected] = useState(true);
  const [opponentNickname, setOpponentNickname] = useState('');
  const [yourNickname, setYourNickname] = useState('');
  const [queueId, setQueueId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restartRequestedBy, setRestartRequestedBy] = useState<Player | null>(null);

  const fetchState = useCallback(async () => {
    if (!roomId || !playerId) return;
    try {
      const res = await fetch(`/api/online/room/state?roomId=${roomId}&playerId=${playerId}`);
      if (res.ok) {
        const data = await res.json();
        setSquares(data.board);
        setCurrentPlayer(data.currentPlayer);
        setWinner(data.winner);
        setOpponentConnected(data.opponentConnected);
        if (data.yourRole) setYourRole(data.yourRole);
        if (data.yourNickname) setYourNickname(data.yourNickname);
        if (data.opponentNickname) setOpponentNickname(data.opponentNickname);
        setRestartRequestedBy(data.restartRequestedBy || null);
      }
    } catch {
      // Will be retried by polling
    }
  }, [roomId, playerId]);

  // Poll game state when playing
  useEffect(() => {
    if (phase !== 'playing' || !roomId || !playerId) return;
    fetchState();
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/online/room/state?roomId=${roomId}&playerId=${playerId}`);
        if (res.status === 404) {
          setError('Room expired');
          setPhase('error');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setSquares(data.board);
          setCurrentPlayer(data.currentPlayer);
          setWinner(data.winner);
          setOpponentConnected(data.opponentConnected);
          if (data.yourRole) setYourRole(data.yourRole);
          if (data.yourNickname) setYourNickname(data.yourNickname);
          if (data.opponentNickname) setOpponentNickname(data.opponentNickname);
          setRestartRequestedBy(data.restartRequestedBy || null);

          if (!data.opponentConnected && data.roomStatus === 'playing') {
            setPhase('opponent-disconnected');
          }
        }
      } catch {
        // Network error, retry on next interval
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, roomId, playerId, fetchState]);

  // Poll lobby state (waiting for opponent to join)
  useEffect(() => {
    if (phase !== 'lobby' || !roomId || !playerId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/online/room/state?roomId=${roomId}&playerId=${playerId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.roomStatus === 'playing') {
            if (data.yourNickname) setYourNickname(data.yourNickname);
            if (data.opponentNickname) setOpponentNickname(data.opponentNickname);
            setPhase('playing');
          }
        }
      } catch {
        // Retry
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [phase, roomId, playerId]);

  // Poll queue for match
  useEffect(() => {
    if (phase !== 'in-queue' || !queueId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/online/queue/poll?queueId=${queueId}`);
        if (res.status === 404) {
          setError('Queue timed out. Please try again.');
          setPhase('error');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (data.matched && data.matchResult) {
            setRoomId(data.matchResult.roomId);
            setPlayerId(data.matchResult.playerId);
            setYourRole(data.matchResult.playerRole);
            setPhase('matched');
          }
        }
      } catch {
        // Retry
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [phase, queueId]);

  // Notify server on tab close / navigate away
  useEffect(() => {
    if (!roomId || !playerId) return;
    const handleUnload = () => {
      navigator.sendBeacon(
        '/api/online/room/disconnect',
        JSON.stringify({ roomId, playerId }),
      );
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [roomId, playerId]);

  // Transition from matched to playing after showing match screen
  useEffect(() => {
    if (phase !== 'matched') return;
    // Pre-fetch state so nicknames are ready when game renders
    fetchState();
    const timeout = setTimeout(() => setPhase('playing'), 2000);
    return () => clearTimeout(timeout);
  }, [phase, fetchState]);

  const createRoom = useCallback(async () => {
    setPhase('creating-room');
    try {
      const res = await fetch('/api/online/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });
      const data = await res.json();
      setRoomId(data.roomId);
      setPlayerId(data.playerId);
      setYourRole(data.playerRole);
      setYourNickname(data.nickname);
      setPhase('lobby');
    } catch {
      setError('Failed to create room');
      setPhase('error');
    }
  }, [nickname]);

  const joinRoom = useCallback(async (code: string) => {
    setPhase('joining-room');
    try {
      const res = await fetch('/api/online/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: code, nickname }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to join room');
        setPhase('error');
        return;
      }
      setRoomId(code.toUpperCase().trim());
      setPlayerId(data.playerId);
      setYourRole(data.playerRole);
      setYourNickname(data.nickname);
      setPhase('playing');
      // Fetch full state immediately so nicknames are available
      setTimeout(async () => {
        const stateRes = await fetch(`/api/online/room/state?roomId=${code.toUpperCase().trim()}&playerId=${data.playerId}`);
        if (stateRes.ok) {
          const stateData = await stateRes.json();
          if (stateData.yourNickname) setYourNickname(stateData.yourNickname);
          if (stateData.opponentNickname) setOpponentNickname(stateData.opponentNickname);
        }
      }, 0);
    } catch {
      setError('Failed to join room');
      setPhase('error');
    }
  }, [nickname]);

  const enterQueue = useCallback(async () => {
    try {
      const res = await fetch('/api/online/queue/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });
      const data = await res.json();
      if (data.matched && data.matchResult) {
        setRoomId(data.matchResult.roomId);
        setPlayerId(data.matchResult.playerId);
        setYourRole(data.matchResult.playerRole);
        setPhase('matched');
      } else {
        setQueueId(data.queueId);
        setPhase('in-queue');
      }
    } catch {
      setError('Failed to enter queue');
      setPhase('error');
    }
  }, [nickname]);

  const exitQueue = useCallback(async () => {
    if (queueId) {
      await fetch('/api/online/queue/exit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueId }),
      });
    }
    setPhase('select-mode');
    setQueueId(null);
  }, [queueId]);

  const makeMove = useCallback(async (index: number) => {
    if (yourRole !== currentPlayer || !roomId || !playerId) return;

    // Optimistic update
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

  const restart = useCallback(async () => {
    if (!roomId || !playerId) return;
    try {
      const res = await fetch('/api/online/room/restart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.waitingForOpponent) {
          setRestartRequestedBy(yourRole);
        } else {
          setSquares(Array(9).fill(null));
          setCurrentPlayer('X');
          setWinner(null);
          setRestartRequestedBy(null);
        }
      }
    } catch {
      // Retry on next action
    }
  }, [roomId, playerId]);

  const exit = useCallback(() => {
    if (roomId && playerId) {
      navigator.sendBeacon(
        '/api/online/room/disconnect',
        JSON.stringify({ roomId, playerId }),
      );
    }
    setPhase('select-mode');
    setRoomId(null);
    setPlayerId(null);
    setYourRole(null);
    setSquares(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setOpponentConnected(true);
    setOpponentNickname('');
    setYourNickname('');
    setQueueId(null);
    setError(null);
    setRestartRequestedBy(null);
  }, []);

  return {
    phase,
    roomId,
    yourRole,
    squares,
    currentPlayer,
    winner,
    opponentConnected,
    yourNickname,
    opponentNickname,
    error,
    restartRequestedBy,
    createRoom,
    joinRoom,
    enterQueue,
    exitQueue,
    makeMove,
    restart,
    exit,
  };
};
