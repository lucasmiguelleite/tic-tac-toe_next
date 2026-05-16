import { GameResult, Player } from '@/domain/types';

const GameStatus = ({ winner, currentPlayer }: { winner: GameResult; currentPlayer: Player }) => (
  <div className="flex justify-center text-center my-10 mx-10">
    {!winner && <p className="font-bold text-4xl">It&apos;s {currentPlayer} turn</p>}
    {winner && winner !== 'BOTH' && <p className="font-bold text-4xl">Player {winner} is the winner</p>}
    {winner === 'BOTH' && <p className="font-bold text-4xl">Draw</p>}
  </div>
);

export default GameStatus;
