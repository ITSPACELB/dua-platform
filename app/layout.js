import './globals.css'
import Script from 'next/script'

// ============================================================================
// 📱 Metadata الأساسية
// ============================================================================
export const metadata = {
  title: {
    default: 'يُجيب - منصة الدعاء الجماعي',
    template: '%s | يُجيب'
  },
  description: 'منصة إسلامية تجمع المؤمنين من كل أنحاء العالم للدعاء المشترك. "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ"',
  keywords: [
    'دعاء',
    'دعاء جماعي',
    'دعاء مستجاب',
    'الدعاء المستجاب',
    'منصة دعاء',
    'دعاء إسلامي',
    'استجابة الدعاء',
    'قوة الدعاء',
    'دعاء للمريض',
    'دعاء للميت',
    'دعاء للرزق',
    'دعاء للفرج',
    'آيات قرآنية',
    'أدعية مستجابة',
    'الدعاء الجماعي',
    'منصة إسلامية'
  ],
  authors: [{ name: 'الغافقي' }],
  creator: 'الغافقي',
  publisher: 'منصة يُجيب',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  
  // ============================================================================
  // 🍎 Apple Web App
  // ============================================================================
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'يُجيب',
    startupImage: [
      {
        url: '/icon-192.png',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  
  // ============================================================================
  // 📱 PWA Icons
  // ============================================================================
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: ['/icon-192.png'],
  },
  
  // ============================================================================
  // 🌐 Open Graph (Facebook, WhatsApp, LinkedIn)
  // ============================================================================
  openGraph: {
    type: 'website',
    locale: 'ar_IQ',
    url: 'https://yourdomain.com',
    siteName: 'يُجيب - منصة الدعاء الجماعي',
    title: 'يُجيب - منصة الدعاء الجماعي',
    description: 'منصة إسلامية تجمع المؤمنين للدعاء المشترك - "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ"',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'يُجيب - منصة الدعاء الجماعي',
      },
    ],
  },
  
  // ============================================================================
  // 🐦 Twitter Card
  // ============================================================================
  twitter: {
    card: 'summary_large_image',
    title: 'يُجيب - منصة الدعاء الجماعي',
    description: 'منصة إسلامية تجمع المؤمنين للدعاء المشترك',
    images: ['/og-image.png'],
    creator: '@alghafiqi',
  },
  
  // ============================================================================
  // 🤖 Robots & SEO
  // ============================================================================
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // ============================================================================
  // 🔗 Verification
  // ============================================================================
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  
  // ============================================================================
  // 🌍 Alternates
  // ============================================================================
  alternates: {
    canonical: 'https://yourdomain.com',
    languages: {
      'ar-IQ': 'https://yourdomain.com',
      'ar': 'https://yourdomain.com',
    },
  },
  
  // ============================================================================
  // 📊 Other
  // ============================================================================
  category: 'religion',
  classification: 'Islamic Platform',
}

// ============================================================================
// 📱 Viewport
// ============================================================================
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#16a34a' },
    { media: '(prefers-color-scheme: dark)', color: '#15803d' },
  ],
}

// ============================================================================
// 🎨 Root Layout
// ============================================================================
export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* ============================================================================ */}
        {/* 🎨 الخط العربي - Markazi Text من Google Fonts */}
        {/* ============================================================================ */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Markazi+Text:wght@400;500;600;700&display=swap" 
          rel="stylesheet"
        />
        
        {/* ============================================================================ */}
        {/* 📱 PWA & Mobile Meta Tags */}
        {/* ============================================================================ */}
        <meta name="application-name" content="يُجيب" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="يُجيب" />
        
        {/* ============================================================================ */}
        {/* 🎨 Theme Color */}
        {/* ============================================================================ */}
        <meta name="theme-color" content="#16a34a" />
        <meta name="msapplication-TileColor" content="#16a34a" />
        <meta name="msapplication-navbutton-color" content="#16a34a" />
        
        {/* ============================================================================ */}
        {/* 📊 Schema.org Structured Data (JSON-LD) */}
        {/* ============================================================================ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'يُجيب - منصة الدعاء الجماعي',
              description: 'منصة إسلامية تجمع المؤمنين من كل أنحاء العالم للدعاء المشترك',
              url: 'https://yourdomain.com',
              inLanguage: 'ar',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://yourdomain.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
              author: {
                '@type': 'Person',
                name: 'الغافقي',
              },
              publisher: {
                '@type': 'Organization',
                name: 'منصة يُجيب',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://yourdomain.com/icon-512.png',
                },
              },
            }),
          }}
        />
        
        {/* ============================================================================ */}
        {/* 📊 Organization Schema */}
        {/* ============================================================================ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'منصة يُجيب',
              description: 'منصة الدعاء الجماعي',
              url: 'https://yourdomain.com',
              logo: 'https://yourdomain.com/icon-512.png',
              foundingDate: '2025',
              sameAs: [
                // يمكن إضافة روابط السوشيال ميديا هنا
              ],
            }),
          }}
        />
      </head>
      
      <body 
        className="antialiased"
        style={{ fontFamily: "'Markazi Text', serif" }}
      >
        {children}
        
        {/* ============================================================================ */}
        {/* 🔔 OneSignal SDK - المرحلة 8 */}
        {/* ============================================================================ */}
        <Script
          id="onesignal-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.OneSignalDeferred = window.OneSignalDeferred || [];
              OneSignalDeferred.push(async function(OneSignal) {
                await OneSignal.init({
                  appId: "${process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || 'YOUR_ONESIGNAL_APP_ID'}",
                  safari_web_id: "${process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID || ''}",
                  notifyButton: {
                    enable: false,
                  },
                  allowLocalhostAsSecureOrigin: true,
                });
              });
            `,
          }}
        />
        
        <Script 
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" 
          strategy="afterInteractive"
          defer
        />
        
        {/* ============================================================================ */}
        {/* 📊 Google Analytics (اختياري) */}
        {/* ============================================================================ */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
        
        {/* ============================================================================ */}
        {/* 📱 PWA Service Worker Registration */}
        {/* ============================================================================ */}
        <Script
          id="pwa-register"
          strategy="afterInteractive"
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
            `,
          }}
        />
      </body>
    </html>
  )
}