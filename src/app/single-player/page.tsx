"use client";

import { redirect } from "next/navigation";
import Home from "../../components/Home";
import DifficultySelect from "../../components/DifficultySelect";
import PlayerSelect from "../../components/PlayerSelect";
import { LocalGameStatus as GameStatus } from "../../components/GameStatus";
import { LocalBoard as Board } from "../../components/Board";
import GameActions from "../../components/GameActions";
import { useSinglePlayerGame } from "../../hooks/useSinglePlayerGame";
import { useGameSounds } from "../../hooks/useGameSounds";
import { getWinLine } from "../../domain/gameEngine";
import { playExitWarning } from "../../utils/sounds";

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

  useGameSounds({ squares, winner, playerRole: player });

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
