"use client";

import { redirect } from "next/navigation";
import Home from "../../components/Home";
import { LocalGameStatus as GameStatus } from "../../components/GameStatus";
import { LocalBoard as Board } from "../../components/Board";
import GameActions from "../../components/GameActions";
import { useGameState } from "../../hooks/useGameState";
import { useGameSounds } from "../../hooks/useGameSounds";
import { getWinLine } from "../../domain/gameEngine";
import { playExitWarning } from "../../utils/sounds";

const TwoPlayersPage = () => {
  const { squares, currentPlayer, winner, makeMove, restart } = useGameState();

  useGameSounds({ squares, winner });

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
