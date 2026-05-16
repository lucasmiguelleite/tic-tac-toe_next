'use client';

import { useState } from 'react';
import { redirect } from 'next/navigation';
import Home from '../../components/Home';
import GameStatus from '../../components/GameStatus';
import Board from '../../components/Board';
import OnlineGameActions from '../../components/OnlineGameActions';
import OnlineMatchmaking from '../../components/OnlineMatchmaking';
import OnlineLobby from '../../components/OnlineLobby';
import OnlineQueue from '../../components/OnlineQueue';
import { useOnlineGame } from '../../hooks/useOnlineGame';

const OnlinePage = () => {
  const [nickname, setNickname] = useState('');
  const [nicknameSet, setNicknameSet] = useState(false);
  const game = useOnlineGame(nicknameSet ? nickname : undefined);

  if (!nicknameSet) {
    return (
      <div>
        <Home />
        <div className="relative">
          <div className="static grid grid-cols-1 mx-10 h-max md:mt-40">
            <div className="inline-flex justify-center">
              <p className="font-bold text-4xl mb-10 text-center">Choose your nickname:</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                placeholder="Your nickname (optional)"
                className="text-2xl font-bold text-center w-72 h-14 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onKeyDown={(e) => e.key === 'Enter' && setNicknameSet(true)}
              />
              <button
                onClick={() => setNicknameSet(true)}
                className="border border-gray-300 dark:border-gray-600 rounded-full text-center w-40 h-12 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500"
              >
                <p className="font-bold">Continue</p>
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
          <p className="font-bold text-5xl mb-6 animate-bounce">Match found!</p>
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
            <p className="font-bold">Try Again</p>
          </button>
        </div>
      )}
    </div>
  );
};

export default OnlinePage;
