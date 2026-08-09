import type { Metadata } from 'next';
import './globals.css';
import { BackgroundCanvas } from '@/components/BackgroundCanvas';
import { ClientLayoutWrapper } from '@/components/ClientLayoutWrapper';

export const metadata: Metadata = {
  metadataBase: new URL('https://anpk.ir'),
  title: {
    default: 'ارشیا نگین پردازش کویر | توسعه سامانه‌های اختصاصی، هوش مصنوعی و سلامت دیجیتال',
    template: '%s | ارشیا نگین پردازش کویر',
  },
  description:
    'شرکت ارشیا نگین پردازش کویر طراح و پیاده‌ساز سامانه‌های اختصاصی سازمانی، اتوماسیون فرایند، هوش مصنوعی کاربردی، سلامت دیجیتال، پلتفرم کلاس مجازی آیرا و CMMS تأسیسات نگار.',
  keywords: [
    'ارشیا نگین پردازش کویر',
    'ANPK',
    'سلامت دیجیتال',
    'مدیریت کلینیک',
    'سامانه آزمایشگاه',
    'CMMS تأسیسات',
    'آیرا کلاس مجازی',
    'تأسیسات نگار',
    'نیکی لینک',
    'هوش مصنوعی کاربردی',
    'اتوماسیون فرایند',
  ],
  authors: [{ name: 'ارشیا نگین پردازش کویر' }],
  creator: 'ارشیا نگین پردازش کویر',
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://anpk.ir',
    title: 'ارشیا نگین پردازش کویر | توسعه سامانه‌های اختصاصی و هوش مصنوعی',
    description:
      'طراحی و پیاده‌سازی سامانه‌های مقیاس‌پذیر سازمانی، سلامت دیجیتال، مدیریت نگهداشت تأسیسات و کلاس مجازی بومی.',
    siteName: 'ارشیا نگین پردازش کویر',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ارشیا نگین پردازش کویر',
    description: 'توسعه سامانه‌های اختصاصی، اتوماسیون فرایند و سلامت دیجیتال',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'ارشیا نگین پردازش کویر',
              alternateName: 'Arshia Negin Pardazesh Kavir (ANPK)',
              url: 'https://anpk.ir',
              logo: 'https://anpk.ir/logo.png',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+98-34-34200000',
                contactType: 'customer service',
                areaServed: 'IR',
                availableLanguage: ['Persian', 'English'],
              },
              sameAs: [],
            }),
          }}
        />
      </head>
      <body className="font-sans bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col selection:bg-brand-500 selection:text-white relative">
        {/* Interactive Particle Network Canvas */}
        <BackgroundCanvas />

        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
