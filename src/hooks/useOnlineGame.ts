'use client';

import { useState, useEffect, useCallback } from 'react';
import { OnlinePhase, Player } from '@/domain/types';
import { fetchWithRetry } from '@/utils/fetchWithRetry';
import { useOnlineRoom } from './useOnlineRoom';
import { useOnlineQueue } from './useOnlineQueue';
import { useOnlineConnection } from './useOnlineConnection';
import { useOnlineRealtime } from './useOnlineRealtime';

export const useOnlineGame = (nickname?: string) => {
  const [phase, setPhase] = useState<OnlinePhase>('select-mode');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const room = useOnlineRoom(roomId, playerId);
  const queue = useOnlineQueue();
  const { disconnect } = useOnlineConnection(roomId, playerId);

  const realtimeSend = useOnlineRealtime(
    roomId,
    playerId,
    phase === 'lobby' || phase === 'playing',
    (state) => {
      room.applyState(state);
      if (state.roomStatus === 'playing' && phase === 'lobby') setPhase('playing');
      if (state.roomStatus === 'playing' && state.opponentConnected === false) setPhase('opponent-disconnected');
    },
  );
  useEffect(() => {
    room.setRealtimeSend(realtimeSend);
    return () => room.setRealtimeSend(null);
  }, [room.setRealtimeSend, realtimeSend]);

  // Poll queue
  useEffect(() => {
    if (phase !== 'in-queue' || !queue.queueId) return;
    return queue.pollQueue(
      queue.queueId,
      (rId, pId, role) => { setRoomId(rId); setPlayerId(pId); room.setInitialRoomState(role, nickname || ''); setPhase('matched'); },
      () => { setError('Queue timed out. Please try again.'); setPhase('error'); },
    );
  }, [phase, queue.queueId, queue.pollQueue, room.setInitialRoomState, nickname]);

  // Matched → playing transition; the socket delivers the initial state.
  useEffect(() => {
    if (phase !== 'matched') return;
    let cancelled = false;
    const minDelay = new Promise<void>((r) => setTimeout(r, 300));
    minDelay.then(() => {
      if (!cancelled) setPhase('playing');
    });
    return () => { cancelled = true; };
  }, [phase, room.fetchState]);

  const createRoom = useCallback(async () => {
    setPhase('creating-room');
    try {
      const res = await fetchWithRetry('/api/online/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });
      const data = await res.json();
      setRoomId(data.roomId);
      setPlayerId(data.playerId);
      room.setInitialRoomState(data.playerRole, data.nickname);
      setPhase('lobby');
    } catch {
      setError('Failed to create room');
      setPhase('error');
    }
  }, [nickname, room.setInitialRoomState]);

  const joinRoom = useCallback(async (code: string) => {
    setPhase('joining-room');
    try {
      const res = await fetchWithRetry('/api/online/room/join', {
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
      const rid = code.toUpperCase().trim();
      setRoomId(rid);
      setPlayerId(data.playerId);
      room.setInitialRoomState(data.playerRole, data.nickname);
      setPhase('playing');
    } catch {
      setError('Failed to join room');
      setPhase('error');
    }
  }, [nickname, room.setInitialRoomState, room.applyState]);

  const enterQueue = useCallback(async () => {
    await queue.enterQueue(
      nickname,
      (rId, pId, role) => { setRoomId(rId); setPlayerId(pId); room.setInitialRoomState(role, nickname || ''); setPhase('matched'); },
      (qId) => setPhase('in-queue'),
    );
  }, [nickname, queue.enterQueue, room.setInitialRoomState]);

  const exitQueueAction = useCallback(async () => {
    await queue.exitQueue(queue.queueId);
    setPhase('select-mode');
  }, [queue.exitQueue, queue.queueId]);

  const restart = useCallback(async () => {
    await room.restart(room.yourRole);
  }, [room.restart, room.yourRole]);

  const exit = useCallback(() => {
    disconnect();
    setPhase('select-mode');
    setRoomId(null);
    setPlayerId(null);
    setError(null);
    room.resetRoom();
  }, [disconnect, room.resetRoom]);

  return {
    phase, roomId, error,
    yourRole: room.yourRole,
    squares: room.squares,
    currentPlayer: room.currentPlayer,
    winner: room.winner,
    opponentConnected: room.opponentConnected,
    yourNickname: room.yourNickname,
    opponentNickname: room.opponentNickname,
    restartRequestedBy: room.restartRequestedBy,
    createdAt: room.createdAt,
    connectionStatus: room.connectionStatus,
    createRoom, joinRoom, enterQueue,
    exitQueue: exitQueueAction,
    makeMove: room.makeMove,
    restart, exit,
  };
};
