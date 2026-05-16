"use client";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";

export default function Home() {
  const router = useRouter();
  const { t } = useSettings();

  return (
    <div>
      <div className="relative">
        <div className="text-center my-20">
          <h1 className="font-bold text-6xl">{t('site.title')}</h1>
        </div>
        <div className="grid grid-cols-1 p-10 mt-20 align-middle">
          <div className="flex justify-center">
            <h1 className="font-bold text-4xl text-center mb-10">
              {t('home.selectOption')}
            </h1>
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex justify-center mb-5">
              <button
                onClick={() => router.push("/single-player")}
                className="border border-gray-300 dark:border-gray-600 rounded-full mr-2 text-center w-52 h-12 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500 "
              >
                <p className="font-bold">{t('home.singlePlayer')}</p>
              </button>
            </div>
            <div className="flex justify-center mb-5">
              <button
                onClick={() => router.push("/two-players-local")}
                className="border border-gray-300 dark:border-gray-600 rounded-full mr-2 text-center w-52 h-12 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500 "
              >
                <p className="font-bold">{t('home.multiplayerLocal')}</p>
              </button>
            </div>
            <div className="flex justify-center mb-5">
              <button
                onClick={() => router.push("/online")}
                className="border border-gray-300 dark:border-gray-600 rounded-full mr-2 text-center w-52 h-12 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500 "
              >
                <p className="font-bold">{t('home.onlineMultiplayer')}</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
