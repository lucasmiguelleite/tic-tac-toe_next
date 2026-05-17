"use client";

import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";

const OnlineMatchmaking = ({
  onCreateRoom,
  onEnterQueue,
  onJoinRoom,
  onBack,
}: {
  onCreateRoom: () => void;
  onEnterQueue: () => void;
  onJoinRoom: (code: string) => void;
  onBack: () => void;
}) => {
  const { t } = useSettings();
  const [showJoin, setShowJoin] = useState(false);
  const [code, setCode] = useState("");

  if (showJoin) {
    return (
      <div className="relative">
        <div className="static grid grid-cols-1 mx-10 h-max md:mt-52">
          <div className="inline-flex justify-center">
            <p className="font-bold text-4xl mb-10 text-center">
              {t("online.enterCode")}
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder={t("notFound.roomCodePlaceholder")}
              className="text-4xl font-bold text-center w-52 h-16 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={() => code.length === 6 && onJoinRoom(code)}
              disabled={code.length !== 6}
              className="border border-gray-300 dark:border-gray-600 rounded-full text-center w-64 h-16 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <p className="font-bold text-2xl">{t("online.join")}</p>
            </button>
            <button
              onClick={() => setShowJoin(false)}
              className="border border-gray-300 dark:border-gray-600 rounded-full text-center w-64 h-16 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500"
            >
              <p className="font-bold text-2xl">{t("online.back")}</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="static grid grid-cols-1 mx-10 h-max md:mt-52">
        <div className="inline-flex justify-center">
          <p className="font-bold text-4xl mb-10 text-center">
            {t("online.title")}
          </p>
        </div>
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onEnterQueue}
            className="border border-gray-300 dark:border-gray-600 rounded-full text-center w-64 h-16 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500"
          >
            <p className="font-bold text-2xl">{t("online.quickMatch")}</p>
          </button>
          <button
            onClick={onCreateRoom}
            className="border border-gray-300 dark:border-gray-600 rounded-full text-center w-64 h-16 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500"
          >
            <p className="font-bold text-2xl">{t("online.createRoom")}</p>
          </button>
          <button
            onClick={() => setShowJoin(true)}
            className="border border-gray-300 dark:border-gray-600 rounded-full text-center w-64 h-16 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500"
          >
            <p className="font-bold text-2xl">{t("online.joinRoom")}</p>
          </button>
          <button
            onClick={onBack}
            className="border border-gray-300 dark:border-gray-600 rounded-full text-center w-64 h-16 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500"
          >
            <p className="font-bold text-2xl">{t("online.back")}</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnlineMatchmaking;
