// ============================================================================
// 🤲 صفحة "ادعُ لي" الديناميكية
// /pray/[code]
// ============================================================================
import PrayForMePage from '@/components/PrayForMePage';

export async function generateMetadata({ params }) {
  const { code } = params;
  return {
    title: `ادعُ لي | Yojeeb`,
    description: 'الدعاء يجمعنا',
    openGraph: {
      title: 'ادعُ لي | Yojeeb',
      description: 'الدعاء يجمعنا',
      url: `https://yojeeb.com/pray/${code}`,
      type: 'website',
    },
  };
}

export default function PrayPage({ params }) {
  return <PrayForMePage code={params.code} />;
}
