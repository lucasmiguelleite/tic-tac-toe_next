"use client";

import { useEffect, useRef } from "react";
import { redirect } from "next/navigation";
import Home from "../../components/Home";
import DifficultySelect from "../../components/DifficultySelect";
import PlayerSelect from "../../components/PlayerSelect";
import { LocalGameStatus as GameStatus } from "../../components/GameStatus";
import { LocalBoard as Board } from "../../components/Board";
import GameActions from "../../components/GameActions";
import { useSinglePlayerGame } from "../../hooks/useSinglePlayerGame";
import { getWinLine } from "../../domain/gameEngine";
import { playWin, playLose, playDraw, playMove, playExitWarning } from "../../utils/sounds";
import { GameResult, BoardState } from "../../domain/types";

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
  const prevSquaresRef = useRef<BoardState>(squares);

  useEffect(() => {
    if (winner && winner !== prevWinnerRef.current) {
      if (winner === 'BOTH') playDraw();
      else winner === player ? playWin() : playLose();
    }
    prevWinnerRef.current = winner;
  }, [winner, player]);

  useEffect(() => {
    const newPlacements = squares.some((cell, i) => cell && !prevSquaresRef.current[i]);
    if (newPlacements) playMove();
    prevSquaresRef.current = squares;
  }, [squares]);

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
          <GameActions onRestart={restart} onExit={() => { playExitWarning(); redirect("/"); }} />
        </div>
      )}
    </div>
  );
};

export default SinglePlayerPage;
