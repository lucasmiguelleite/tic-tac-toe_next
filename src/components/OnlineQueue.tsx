'use client';

import { useSettings } from '@/context/SettingsContext';

const OnlineQueue = ({ onCancel }: { onCancel: () => void }) => {
  const { t } = useSettings();
  return (
    <div className="relative">
      <div className="static grid grid-cols-1 mx-10 h-max md:mt-52">
        <div className="inline-flex justify-center mb-10">
          <p className="font-bold text-4xl text-center">{t('online.findingOpponent')}</p>
        </div>
        <div className="flex justify-center mb-12">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        <div className="flex justify-center mb-4">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <button
            onClick={onCancel}
            className="border border-gray-300 dark:border-gray-600 rounded-full text-center w-28 h-12 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500"
          >
            <p className="font-bold">{t('online.cancel')}</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnlineQueue;
