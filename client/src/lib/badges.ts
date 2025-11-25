import { Recitation } from './types';

export type Badge = {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
};

export const AVAILABLE_BADGES: Badge[] = [
  { id: 'first_step', name: 'بداية الطريق', icon: '🌱', description: 'سجل أول تلاوة', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'perfect_streak', name: 'تلاوة متقنة', icon: '✨', description: '3 تلاوات متتالية بامتياز', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'dedicated', name: 'مجتهد', icon: '🔥', description: 'أتم 10 تلاوات', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'juz_1', name: 'الجزء الأول', icon: '🏆', description: 'قرأ 10 صفحات من الجزء الأول', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'hafiz_club', name: 'نادي الحفاظ', icon: '👑', description: 'أتم 100 تلاوة', color: 'bg-purple-100 text-purple-700 border-purple-200' },
];

export const calculateBadges = (studentRecitations: Recitation[]): Badge[] => {
  const badges: Badge[] = [];
  if (studentRecitations.length === 0) return badges;

  // 1. First Step
  if (studentRecitations.length >= 1) {
    badges.push(AVAILABLE_BADGES.find(b => b.id === 'first_step')!);
  }

  // 2. Dedicated (10 recitations)
  if (studentRecitations.length >= 10) {
    badges.push(AVAILABLE_BADGES.find(b => b.id === 'dedicated')!);
  }

  // 3. Perfect Streak (3 excellent in a row)
  let streak = 0;
  let hasStreak = false;
  // Sort by date ascending to check streak
  const sortedRecitations = [...studentRecitations].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  for (const r of sortedRecitations) {
    if (r.errorCount <= 3) {
      streak++;
      if (streak >= 3) hasStreak = true;
    } else {
      streak = 0;
    }
  }
  if (hasStreak) {
    badges.push(AVAILABLE_BADGES.find(b => b.id === 'perfect_streak')!);
  }

  // 4. Juz 1 Master (Rough check: >10 pages in range 1-21)
  const juz1Pages = studentRecitations.filter(r => r.pageNumber >= 1 && r.pageNumber <= 21).length;
  if (juz1Pages >= 10) {
    badges.push(AVAILABLE_BADGES.find(b => b.id === 'juz_1')!);
  }

  // 5. Hafiz Club
  if (studentRecitations.length >= 100) {
    badges.push(AVAILABLE_BADGES.find(b => b.id === 'hafiz_club')!);
  }

  return badges;
};
