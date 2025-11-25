import React from 'react';
import { Link, useLocation } from 'wouter';
import logoUrl from '@assets/generated_images/elegant_islamic_school_logo_for_sumaya_school_quran_center.png';

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground pb-20">
      <header className="bg-background pt-8 pb-4 px-4 flex flex-col items-center gap-6">
        {/* Logos Section */}
        <div className="relative flex items-center justify-center h-32 w-full">
          <div className="absolute left-1/2 -translate-x-[calc(50%+20px)] top-0 w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white z-10">
            <img src={logoUrl} alt="School Logo 1" className="w-full h-full object-cover" />
          </div>
          <div className="absolute left-1/2 -translate-x-[calc(50%-20px)] top-0 w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white/90 z-0 opacity-80">
             {/* Using same logo for mockup purposes, slightly overlapped */}
            <img src={logoUrl} alt="School Logo 2" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-primary mt-4 text-center">
          مقرأة مدرسة سمية
        </h1>

        {/* Navigation Tabs */}
        <nav className="flex w-full max-w-md bg-white rounded-full p-1 shadow-sm border border-border">
          <Link href="/">
            <a className={`flex-1 py-3 text-center rounded-full transition-all duration-200 text-lg font-medium ${location === '/' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-muted/50'}`}>
              متابعة التلاوة
            </a>
          </Link>
          <Link href="/management">
            <a className={`flex-1 py-3 text-center rounded-full transition-all duration-200 text-lg font-medium ${location === '/management' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-muted/50'}`}>
              إدارة المقرأة
            </a>
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 max-w-5xl animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
}
