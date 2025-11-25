import React from 'react';
import { Link, useLocation } from 'wouter';
import blueLogo from '@assets/3_1764046956223.png';
import greenLogo from '@assets/4_1764046956223.png';
import { BookOpen, Settings } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground pb-20">
      <header className="bg-gradient-to-b from-primary/5 to-background pt-6 pb-6 px-4 flex flex-col items-center gap-4 border-b-2 border-primary/20">
        {/* Logos Section - Side by Side */}
        <div className="flex items-center justify-center gap-12">
          <img src={greenLogo} alt="Sumaya School Logo" className="h-40 w-40 object-contain" />
          <div className="w-1.5 h-28 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 rounded-full"></div>
          <img src={blueLogo} alt="Mosque Logo" className="h-40 w-40 object-contain" />
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
