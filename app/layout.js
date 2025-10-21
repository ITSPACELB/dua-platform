import './globals.css'

export const metadata = {
  title: 'منصة الدعاء الجماعي',
  description: 'منصة تجمع المؤمنين من كل أنحاء العالم للدعاء المشترك',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'منصة الدعاء الجماعي',
  },
  formatDetection: {
    telephone: false,
  },
}

// هذا هو الجديد - منفصل عن metadata
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#16a34a',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="منصة الدعاء الجماعي" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}