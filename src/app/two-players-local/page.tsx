"use client";

import { useEffect, useRef } from "react";
import { redirect } from "next/navigation";
import Home from "../../components/Home";
import { LocalGameStatus as GameStatus } from "../../components/GameStatus";
import { LocalBoard as Board } from "../../components/Board";
import GameActions from "../../components/GameActions";
import { useGameState } from "../../hooks/useGameState";
import { getWinLine } from "../../domain/gameEngine";
import { playWin, playDraw, playMove, playExitWarning } from "../../utils/sounds";
import { GameResult, BoardState } from "../../domain/types";

const TwoPlayersPage = () => {
  const { squares, currentPlayer, winner, makeMove, restart } = useGameState();
  const prevWinnerRef = useRef<GameResult>(null);
  const prevSquaresRef = useRef<BoardState>(squares);

  useEffect(() => {
    if (winner && winner !== prevWinnerRef.current) {
      winner === 'BOTH' ? playDraw() : playWin();
    }
    prevWinnerRef.current = winner;
  }, [winner]);

  useEffect(() => {
    const newPlacements = squares.some((cell, i) => cell && !prevSquaresRef.current[i]);
    if (newPlacements) playMove();
    prevSquaresRef.current = squares;
  }, [squares]);

  return (
    <div>
      <Home />
      <div className="flex flex-col">
        <GameStatus winner={winner} currentPlayer={currentPlayer} />
        <Board squares={squares} onSquareClick={makeMove} winner={winner} winLine={getWinLine(squares)} winnerPlayer={winner as 'X' | 'O' | null} />
        <GameActions onRestart={restart} onExit={() => { playExitWarning(); redirect("/"); }} />
      </div>
    </div>
  );
};

export default TwoPlayersPage;
