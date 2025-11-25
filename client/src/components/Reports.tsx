import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Recitation, Teacher, Student, getRating } from '@/lib/types';
import { calculateBadges } from '@/lib/badges';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Trophy, Calendar, TrendingUp, AlertCircle, CheckCircle2, Activity, BookCheck, LayoutGrid } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const COLORS = ['#4a8b60', '#86efac', '#facc15', '#fb923c']; // Excellent, V.Good, Good, Needs Attention

// Helper to calculate ranges from page numbers
function getPageRanges(pages: number[]): string[] {
  if (pages.length === 0) return [];
  
  const sorted = [...new Set(pages)].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== prev + 1) {
      ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
      start = sorted[i];
    }
    prev = sorted[i];
  }
  ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
  return ranges;
}

// Helper to get Juz progress
function getJuzProgress(memorizedPages: number[]) {
  const juzData = Array.from({ length: 30 }, (_, i) => ({
    juz: i + 1,
    total: 20, // Approx 20 pages per Juz
    completed: 0,
    pages: [] as number[]
  }));

  memorizedPages.forEach(page => {
    const juzIndex = Math.ceil((page - 1) / 20) - 1;
    if (juzData[juzIndex]) {
      juzData[juzIndex].completed++;
      juzData[juzIndex].pages.push(page);
    }
  });

  return juzData;
}

