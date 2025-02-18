'use client'
import { useEffect, useState } from "react";
import Square from "../components/Square";
import { Player } from "@/types/Player";
import { redirect } from "next/navigation";

const calculateWinner = (squares: Player[]) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  // verify all of the win possibilities
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

const Board = () => {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<Player>(null);

  // reset the actual game state to the game start
  const restart = () => {
    setSquares(Array(9).fill(null));
    setWinner(null);
    setCurrentPlayer('X');
  }

  // exit actual game
  const exit = () => {
    redirect("/");
  }

  // handle the board click and change the player turn
  const setSquaresValue = (index: number) => {
    const newData = squares.map((val, i) => {
      if (i === index) {
        return currentPlayer;
      }
      return val;
    });
    setSquares(newData);
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  }

  useEffect(() => {
    const winner = calculateWinner(squares);
    if (winner) {
      setWinner(winner);
    }

    if (!winner && !squares.filter((square) => !square).length) {
      setWinner("BOTH");
    }
  }, [squares]);

  return (
      <div className="flex flex-col">
        <div className="flex justify-center text-center my-10 mx-10">
          {!winner && <p className="font-bold text-4xl">It&apos;s {currentPlayer} turn</p>}
          {winner && winner !== 'BOTH' && <p className="font-bold text-4xl">Player {winner} is the winner</p>}
          {winner && winner === 'BOTH' && (
            <p className="font-bold text-4xl">Draw</p>
            )}
        </div>
        <div className="flex justify-center min-w-max">
          <div className="grid gap-1 grid-cols-3 mb-5">
            {Array(9)
              .fill(null)
              .map((_, i) => {
                return (
                  <Square
                    winner={winner}
                    key={i}
                    onClick={() => setSquaresValue(i)}
                    value={squares[i]}
                    currentPlayer={currentPlayer}
                  />
                );
              })}
          </div>
        </div>
        <div className="flex flex-wrap md:flex-nowrap justify-center ">
          <button className="border-0 border-black w-40 mt-3 mx-2 text-4xl bg-blue-200 hover:bg-blue-400 rounded-md p-1 cursor-pointer" onClick={restart}>Restart Game</button>
          <button className="border-0 border-black w-40 mt-3 mx-2 text-4xl bg-blue-200 hover:bg-blue-400 rounded-md p-1 cursor-pointer" onClick={exit}>Exit Game</button>
        </div>
      </div>
  )
}

export default Board;