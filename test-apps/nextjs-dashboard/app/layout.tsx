import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { CounterStoreProvider } from './store/provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <CounterStoreProvider>
          {children}
        </CounterStoreProvider>
      </body>
    </html>
  );
}
