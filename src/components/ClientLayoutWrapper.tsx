'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <main className="flex-1 relative z-10">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-20 sm:pt-24 relative z-10">{children}</main>
      <Footer />
    </>
  );
}
