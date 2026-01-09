'use client';

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white py-3 px-4 z-40">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm">
          Created By{' '}
          <a
            href="https://www.xhodo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:text-primary-300 hover:underline transition-colors"
          >
            Ömer Hodo
          </a>
        </p>
      </div>
    </footer>
  );
};
