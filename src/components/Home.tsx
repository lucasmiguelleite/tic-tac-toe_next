'use client';

import { useSettings } from '@/context/SettingsContext';

const Home = () => {
  const { t } = useSettings();
  return (
    <div className="my-10 md:mx-10 mx-2 cursor-default">
      <h1 className="font-bold text-6xl text-center md:text-left">
        {t('site.title')}
      </h1>
    </div>
  );
};

export default Home;
