import { Player } from '@/domain/types';

const players: Player[] = ['X', 'O'];

const PlayerSelect = ({ onSelect }: { onSelect: (p: Player) => void }) => (
  <div className="relative">
    <div className="static grid grid-cols-1 mx-10 h-max md:mt-52">
      <div className="inline-flex justify-center">
        <p className="font-bold text-4xl mb-10 text-center">Select the player:</p>
      </div>
      <div className="inline-flex columns-xs justify-center mb-12">
        {players.map((p) => (
          <button
            key={p}
            onClick={() => onSelect(p)}
            className="border border-gray-300 dark:border-gray-600 rounded-full mr-2 text-center w-52 h-20 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500"
          >
            <p className="font-bold text-2xl">{p}</p>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default PlayerSelect;
