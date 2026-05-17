"use client";

import { useEffect, useRef } from "react";
import { redirect } from "next/navigation";
import Home from "../../components/Home";
import DifficultySelect from "../../components/DifficultySelect";
import PlayerSelect from "../../components/PlayerSelect";
import GameStatus from "../../components/GameStatus";
import Board from "../../components/Board";
import GameActions from "../../components/GameActions";
import { useSinglePlayerGame } from "../../hooks/useSinglePlayerGame";
import { getWinLine } from "../../domain/gameEngine";
import { playWin, playLose } from "../../utils/sounds";
import { GameResult } from "../../domain/types";

const SinglePlayerPage = () => {
  const {
    squares,
    currentPlayer,
    winner,
    player,
    makeMove,
    restart,
    difficultySelected,
    playerSelected,
    selectDifficulty,
    selectPlayer,
  } = useSinglePlayerGame();
  const prevWinnerRef = useRef<GameResult>(null);

  useEffect(() => {
    if (winner && winner !== 'BOTH' && winner !== prevWinnerRef.current) {
      winner === player ? playWin() : playLose();
    }
    prevWinnerRef.current = winner;
  }, [winner, player]);

  return (
    <div>
      <Home />
      {!difficultySelected ? (
        <DifficultySelect onSelect={selectDifficulty} />
      ) : !playerSelected ? (
        <PlayerSelect onSelect={selectPlayer} />
      ) : (
        <div className="flex flex-col">
          <GameStatus winner={winner} currentPlayer={currentPlayer} />
          <Board squares={squares} onSquareClick={makeMove} winner={winner} winLine={getWinLine(squares)} winnerPlayer={winner as 'X' | 'O' | null} />
          <GameActions onRestart={restart} onExit={() => redirect("/")} />
        </div>
      )}
    </div>
  );
};

export default SinglePlayerPage;
