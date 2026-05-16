"use client";

import { redirect } from "next/navigation";
import Home from "../../components/Home";
import GameStatus from "../../components/GameStatus";
import Board from "../../components/Board";
import GameActions from "../../components/GameActions";
import { useGameState } from "../../hooks/useGameState";

const TwoPlayersPage = () => {
  const { squares, currentPlayer, winner, makeMove, restart } = useGameState();

  return (
    <div>
      <Home />
      <div className="flex flex-col">
        <GameStatus winner={winner} currentPlayer={currentPlayer} />
        <Board squares={squares} onSquareClick={makeMove} winner={winner} />
        <GameActions onRestart={restart} onExit={() => redirect("/")} />
      </div>
    </div>
  );
};

export default TwoPlayersPage;
