'use client';

import { useState, useEffect, useCallback } from 'react';
import { OnlinePhase } from '@/domain/types';
import { onlineApi } from '@/utils/onlineApi';
import { useOnlineRoom } from './useOnlineRoom';
import { useOnlineQueue } from './useOnlineQueue';
import { useOnlineConnection } from './useOnlineConnection';
import { useOnlineRealtime } from './useOnlineRealtime';
import { useOnlineQueueRealtime } from './useOnlineQueueRealtime';

export const useOnlineGame = (nickname?: string) => {
  const [phase, setPhase] = useState<OnlinePhase>('select-mode');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const room = useOnlineRoom(roomId, playerId);
  const queue = useOnlineQueue();
  const { disconnect } = useOnlineConnection(roomId, playerId);
  const { applyState, setRealtimeSend, pollLobby, pollGameState, fetchState, setInitialRoomState, resetRoom, restart: restartRoom } = room;
  const { enterQueue: enterQueueRequest, exitQueue: exitQueueRequest, pollQueue, queueId } = queue;

  const realtimeSend = useOnlineRealtime(
    roomId,
    playerId,
    phase === 'lobby' || phase === 'playing',
    (state) => {
      applyState(state);
      if (state.roomStatus === 'playing' && phase === 'lobby') setPhase('playing');
      if (state.roomStatus === 'playing' && state.opponentConnected === false) setPhase('opponent-disconnected');
    },
  );
  useEffect(() => {
    setRealtimeSend(realtimeSend);
    return () => setRealtimeSend(null);
  }, [setRealtimeSend, realtimeSend]);

  useOnlineQueueRealtime(queueId, phase === 'in-queue', (rId, pId, role) => {
    setRoomId(rId); setPlayerId(pId); setInitialRoomState(role, nickname || ''); setPhase('matched');
  });

  // WebSocket is the fast path; polling is deliberately kept alive as the
  // authoritative recovery path for proxies, browsers, or deployments where
  // a socket cannot be established or is silently dropped.
  useEffect(() => {
    if (phase !== 'lobby') return;
    return pollLobby((state) => {
      applyState(state);
      setPhase('playing');
    });
  }, [phase, pollLobby, applyState]);

  useEffect(() => {
    if (phase !== 'playing') return;
    return pollGameState(
      () => setPhase('opponent-disconnected'),
      () => { setError('Room expired'); setPhase('error'); },
    );
  }, [phase, pollGameState]);

  useEffect(() => {
    if (phase !== 'in-queue') return;
    return pollQueue(
      queueId,
      (rId, pId, role) => { setRoomId(rId); setPlayerId(pId); setInitialRoomState(role, nickname || ''); setPhase('matched'); },
      () => { setError('Queue entry expired'); setPhase('error'); },
    );
  }, [phase, pollQueue, queueId, setInitialRoomState, nickname]);

  // Matched → playing transition; the socket delivers the initial state.
  useEffect(() => {
    if (phase !== 'matched') return;
    let cancelled = false;
    const minDelay = new Promise<void>((r) => setTimeout(r, 300));
    minDelay.then(() => {
      if (!cancelled) setPhase('playing');
    });
    return () => { cancelled = true; };
  }, [phase, fetchState]);

  const createRoom = useCallback(async () => {
    setPhase('creating-room');
    try {
      const { data } = await onlineApi.createRoom(nickname);
      setRoomId(data.roomId);
      setPlayerId(data.playerId);
      setInitialRoomState(data.playerRole, data.nickname);
      setPhase('lobby');
    } catch {
      setError('Failed to create room');
      setPhase('error');
    }
  }, [nickname, setInitialRoomState]);

  const joinRoom = useCallback(async (code: string) => {
    setPhase('joining-room');
    try {
      const { response: res, data } = await onlineApi.joinRoom(code, nickname);
      if (!res.ok) {
        setError(data.error || 'Failed to join room');
        setPhase('error');
        return;
      }
      const rid = code.toUpperCase().trim();
      setRoomId(rid);
      setPlayerId(data.playerId);
      setInitialRoomState(data.playerRole, data.nickname);
      setPhase('playing');
    } catch {
      setError('Failed to join room');
      setPhase('error');
    }
  }, [nickname, setInitialRoomState]);

  const enterQueue = useCallback(async () => {
    await enterQueueRequest(
      nickname,
      (rId, pId, role) => { setRoomId(rId); setPlayerId(pId); setInitialRoomState(role, nickname || ''); setPhase('matched'); },
      () => setPhase('in-queue'),
    );
  }, [nickname, enterQueueRequest, setInitialRoomState]);

  const exitQueueAction = useCallback(async () => {
    await exitQueueRequest(queueId);
    setPhase('select-mode');
  }, [exitQueueRequest, queueId]);

  const restart = useCallback(async () => {
    await restartRoom(room.yourRole);
  }, [restartRoom, room.yourRole]);

  const exit = useCallback(() => {
    disconnect();
    setPhase('select-mode');
    setRoomId(null);
    setPlayerId(null);
    setError(null);
    resetRoom();
  }, [disconnect, resetRoom]);

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
