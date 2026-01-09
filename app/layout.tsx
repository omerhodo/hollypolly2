import { RoomProvider } from '@/contexts/RoomContext';
import { UserProvider } from '@/contexts/UserContext';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import './globals.css';

export const metadata: Metadata = {
  title: 'HollyPolly - Gerçek Zamanlı Kura Çekme',
  description: 'Arkadaşlarınızla birlikte kura çekin!',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <html lang="tr">
      <body>
        <NextIntlClientProvider messages={messages}>
          <UserProvider>
            <RoomProvider>
              {children}
            </RoomProvider>
          </UserProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
