"use client";

import { redirect } from "next/navigation";
import Home from "../../components/Home";
import DifficultySelect from "../../components/DifficultySelect";
import PlayerSelect from "../../components/PlayerSelect";
import GameStatus from "../../components/GameStatus";
import Board from "../../components/Board";
import GameActions from "../../components/GameActions";
import { useSinglePlayerGame } from "../../hooks/useSinglePlayerGame";

const SinglePlayerPage = () => {
  const {
    squares,
    currentPlayer,
    winner,
    makeMove,
    restart,
    difficultySelected,
    playerSelected,
    selectDifficulty,
    selectPlayer,
  } = useSinglePlayerGame();

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
          <Board squares={squares} onSquareClick={makeMove} winner={winner} />
          <GameActions onRestart={restart} onExit={() => redirect("/")} />
        </div>
      )}
    </div>
  );
};

export default SinglePlayerPage;
