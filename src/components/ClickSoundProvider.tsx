'use client';

import { useEffect } from 'react';
import { playClick } from '@/utils/sounds';

export default function ClickSoundProvider() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('button');
      if (btn && !btn.disabled) {
        playClick();
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return null;
}
