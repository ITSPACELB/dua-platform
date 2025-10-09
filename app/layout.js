import './globals.css'

export const metadata = {
  title: 'منصة الدعاء الجماعي - يُجيب',
  description: 'منصة تجمع المؤمنين من كل أنحاء العالم للدعاء المشترك. ادعُ واطلب الدعاء من آلاف المؤمنين.',
  keywords: 'دعاء, دعاء جماعي, طلب دعاء, الدعاء المستجاب, منصة دعاء, يجيب',
  authors: [{ name: 'منصة الدعاء الجماعي' }],
  
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'منصة الدعاء الجماعي',
  },
  formatDetection: {
    telephone: false,
  },

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'ar_AR',
    url: 'https://dua-platform.com',
    title: 'منصة الدعاء الجماعي - يُجيب',
    description: 'ادعُ واطلب الدعاء من آلاف المؤمنين حول العالم',
    siteName: 'منصة الدعاء الجماعي',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'منصة الدعاء الجماعي'
    }]
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'منصة الدعاء الجماعي - يُجيب',
    description: 'ادعُ واطلب الدعاء من آلاف المؤمنين',
    images: ['/og-image.png']
  },
  
  // Additional
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code'
  }
}

// منفصل عن metadata
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#16a34a',
}

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'منصة الدعاء الجماعي',
    description: 'منصة تجمع المؤمنين للدعاء المشترك',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250'
    }
  }

  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="منصة الدعاء الجماعي" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}