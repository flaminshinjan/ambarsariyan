import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import 'material-symbols';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { Shell } from '@/components/layout/shell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ambarsariyan',
  description: 'Workflow automation system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Shell>{children}</Shell>
        </ThemeProvider>
      </body>
    </html>
  );
}
