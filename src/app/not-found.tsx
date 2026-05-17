'use client'
import { redirect } from "next/navigation"
import { useTranslation } from "@/context/SettingsContext";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className='font-bold text-4xl my-10 text-center'>{t('notFound.title')}</h1>
      <div className='flex flex-nowrap justify-center'>
        <button className='border border-gray-300 dark:border-gray-600 rounded-full mr-2 mb-2 text-center w-52 h-16 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500' onClick={() => redirect("/")}>{t('notFound.goBack')}</button>
      </div>
  </div>
  );
}
