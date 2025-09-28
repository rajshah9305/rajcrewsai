import type { Metadata } from 'next';
import { Inter, Orbitron, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CrewNexus - Multi-Agent Orchestration Platform',
  description: 'Build, manage, and monitor AI agent workflows with CrewAI and Cerebras AI integration',
  keywords: ['AI', 'Multi-Agent', 'CrewAI', 'Cerebras', 'Workflow', 'Orchestration'],
  authors: [{ name: 'CrewNexus Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0B1426',
  openGraph: {
    title: 'CrewNexus - Multi-Agent Orchestration Platform',
    description: 'Build, manage, and monitor AI agent workflows with CrewAI and Cerebras AI integration',
    type: 'website',
    siteName: 'CrewNexus',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CrewNexus - Multi-Agent Orchestration Platform',
    description: 'Build, manage, and monitor AI agent workflows with CrewAI and Cerebras AI integration',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable} ${jetbrains.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-deep-space text-white font-body">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1A1D23',
                color: '#FFFFFF',
                border: '1px solid rgba(139, 157, 195, 0.3)',
                borderRadius: '8px',
              },
              success: {
                iconTheme: {
                  primary: '#39FF14',
                  secondary: '#0B1426',
                },
              },
              error: {
                iconTheme: {
                  primary: '#FF6B6B',
                  secondary: '#0B1426',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}