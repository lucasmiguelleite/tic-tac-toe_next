'use client';

import { useState, useEffect, useRef } from 'react';
import { redirect } from 'next/navigation';
import Home from '../../components/Home';
import GameStatus from '../../components/GameStatus';
import Board from '../../components/Board';
import OnlineGameActions from '../../components/OnlineGameActions';
import OnlineMatchmaking from '../../components/OnlineMatchmaking';
import OnlineLobby from '../../components/OnlineLobby';
import OnlineQueue from '../../components/OnlineQueue';
import { useOnlineGame } from '../../hooks/useOnlineGame';
import { useSettings } from '../../context/SettingsContext';
import { getWinLine } from '../../domain/gameEngine';
import { playWin, playLose, playDraw, playEnterQueue, playMatchFound, playRestartVote, playDisconnect } from '../../utils/sounds';
import { GameResult, Player } from '../../domain/types';

const ROOM_TTL = 30 * 60;

const formatCountdown = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const OnlinePage = () => {
  const [nickname, setNickname] = useState('');
  const [nicknameSet, setNicknameSet] = useState(false);
  const game = useOnlineGame(nicknameSet ? nickname : undefined);
  const { t } = useSettings();
  const prevWinnerRef = useRef<GameResult>(null);
  const prevPhaseRef = useRef(game.phase);
  const prevRestartRef = useRef<Player | null>(null);
  const [roomRemaining, setRoomRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (game.createdAt) {
      const elapsed = Math.floor((Date.now() - game.createdAt) / 1000);
      setRoomRemaining(Math.max(ROOM_TTL - elapsed, 0));
    }
  }, [game.createdAt]);

  useEffect(() => {
    if (roomRemaining === null || roomRemaining <= 0) return;
    const id = setInterval(() => setRoomRemaining((r) => Math.max((r ?? 0) - 1, 0)), 1000);
    return () => clearInterval(id);
  }, [roomRemaining]);

  useEffect(() => {
    if (game.phase === 'in-queue' && prevPhaseRef.current !== 'in-queue') {
      playEnterQueue();
    }
    if (game.phase === 'matched' && prevPhaseRef.current !== 'matched') {
      playMatchFound();
    }
    if (game.phase === 'opponent-disconnected' && prevPhaseRef.current !== 'opponent-disconnected') {
      playDisconnect();
    }
    prevPhaseRef.current = game.phase;
  }, [game.phase]);

  useEffect(() => {
    if (game.winner && game.winner !== prevWinnerRef.current) {
      if (game.winner === 'BOTH') playDraw();
      else game.winner === game.yourRole ? playWin() : playLose();
    }
    prevWinnerRef.current = game.winner;
  }, [game.winner, game.yourRole]);

  useEffect(() => {
    if (game.restartRequestedBy && game.restartRequestedBy !== prevRestartRef.current) {
      playRestartVote();
    }
    prevRestartRef.current = game.restartRequestedBy;
  }, [game.restartRequestedBy]);

  if (!nicknameSet) {
    return (
      <div>
        <Home />
        <div className="relative">
          <div className="static grid grid-cols-1 mx-10 h-max md:mt-40">
            <div className="inline-flex justify-center">
              <p className="font-bold text-4xl mb-10 text-center">{t('online.chooseNickname')}</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                placeholder={t('online.nicknamePlaceholder')}
                className="text-2xl font-bold text-center w-72 h-14 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onKeyDown={(e) => e.key === 'Enter' && setNicknameSet(true)}
              />
              <button
                onClick={() => setNicknameSet(true)}
                className="border border-gray-300 dark:border-gray-600 rounded-full text-center w-40 h-12 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500"
              >
                <p className="font-bold">{t('online.continue')}</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Home />
      {game.phase === 'select-mode' && (
        <OnlineMatchmaking
          onCreateRoom={game.createRoom}
          onEnterQueue={game.enterQueue}
          onJoinRoom={game.joinRoom}
          onBack={() => { game.exit(); redirect('/'); }}
        />
      )}
      {(game.phase === 'creating-room' || game.phase === 'joining-room') && (
        <div className="flex justify-center my-40">
          <div className="w-10 h-10 border-4 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
      {game.phase === 'lobby' && game.roomId && (
        <OnlineLobby roomId={game.roomId} onCancel={game.exit} />
      )}
      {game.phase === 'in-queue' && (
        <OnlineQueue onCancel={game.exitQueue} />
      )}
      {game.phase === 'matched' && (
        <div className="flex flex-col items-center justify-center md:mt-52">
          <p className="font-bold text-5xl mb-6 animate-bounce">{t('online.matchFound')}</p>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}
      {(game.phase === 'playing' || game.phase === 'opponent-disconnected') && (
        <div className="flex flex-col">
          {roomRemaining !== null && (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-1">
              {t('online.roomExpires')} {formatCountdown(roomRemaining)}
            </p>
          )}
          <GameStatus
            winner={game.winner}
            currentPlayer={game.currentPlayer}
            yourRole={game.yourRole ?? undefined}
            opponentConnected={game.opponentConnected}
            opponentNickname={game.opponentNickname}
            yourNickname={game.yourNickname}
            waitingForOpponentRestart={game.restartRequestedBy === game.yourRole}
          />
          <Board
            squares={game.squares}
            onSquareClick={game.makeMove}
            winner={game.winner}
            isYourTurn={game.yourRole === game.currentPlayer}
            winLine={getWinLine(game.squares)}
            winnerPlayer={game.winner as 'X' | 'O' | null}
            yourRole={game.yourRole ?? undefined}
          />
          <OnlineGameActions
            onExit={() => { game.exit(); redirect('/'); }}
            showPlayAgain={Boolean(game.winner)}
            onPlayAgain={game.restart}
            restartRequestedBy={game.restartRequestedBy}
            yourRole={game.yourRole}
          />
        </div>
      )}
      {game.phase === 'error' && (
        <div className="text-center my-40">
          <p className="font-bold text-3xl text-red-500 mb-6">{game.error}</p>
          <button
            onClick={game.exit}
            className="border border-gray-300 dark:border-gray-600 rounded-full text-center w-40 h-12 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500"
          >
            <p className="font-bold">{t('online.tryAgain')}</p>
          </button>
        </div>
      )}
    </div>
  );
};

export default OnlinePage;
