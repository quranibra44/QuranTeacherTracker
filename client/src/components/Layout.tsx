import React from 'react';
import { Link, useLocation } from 'wouter';
import logoUrl from '@assets/generated_images/elegant_islamic_school_logo_for_sumaya_school_quran_center.png';
import { BookOpen, Settings } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground pb-20">
      <header className="bg-gradient-to-b from-primary/5 to-background pt-6 pb-6 px-4 flex flex-col items-center gap-4 border-b-2 border-primary/20">
        {/* Logos Section - Side by Side */}
        <div className="flex items-center justify-center gap-8">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
            <img src={logoUrl} alt="School Logo" className="w-full h-full object-cover" />
          </div>
          <div className="w-1 h-16 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 rounded-full"></div>
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
            <img src={logoUrl} alt="School Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-primary text-center leading-tight">
          مقرأة مدرسة سمية
        </h1>
        <p className="text-sm text-secondary font-medium">نظام متابعة تلاوة القرآن الكريم</p>

        {/* Navigation Tabs - Improved */}
        <nav className="flex w-full max-w-2xl bg-white rounded-xl shadow-lg border-2 border-primary/10 p-2 gap-2">
          <Link href="/">
            <a className={`flex-1 py-4 px-4 text-center rounded-lg transition-all duration-300 text-base font-bold flex items-center justify-center gap-2 ${
              location === '/' 
                ? 'bg-primary text-white shadow-lg scale-105' 
                : 'text-primary hover:bg-primary/5'
            }`}>
              <BookOpen className="w-5 h-5" />
              متابعة التلاوة
            </a>
          </Link>
          <Link href="/management">
            <a className={`flex-1 py-4 px-4 text-center rounded-lg transition-all duration-300 text-base font-bold flex items-center justify-center gap-2 ${
              location === '/management' 
                ? 'bg-primary text-white shadow-lg scale-105' 
                : 'text-primary hover:bg-primary/5'
            }`}>
              <Settings className="w-5 h-5" />
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
