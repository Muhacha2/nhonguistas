import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { AppNav } from '@/components/layout/app-nav';
import { ThemeProvider } from '@/hooks/use-theme';

export const metadata: Metadata = {
  title: 'Glance AI',
  description: 'A social media app with AI-powered features.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Pacifico&family=Caveat&display=swap" rel="stylesheet" />
      </head>
      <body className={cn(
        "min-h-screen bg-background font-body antialiased"
      )}>
        <ThemeProvider>
          <div id="app" className="relative w-full h-full">
            {children}
            <AppNav />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
