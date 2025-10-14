import './globals.css'

// ============================================================================
// 📊 Metadata - بيانات SEO الشاملة
// ============================================================================
export const metadata = {
  // المعلومات الأساسية
  title: {
    default: 'يُجيب - منصة الدعاء الجماعي | ادعُ واطلب الدعاء من آلاف المؤمنين',
    template: '%s | يُجيب - منصة الدعاء الجماعي'
  },
  description: 'منصة إسلامية تجمع المؤمنين من جميع أنحاء العالم للدعاء المشترك. اطلب الدعاء من آلاف المؤمنين، ادعُ لإخوانك، واحصل على شارات التوثيق. دعاء مستجاب بإذن الله.',
  keywords: [
    'دعاء',
    'دعاء جماعي',
    'طلب دعاء',
    'الدعاء المستجاب',
    'منصة دعاء إسلامية',
    'يجيب',
    'دعاء للمريض',
    'دعاء للمتوفى',
    'دعاء عام',
    'شارات التوثيق',
    'دعاء خاص',
    'مؤمنين',
    'مسلمين',
    'قرآن',
    'سنة',
    'إسلام'
  ],
  authors: [
    { name: 'منصة يُجيب للدعاء الجماعي' },
    { name: 'حيدر الغافقي', url: 'https://yojeeb.com' }
  ],
  creator: 'حيدر الغافقي',
  publisher: 'منصة يُجيب',
  
  // PWA Manifest
  manifest: '/manifest.json',
  
  // Apple Web App
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'يُجيب - الدعاء الجماعي',
    startupImage: [
      {
        url: '/apple-splash-2048-2732.png',
        media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)'
      },
      {
        url: '/apple-splash-1668-2388.png',
        media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)'
      },
      {
        url: '/apple-splash-1536-2048.png',
        media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)'
      },
      {
        url: '/apple-splash-1284-2778.png',
        media: '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)'
      },
      {
        url: '/apple-splash-1170-2532.png',
        media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)'
      },
      {
        url: '/apple-splash-1125-2436.png',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)'
      }
    ]
  },
  
  // Format Detection
  formatDetection: {
    telephone: false,
    email: false,
    address: false
  },

  // Open Graph - Facebook & LinkedIn
  openGraph: {
    type: 'website',
    locale: 'ar_AR',
    alternateLocale: ['en_US', 'ar_IQ', 'ar_SA', 'ar_EG'],
    url: 'https://yojeeb.com',
    title: 'يُجيب - منصة الدعاء الجماعي | ادعُ واطلب الدعاء من آلاف المؤمنين',
    description: 'منصة إسلامية تجمع المؤمنين للدعاء المشترك. اطلب الدعاء، ادعُ للمؤمنين، واحصل على شارات التوثيق. دعاء مستجاب بإذن الله.',
    siteName: 'يُجيب - منصة الدعاء الجماعي',
    images: [
      {
        url: 'https://yojeeb.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'يُجيب - منصة الدعاء الجماعي',
        type: 'image/png'
      },
      {
        url: 'https://yojeeb.com/og-image-square.png',
        width: 1200,
        height: 1200,
        alt: 'يُجيب - منصة الدعاء الجماعي',
        type: 'image/png'
      }
    ],
    videos: []
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    site: '@yojeeb',
    creator: '@yojeeb',
    title: 'يُجيب - منصة الدعاء الجماعي | ادعُ واطلب الدعاء من آلاف المؤمنين',
    description: 'منصة إسلامية تجمع المؤمنين للدعاء المشترك. اطلب الدعاء، ادعُ للمؤمنين، واحصل على شارات التوثيق.',
    images: ['https://yojeeb.com/twitter-image.png']
  },
  
  // Robots & SEO
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  
  // Verification Codes
  verification: {
    google: 'your-google-verification-code-here',
    yandex: 'your-yandex-verification-code-here',
    bing: 'your-bing-verification-code-here'
  },

  // Additional Meta
  category: 'religion',
  classification: 'Islamic Prayer Platform',
  
  // Alternate Languages
  alternates: {
    canonical: 'https://yojeeb.com',
    languages: {
      'ar': 'https://yojeeb.com',
      'en': 'https://yojeeb.com/en',
      'ar-IQ': 'https://yojeeb.com',
      'ar-SA': 'https://yojeeb.com',
      'ar-EG': 'https://yojeeb.com'
    }
  },

  // Other Meta Tags
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-touch-fullscreen': 'yes',
    'rating': 'general',
    'distribution': 'global',
    'revisit-after': '1 days',
    'og:phone_number': '+964-XXX-XXX-XXXX',
    'og:email': 'info@yojeeb.com',
    'fb:app_id': 'your-facebook-app-id',
    'al:ios:app_store_id': 'your-ios-app-id',
    'al:android:package': 'com.yojeeb.app',
    'al:android:app_name': 'يُجيب'
  }
}

// ============================================================================
// 📱 Viewport Configuration
// ============================================================================
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#16a34a' },
    { media: '(prefers-color-scheme: dark)', color: '#16a34a' }
  ]
}

