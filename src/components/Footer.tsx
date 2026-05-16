'use client';

import { useSettings } from '@/context/SettingsContext';

const Footer = () => {
  const { t } = useSettings();
  return (
    <div className="relative bottom-0 mt-12 mb-2 w-full flex flex-row justify-center self-end text-sm text-gray-500 dark:text-gray-400">
      <p>
        {t('footer.developedBy')}{' '}
        <a
          className="text-blue-700 dark:text-blue-400 hover:underline"
          href="https://github.com/lucasmiguelleite"
        >
          Lucas
        </a>
      </p>
    </div>
  );
};

export default Footer;
