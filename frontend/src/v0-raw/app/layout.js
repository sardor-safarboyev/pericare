import { Analytics } from '@vercel/analytics/next';
import './globals.css';
export const metadata = {
    title: 'Sentinel — Maternal Risk Triage',
    description: 'AI-assisted maternal risk triage, screening and referral coordination for antenatal and obstetric care.',
    generator: 'v0.app',
    icons: {
        icon: [
            {
                url: '/icon-light-32x32.png',
                media: '(prefers-color-scheme: light)',
            },
            {
                url: '/icon-dark-32x32.png',
                media: '(prefers-color-scheme: dark)',
            },
            {
                url: '/icon.svg',
                type: 'image/svg+xml',
            },
        ],
        apple: '/apple-icon.png',
    },
};
export const viewport = {
    colorScheme: 'light',
    themeColor: '#0d9488',
};
export default function RootLayout({ children, }) {
    return (<html lang="en">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>);
}