export function StudentDetailReport({ student, recitations }: { student: Student, recitations: Recitation[] }) {
  const studentRecitations = recitations
    .filter(r => r.studentId === student.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Calculate Memorization Stats (Unique pages passed with <= 6 errors)
  const passedPages = [...new Set(
    studentRecitations
      .filter(r => r.errorCount <= 6)
      .map(r => r.pageNumber)
  )].sort((a, b) => a - b);

  const totalMemorized = passedPages.length;
  const pageRanges = getPageRanges(passedPages);
  const juzProgress = getJuzProgress(passedPages);

  const badges = calculateBadges(studentRecitations);

  // Calculate Rating Distribution
  const distribution = [
    { name: 'ممتاز', value: studentRecitations.filter(r => r.errorCount <= 3).length, color: COLORS[0] },
    { name: 'جيد جداً', value: studentRecitations.filter(r => r.errorCount > 3 && r.errorCount <= 6).length, color: COLORS[1] },
    { name: 'جيد', value: studentRecitations.filter(r => r.errorCount > 6 && r.errorCount <= 9).length, color: COLORS[2] },
    { name: 'يحتاج تركيز', value: studentRecitations.filter(r => r.errorCount > 9).length, color: COLORS[3] },
  ].filter(d => d.value > 0);

  // Calculate Error Trend (Last 10 sessions)
  const errorTrend = studentRecitations.slice(-10).map((r, i) => ({
    index: i + 1,
    errors: r.errorCount,
    page: r.pageNumber
  }));

  const totalErrors = studentRecitations.reduce((acc, curr) => acc + curr.errorCount, 0);
  const avgErrors = studentRecitations.length ? (totalErrors / studentRecitations.length).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{studentRecitations.length}</div>
            <div className="text-xs text-muted-foreground">إجمالي التلاوات</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{totalMemorized}</div>
            <div className="text-xs text-green-600">صفحة محفوظة</div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{badges.length}</div>
            <div className="text-xs text-muted-foreground">الأوسمة المكتسبة</div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {studentRecitations.length > 0 ? studentRecitations[studentRecitations.length - 1].pageNumber : '-'}
            </div>
            <div className="text-xs text-muted-foreground">آخر صفحة</div>
          </CardContent>
        </Card>
      </div>

      {/* Memorization Progress Section */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/10 pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookCheck className="w-5 h-5 text-green-600" />
            محفوظات الطالب
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-6">
          {/* Ranges Text */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">النطاقات المحفوظة:</h4>
            <div className="flex flex-wrap gap-2">
              {pageRanges.length > 0 ? pageRanges.map((range, i) => (
                <span key={i} className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm font-mono font-bold border border-green-200">
                  {range}
                </span>
              )) : (
                <span className="text-sm text-muted-foreground italic">لا يوجد صفحات محفوظة بعد (أخطاء ≤ 6)</span>
              )}
            </div>
          </div>

          {/* Juz Progress Grid */}
          <div>
             <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
               <LayoutGrid className="w-4 h-4" />
               التقدم في الأجزاء (30 جزء):
             </h4>
             <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
               {juzProgress.map((juz) => {
                 const percent = Math.min(100, Math.round((juz.completed / juz.total) * 100));
                 const isComplete = percent >= 100;
                 
                 return (
                   <div key={juz.juz} className="relative group">
                     <div className={`aspect-square rounded-lg border flex flex-col items-center justify-center p-1 transition-all ${isComplete ? 'bg-green-100 border-green-400' : percent > 0 ? 'bg-white border-primary/30' : 'bg-muted/20 border-transparent'}`}>
                       <span className={`text-xs font-bold ${isComplete ? 'text-green-700' : 'text-muted-foreground'}`}>
                         {juz.juz}
                       </span>
                       {percent > 0 && (
                         <div className="w-full bg-muted/30 h-1.5 mt-1 rounded-full overflow-hidden">
                           <div className="bg-green-500 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                         </div>
                       )}
                     </div>
                     
                     {/* Tooltip */}
                     {percent > 0 && (
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md border whitespace-nowrap hidden group-hover:block z-10">
                         جزء {juz.juz}: {juz.completed} صفحة
                       </div>
                     )}
                   </div>
                 );
               })}
             </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rating Distribution Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-secondary" />
              توزيع مستوى الأداء
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            {distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} تلاوة`, name]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">لا توجد بيانات</div>
            )}
            <div className="flex justify-center gap-3 text-xs mt-2">
              {distribution.map(d => (
                <div key={d.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                  <span>{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error Trend Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              تحسن الأداء (آخر 10 تلاوات)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            {errorTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={errorTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="index" tick={false} axisLine={false} />
                  <YAxis axisLine={false} tickLine={false} width={30} />
                  <Tooltip 
                    formatter={(value) => [`${value} خطأ`, 'الأخطاء']}
                    labelFormatter={(v) => `تلاوة ${v}`}
                  />
                  <Line type="monotone" dataKey="errors" stroke="#4a8b60" strokeWidth={2} dot={{r: 4, fill: '#4a8b60'}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">لا توجد بيانات</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Badges Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            لوحة الشرف والأوسمة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {badges.length > 0 ? badges.map(badge => (
              <div key={badge.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${badge.color}`}>
                <span className="text-xl">{badge.icon}</span>
                <div>
                  <div className="font-bold text-sm">{badge.name}</div>
                  <div className="text-xs opacity-80">{badge.description}</div>
                </div>
              </div>
            )) : (
              <div className="text-muted-foreground text-sm italic">لم يحصل الطالب على أوسمة بعد. شجعه على الاستمرار!</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export function TeacherDetailReport({ teacher, recitations }: { teacher: Teacher, recitations: Recitation[] }) {
  const teacherRecitations = recitations
    .filter(r => r.teacherId === teacher.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Calculate Activity by Day of Week
  const activityByDay = [0, 1, 2, 3, 4, 5, 6].map(dayIdx => {
    // 0 = Sunday in date-fns if configured, let's manually map or use ISO
    // Simple map: 0=Sun, 1=Mon...
    const count = teacherRecitations.filter(r => new Date(r.timestamp).getDay() === dayIdx).length;
    const dayName = format(new Date().setDate(new Date().getDate() - new Date().getDay() + dayIdx), 'EEEE', { locale: ar });
    return { day: dayName, count };
  });

  // Unique Students Taught
  const uniqueStudents = new Set(teacherRecitations.map(r => r.studentId)).size;

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-3 gap-4">
        <Card className="bg-secondary/5 border-secondary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{teacherRecitations.length}</div>
            <div className="text-xs text-muted-foreground">تلاوة مستمعة</div>
          </CardContent>
        </Card>
        <Card className="bg-secondary/5 border-secondary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{uniqueStudents}</div>
            <div className="text-xs text-muted-foreground">طلاب مختلفين</div>
          </CardContent>
        </Card>
        <Card className="bg-secondary/5 border-secondary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">
              {teacherRecitations.length > 0 ? format(new Date(teacherRecitations[teacherRecitations.length-1].timestamp), 'dd/MM') : '-'}
            </div>
            <div className="text-xs text-muted-foreground">آخر نشاط</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            النشاط حسب أيام الأسبوع
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[250px]">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={activityByDay}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
               <XAxis dataKey="day" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
               <YAxis axisLine={false} tickLine={false} />
               <Tooltip cursor={{fill: '#f4f4f5'}} />
               <Bar dataKey="count" fill="#d4a574" radius={[4, 4, 0, 0]} />
             </BarChart>
           </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
