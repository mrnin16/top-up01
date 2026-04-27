import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Top-up — Game & Service Top-up Platform',
  description: 'Top up Mobile Legends, Free Fire, Spotify, and more. Instant delivery. KHQR, bank, and card accepted.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
