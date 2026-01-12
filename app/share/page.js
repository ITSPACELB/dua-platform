// ============================================================================
// 📤 صفحة المشاركة الخاصة
// /share
// ============================================================================
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'يُجيب - منصة الدعاء الجماعي',
  description: 'الدعاء يجمعنا',
  openGraph: {
    title: 'يُجيب - منصة الدعاء الجماعي',
    description: 'الدعاء يجمعنا',
    url: 'https://yojeeb.com/share',
    type: 'website',
    siteName: 'يُجيب',
    images: [
      {
        url: 'https://yojeeb.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'يُجيب - الدعاء يجمعنا',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'يُجيب - منصة الدعاء الجماعي',
    description: 'الدعاء يجمعنا',
    images: ['https://yojeeb.com/og-image.png'],
  },
};

// عند فتح الصفحة، يتم توجيه المستخدم للصفحة الرئيسية
export default function SharePage() {
  redirect('/');
}
