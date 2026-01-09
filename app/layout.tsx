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
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
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
