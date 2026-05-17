"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/context/SettingsContext";

const TTL_SECONDS = 30 * 60;

const formatCountdown = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const OnlineLobby = ({
  roomId,
  onCancel,
}: {
  roomId: string;
  onCancel: () => void;
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [remaining, setRemaining] = useState(TTL_SECONDS);

  useEffect(() => {
    const id = setInterval(() => setRemaining((r) => Math.max(r - 1, 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div className="static grid grid-cols-1 mx-10 h-max md:mt-52">
        <div className="inline-flex justify-center">
          <p className="font-bold text-3xl mb-8 text-center">
            {t("online.shareCode")}
          </p>
        </div>
        <div className="flex justify-center mb-8">
          <p className="font-bold text-4xl sm:text-6xl tracking-[0.15em] sm:tracking-[0.3em] select-all break-all text-center">
            {roomId}
          </p>
        </div>
        <div className="flex justify-center mb-8">
          <button
            onClick={copyCode}
            className="border border-gray-300 dark:border-gray-600 rounded-full text-center w-64 h-16 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500"
          >
            <p className="font-bold">
              {copied ? t("online.copied") : t("online.copyCode")}
            </p>
          </button>
        </div>
        <div className="flex justify-center">
          <p className="text-xl text-gray-500 dark:text-gray-400 animate-pulse">
            {t("online.waitingOpponent")}
          </p>
        </div>
        <div className="flex justify-center mt-3">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {t("online.roomExpires")} {formatCountdown(remaining)}
          </p>
        </div>
        <div className="flex justify-center mt-8">
          <button
            onClick={onCancel}
            className="border border-gray-300 dark:border-gray-600 rounded-full text-center w-64 h-16 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500"
          >
            <p className="font-bold">{t("online.cancel")}</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnlineLobby;
