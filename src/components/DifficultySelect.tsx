import { Difficulty } from '@/domain/types';

const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

const DifficultySelect = ({ onSelect }: { onSelect: (d: Difficulty) => void }) => (
  <div className="relative">
    <div className="static grid grid-cols-1 mx-10 h-max md:mt-52">
      <div className="inline-flex justify-center">
        <p className="font-bold text-4xl mb-10 text-center">Select the difficulty:</p>
      </div>
      <div className="flex flex-wrap md:flex-nowrap justify-center mb-12">
        {difficulties.map((d) => (
          <button
            key={d}
            onClick={() => onSelect(d)}
            className="border border-gray-300 dark:border-gray-600 rounded-full mr-2 mb-2 md:mb-0 text-center w-52 h-20 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500"
          >
            <p className="font-bold text-2xl">{d.charAt(0).toUpperCase() + d.slice(1)}</p>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default DifficultySelect;
