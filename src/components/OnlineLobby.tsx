'use client';

import { useState } from 'react';

const OnlineLobby = ({ roomId, onCancel }: { roomId: string; onCancel: () => void }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div className="static grid grid-cols-1 mx-10 h-max md:mt-52">
        <div className="inline-flex justify-center">
          <p className="font-bold text-3xl mb-8 text-center">Share this code with your friend:</p>
        </div>
        <div className="flex justify-center mb-8">
          <p className="font-bold text-6xl tracking-[0.3em] select-all">{roomId}</p>
        </div>
        <div className="flex justify-center mb-8">
          <button
            onClick={copyCode}
            className="border border-gray-300 dark:border-gray-600 rounded-full text-center w-40 h-12 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500"
          >
            <p className="font-bold">{copied ? 'Copied!' : 'Copy Code'}</p>
          </button>
        </div>
        <div className="flex justify-center">
          <p className="text-xl text-gray-500 dark:text-gray-400 animate-pulse">Waiting for opponent...</p>
        </div>
        <div className="flex justify-center mt-8">
          <button
            onClick={onCancel}
            className="border border-gray-300 dark:border-gray-600 rounded-full text-center w-28 h-10 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500"
          >
            <p className="font-bold">Cancel</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnlineLobby;
