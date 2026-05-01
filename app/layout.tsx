import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Lora } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600'],
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'Sanctuary | Your Space for Mindful Awareness',
  description: 'Pause, reflect, and understand your patterns. Sanctuary is a gentle tool for building mindful habits and finding peace in the present moment.',
  keywords: ['mindfulness', 'reflection', 'mental well-being', 'habit tracking', 'sanctuary', 'peace'],
  authors: [{ name: 'Chaitanya bhagat' }],
  openGraph: {
    title: 'Sanctuary | Your Space for Mindful Awareness',
    description: 'Transform your impulses into insights. A modern tool for mindful living.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${lora.variable}`}>
      <body className="bg-[#f5f5f0] text-[#3a3a2e] font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
