import './globals.css';
import { Outfit } from 'next/font/google';
import { AuthProvider } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import ThemeProvider from '@/components/ThemeProvider/ThemeProvider';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata = {
  title: 'BulkThreads | Group Buying for Premium Clothing',
  description:
    'Join bulk order campaigns for premium clothing. Unlock wholesale prices together.',
  keywords: 'bulk order, group buying, wholesale clothing, fashion deals',
  openGraph: {
    title: 'BulkThreads | Group Buying for Premium Clothing',
    description: 'Unlock wholesale prices together.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <head>
        {/* ThemeScript prevents flash of wrong theme on load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('bt-theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
