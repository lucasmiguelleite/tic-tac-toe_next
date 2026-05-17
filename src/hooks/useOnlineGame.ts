'use client';

import { useState, useEffect, useCallback } from 'react';
import { OnlinePhase, Player } from '@/domain/types';
import { useOnlineRoom } from './useOnlineRoom';
import { useOnlineQueue } from './useOnlineQueue';
import { useOnlineConnection } from './useOnlineConnection';

export const useOnlineGame = (nickname?: string) => {
  const [phase, setPhase] = useState<OnlinePhase>('select-mode');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const room = useOnlineRoom(roomId, playerId);
  const queue = useOnlineQueue();
  const { disconnect } = useOnlineConnection(roomId, playerId);

  // Poll game state when playing
  useEffect(() => {
    if (phase !== 'playing' || !roomId || !playerId) return;
    return room.pollGameState(
      () => setPhase('opponent-disconnected'),
      () => { setError('Room expired'); setPhase('error'); },
    );
  }, [phase, roomId, playerId, room.pollGameState]);

  // Poll lobby state
  useEffect(() => {
    if (phase !== 'lobby' || !roomId || !playerId) return;
    return room.pollLobby((data) => {
      if ((data as Record<string, unknown>).yourNickname) room.setInitialRoomState(room.yourRole || 'X', room.yourNickname, data as Record<string, unknown>);
      setPhase('playing');
    });
  }, [phase, roomId, playerId, room.pollLobby, room.setInitialRoomState, room.yourRole, room.yourNickname]);

  // Poll queue
  useEffect(() => {
    if (phase !== 'in-queue' || !queue.queueId) return;
    return queue.pollQueue(
      queue.queueId,
      (rId, pId, role) => { setRoomId(rId); setPlayerId(pId); room.setInitialRoomState(role, nickname || ''); setPhase('matched'); },
      () => { setError('Queue timed out. Please try again.'); setPhase('error'); },
    );
  }, [phase, queue.queueId, queue.pollQueue, room.setInitialRoomState, nickname]);

  // Matched → playing transition
  useEffect(() => {
    if (phase !== 'matched') return;
    room.fetchState();
    const timeout = setTimeout(() => setPhase('playing'), 2000);
    return () => clearTimeout(timeout);
  }, [phase, room.fetchState]);

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
      const rid = code.toUpperCase().trim();
      setRoomId(rid);
      setPlayerId(data.playerId);
      room.setInitialRoomState(data.playerRole, data.nickname);
      setPhase('playing');
      // Fetch full state immediately so nicknames are available
      setTimeout(async () => {
        const stateRes = await fetch(`/api/online/room/state?roomId=${rid}&playerId=${data.playerId}`);
        if (stateRes.ok) room.applyState(await stateRes.json());
      }, 0);
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
    createRoom, joinRoom, enterQueue,
    exitQueue: exitQueueAction,
    makeMove: room.makeMove,
    restart, exit,
  };
};
