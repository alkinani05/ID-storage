import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({ subsets: ['arabic', 'latin'] });

export const metadata: Metadata = {
  title: 'Wathiqati - Secure Document Storage',
  description: 'Manage your personal documents securely with AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.className}>{children}</body>
    </html>
  );
}
