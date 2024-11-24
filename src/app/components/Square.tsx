'use client'

import { Player } from "@/types/Player";

const Square = ({
  value,
  onClick,
  winner,
  currentPlayer,
}: {
  winner: Player;
  value: Player;
  onClick: () => void;
  currentPlayer: Player;
}) => {
  if (!value) {
    return (
      <button className="max-w-60 max-h-60 min-h-24 min-w-24 text-7xl text-white border border-solid border-black rounded-lg hover:text-slate-300" onClick={onClick} disabled={Boolean(winner)}>{currentPlayer}</button>
    );
  }
  return (
    <button
      className={`${value === 'X' ? "bg-green-500" : "bg-red-600"} max-w-60 max-h-60 min-h-24 min-w-24 text-7xl text-slate-200 border border-solid border-black rounded-lg`}
      disabled>{value}</button>
  );
}

export default Square;