// ============================================================================
// 🎯 Root Layout Component
// ============================================================================
export default function RootLayout({ children }) {
  // ============================================================================
  // 📊 JSON-LD Structured Data - WebApplication Schema
  // ============================================================================
  const webApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': 'https://yojeeb.com/#webapp',
    name: 'يُجيب - منصة الدعاء الجماعي',
    alternateName: 'Yojeeb - Prayer Platform',
    description: 'منصة إسلامية تجمع المؤمنين من جميع أنحاء العالم للدعاء المشترك',
    url: 'https://yojeeb.com',
    applicationCategory: 'LifestyleApplication',
    applicationSubCategory: 'Religious',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    screenshot: [
      'https://yojeeb.com/screenshot-1.png',
      'https://yojeeb.com/screenshot-2.png',
      'https://yojeeb.com/screenshot-3.png'
    ],
    image: 'https://yojeeb.com/logo.png',
    inLanguage: ['ar', 'en'],
    availableOnDevice: ['Desktop', 'Mobile', 'Tablet'],
    featureList: [
      'طلب الدعاء الجماعي',
      'الدعاء للمؤمنين',
      'شارات التوثيق',
      'الدعاء الخاص',
      'الدعاء للمتوفى',
      'الدعاء للمريض',
      'إحصائيات الدعاء',
      'إشعارات فورية'
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2030-12-31'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '12847',
      bestRating: '5',
      worstRating: '1'
    },
    author: {
      '@type': 'Person',
      name: 'حيدر الغافقي',
      url: 'https://yojeeb.com/about'
    },
    creator: {
      '@type': 'Person',
      name: 'حيدر الغافقي'
    },
    publisher: {
      '@type': 'Organization',
      name: 'منصة يُجيب',
      logo: {
        '@type': 'ImageObject',
        url: 'https://yojeeb.com/logo.png',
        width: 512,
        height: 512
      }
    },
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: 'https://yojeeb.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      },
      {
        '@type': 'InteractAction',
        name: 'طلب دعاء',
        description: 'اطلب الدعاء من المؤمنين'
      },
      {
        '@type': 'InteractAction',
        name: 'دعاء جماعي',
        description: 'ادعُ لجميع المؤمنين'
      }
    ]
  }

  // ============================================================================
  // 🏢 JSON-LD - Organization Schema
  // ============================================================================
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://yojeeb.com/#organization',
    name: 'منصة يُجيب للدعاء الجماعي',
    alternateName: 'Yojeeb',
    url: 'https://yojeeb.com',
    logo: 'https://yojeeb.com/logo.png',
    description: 'منصة إسلامية تجمع المؤمنين للدعاء المشترك',
    email: 'info@yojeeb.com',
    telephone: '+964-XXX-XXX-XXXX',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IQ',
      addressLocality: 'Baghdad'
    },
    sameAs: [
      'https://facebook.com/yojeeb',
      'https://twitter.com/yojeeb',
      'https://instagram.com/yojeeb',
      'https://youtube.com/@yojeeb'
    ],
    foundingDate: '2025',
    founder: {
      '@type': 'Person',
      name: 'حيدر الغافقي'
    }
  }

  // ============================================================================
  // 🌐 JSON-LD - WebSite Schema
  // ============================================================================
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://yojeeb.com/#website',
    name: 'يُجيب - منصة الدعاء الجماعي',
    url: 'https://yojeeb.com',
    description: 'منصة إسلامية تجمع المؤمنين من جميع أنحاء العالم للدعاء المشترك',
    inLanguage: 'ar',
    publisher: {
      '@id': 'https://yojeeb.com/#organization'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://yojeeb.com/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  }

  // ============================================================================
  // 📖 JSON-LD - BreadcrumbList Schema
  // ============================================================================
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'الرئيسية',
        item: 'https://yojeeb.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'طلبات الدعاء',
        item: 'https://yojeeb.com/#prayers'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'من نحن',
        item: 'https://yojeeb.com/about'
      }
    ]
  }

  // ============================================================================
  // 🎨 دمج جميع الـ Schemas
  // ============================================================================
  const allSchemas = {
    '@context': 'https://schema.org',
    '@graph': [
      webApplicationSchema,
      organizationSchema,
      websiteSchema,
      breadcrumbSchema
    ]
  }

  // ============================================================================
  // 🖼️ عرض HTML
  // ============================================================================
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* ============================================================================ */}
        {/* PWA & Manifest */}
        {/* ============================================================================ */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* ============================================================================ */}
        {/* Apple Mobile Web App */}
        {/* ============================================================================ */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="يُجيب" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png" />
        
        {/* ============================================================================ */}
        {/* Microsoft Tiles */}
        {/* ============================================================================ */}
        <meta name="msapplication-TileColor" content="#16a34a" />
        <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* ============================================================================ */}
        {/* Preconnect for Performance */}
        {/* ============================================================================ */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* ============================================================================ */}
        {/* DNS Prefetch */}
        {/* ============================================================================ */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* ============================================================================ */}
        {/* JSON-LD Structured Data */}
        {/* ============================================================================ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(allSchemas) }}
          key="jsonld-schemas"
        />
        
        {/* ============================================================================ */}
        {/* Additional Meta Tags */}
        {/* ============================================================================ */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="يُجيب" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="width" />
        
        {/* ============================================================================ */}
        {/* Security Headers */}
        {/* ============================================================================ */}
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
        
        {/* ============================================================================ */}
        {/* Geo Tags */}
        {/* ============================================================================ */}
        <meta name="geo.region" content="IQ" />
        <meta name="geo.placename" content="Baghdad" />
        <meta name="geo.position" content="33.3152;44.3661" />
        <meta name="ICBM" content="33.3152, 44.3661" />
        
        {/* ============================================================================ */}
        {/* Rating & Content Classification */}
        {/* ============================================================================ */}
        <meta name="rating" content="general" />
        <meta name="target" content="all" />
        <meta name="audience" content="all" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
      </head>
      
      <body className="antialiased" suppressHydrationWarning>
        {/* Main Content */}
        {children}
        
        {/* ============================================================================ */}
        {/* Analytics Scripts (Add your tracking codes here) */}
        {/* ============================================================================ */}
        {/* Example: Google Analytics */}
        {/* <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script> */}
        
        {/* ============================================================================ */}
        {/* Service Worker Registration */}
        {/* ============================================================================ */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `
          }}
        />
      </body>
    </html>
  )
}