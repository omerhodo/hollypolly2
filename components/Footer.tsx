'use client';

import { useTranslations } from 'next-intl';
import React from 'react';

export const Footer: React.FC = () => {
  const t = useTranslations('footer');

  return (
    <footer
      className="fixed left-0 right-0 bottom-0 bg-gray-800 text-white py-3 px-4 z-40"
    >
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm">
          {t('createdBy')}{' '}
          <a
            href="https://www.xhodo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:text-primary-300 hover:underline transition-colors"
          >
            {t('authorName')}
          </a>
        </p>
      </div>
    </footer>
  );
};
