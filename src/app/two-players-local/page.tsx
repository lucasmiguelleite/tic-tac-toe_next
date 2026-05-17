"use client";

import { useEffect, useRef } from "react";
import { redirect } from "next/navigation";
import Home from "../../components/Home";
import GameStatus from "../../components/GameStatus";
import Board from "../../components/Board";
import GameActions from "../../components/GameActions";
import { useGameState } from "../../hooks/useGameState";
import { getWinLine } from "../../domain/gameEngine";
import { playWin, playDraw } from "../../utils/sounds";
import { GameResult } from "../../domain/types";

const TwoPlayersPage = () => {
  const { squares, currentPlayer, winner, makeMove, restart } = useGameState();
  const prevWinnerRef = useRef<GameResult>(null);

  useEffect(() => {
    if (winner && winner !== prevWinnerRef.current) {
      winner === 'BOTH' ? playDraw() : playWin();
    }
    prevWinnerRef.current = winner;
  }, [winner]);

  return (
    <div>
      <Home />
      <div className="flex flex-col">
        <GameStatus winner={winner} currentPlayer={currentPlayer} />
        <Board squares={squares} onSquareClick={makeMove} winner={winner} winLine={getWinLine(squares)} winnerPlayer={winner as 'X' | 'O' | null} />
        <GameActions onRestart={restart} onExit={() => redirect("/")} />
      </div>
    </div>
  );
};

export default TwoPlayersPage;
