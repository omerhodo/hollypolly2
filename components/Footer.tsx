'use client';

import { useTranslations } from 'next-intl';
import React from 'react';

/**
 * Footer component – designed for Capacitor iOS/Android WebView.
 *
 * Uses flex-layout anchoring (shrink-0) instead of position:fixed
 * to avoid two iOS WebView bugs:
 *   1) Fixed-bottom elements can be hidden behind the native AdMob banner.
 *   2) Fixed elements "jump" when the iOS safe-area inset reveals on overscroll.
 *
 * Text color is forced via inline style + -webkit-text-fill-color
 * to guarantee visibility in WKWebView regardless of CSS cascade.
 */
export const Footer: React.FC = () => {
  const t = useTranslations('footer');

  return (
    <footer
      className="shrink-0 w-full py-3 px-4"
      style={{
        backgroundColor: '#1f2937',
        color: '#ffffff',
        WebkitTextFillColor: '#ffffff',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
      }}
    >
      <div className="max-w-7xl mx-auto text-center">
        <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>
          {t('createdBy')}{' '}
          <a
            href="https://www.xhodo.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('authorName')}
          </a>
        </p>
      </div>
    </footer>
  );
};
