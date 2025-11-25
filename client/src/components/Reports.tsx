import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Recitation, Teacher, Student, getRating } from '@/lib/types';
import { calculateBadges } from '@/lib/badges';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Trophy, Calendar, TrendingUp, AlertCircle, CheckCircle2, Activity } from 'lucide-react';

const COLORS = ['#4a8b60', '#86efac', '#facc15', '#fb923c']; // Excellent, V.Good, Good, Needs Attention

export function StudentDetailReport({ student, recitations }: { student: Student, recitations: Recitation[] }) {
  const studentRecitations = recitations
    .filter(r => r.studentId === student.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const badges = calculateBadges(studentRecitations);

  // Calculate Rating Distribution
  const distribution = [
    { name: 'ممتاز', value: studentRecitations.filter(r => r.errorCount <= 3).length, color: COLORS[0] },
    { name: 'جيد جداً', value: studentRecitations.filter(r => r.errorCount > 3 && r.errorCount <= 6).length, color: COLORS[1] },
    { name: 'جيد', value: studentRecitations.filter(r => r.errorCount > 6 && r.errorCount <= 9).length, color: COLORS[2] },
    { name: 'يحتاج تركيز', value: studentRecitations.filter(r => r.errorCount > 9).length, color: COLORS[3] },
  ].filter(d => d.value > 0);

  // Calculate Weekly Activity (Last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dayStr = format(d, 'yyyy-MM-dd');
    const count = studentRecitations.filter(r => r.timestamp.startsWith(dayStr)).length;
    return { day: format(d, 'EEE', { locale: ar }), count };
  });

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
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{avgErrors}</div>
            <div className="text-xs text-muted-foreground">متوسط الأخطاء</div>
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
