import React from 'react';
import { useAppStore } from '@/lib/store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRating } from '@/lib/types';
import { Star, CheckCircle2, AlertCircle, BookOpen, TrendingUp, Award } from 'lucide-react';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getQuranContext } from '@/lib/quran-data';
import { calculateBadges } from '@/lib/badges';

const formSchema = z.object({
  teacherId: z.string().min(1, "Required"),
  studentId: z.string().min(1, "Required"),
  pageNumber: z.coerce.number().min(1).max(604),
  errorCount: z.coerce.number().min(0),
});

export default function Tracking() {
  const { teachers, students, recitations, addRecitation } = useAppStore();
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [pageContext, setPageContext] = React.useState<{surah: string, juz: number} | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      errorCount: 0,
    },
  });

  // Watch page number for context
  const watchedPage = form.watch("pageNumber");
  React.useEffect(() => {
    if (watchedPage) {
      const context = getQuranContext(watchedPage);
      setPageContext(context);
    } else {
      setPageContext(null);
    }
  }, [watchedPage]);

  // Watch for student changes to update history and predict next page
  const watchedStudentId = form.watch("studentId");
  
  React.useEffect(() => {
    if (watchedStudentId) {
      setSelectedStudentId(watchedStudentId);
      
      // Smart Prediction: Find last page read and suggest next one
      const studentRecitations = recitations
        .filter(r => r.studentId === watchedStudentId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
      if (studentRecitations.length > 0) {
        const lastPage = studentRecitations[0].pageNumber;
        if (lastPage < 604) {
          form.setValue("pageNumber", lastPage + 1);
        }
      }
    }
  }, [watchedStudentId, recitations, form]);

  const studentHistory = React.useMemo(() => {
    if (!selectedStudentId) return [];
    return recitations
      .filter(r => r.studentId === selectedStudentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Get last 10 for chart
  }, [selectedStudentId, recitations]);
  
  const earnedBadges = React.useMemo(() => {
    if (!selectedStudentId) return [];
    const allStudentRecitations = recitations.filter(r => r.studentId === selectedStudentId);
    return calculateBadges(allStudentRecitations);
  }, [selectedStudentId, recitations]);

  // Prepare chart data (reverse chronological for chart L-R)
  const chartData = React.useMemo(() => {
    return [...studentHistory].reverse().map(r => ({
      date: format(new Date(r.timestamp), 'dd/MM'),
      errors: r.errorCount,
      page: r.pageNumber
    }));
  }, [studentHistory]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    // Confetti if Excellent
    if (values.errorCount <= 3) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4a8b60', '#d4a574', '#ffffff']
      });
    }

    // Simulate network delay
    setTimeout(() => {
      addRecitation(values);
      form.reset({
        teacherId: values.teacherId, // Keep teacher selected
        studentId: '',
        pageNumber: undefined,
        errorCount: 0
      });
      setSelectedStudentId(null);
      setIsSubmitting(false);
    }, 600);
  }

  // Activity Feed
  const recentActivity = recitations
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
  
  // Arabic rating labels
  const getRatingLabel = (errors: number) => {
    if (errors <= 3) return 'ممتاز';
    if (errors <= 6) return 'جيد جداً';
    if (errors <= 9) return 'جيد';
    return 'يحتاج تركيز';
  };

  const getBadgeColor = (errors: number) => {
    if (errors <= 3) return "bg-green-100 text-green-800 border-green-200";
    if (errors <= 6) return "bg-green-50 text-green-700 border-green-200";
    if (errors <= 9) return "bg-lime-50 text-lime-700 border-lime-200";
    return "bg-orange-100 text-orange-800 border-orange-200";
  };

  return (
    <div className="space-y-8">
      {/* Section A: Recording Form */}
      <Card className="border-t-4 border-t-primary shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            تسجيل تلاوة جديدة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="teacherId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اختر المعلم</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 text-lg bg-white">
                            <SelectValue placeholder="اختر المعلم" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teachers.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اختر الطالب</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 text-lg bg-white">
                            <SelectValue placeholder="اختر الطالب" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {students.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Student Smart Insights Box */}
              {selectedStudentId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 fade-in">
                  {/* Last 3 Records */}
                  <div className="bg-accent/30 p-4 rounded-lg border border-accent flex flex-col">
                    <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                      <span className="text-xl">📜</span> آخر التلاوات
                    </h4>
                    {studentHistory.length > 0 ? (
                      <div className="space-y-2 mb-3">
                        {studentHistory.slice(0, 3).map(rec => {
                           const tName = teachers.find(t => t.id === rec.teacherId)?.name || 'Unknown';
                           return (
                             <div key={rec.id} className="flex justify-between items-center bg-white p-2 rounded border border-border/50 text-sm">
                               <span>صفحة {rec.pageNumber}</span>
                               <span className="text-muted-foreground text-xs">{tName}</span>
                               <span className={`px-2 py-0.5 rounded text-xs ${getBadgeColor(rec.errorCount)}`}>
                                 {rec.errorCount} أخطاء
                               </span>
                             </div>
                           );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm mb-3">لا يوجد سجلات سابقة</p>
                    )}
                    
                    {/* Badges Row */}
                    <div className="mt-auto pt-2 border-t border-border/50">
                       <div className="flex items-center gap-1 mb-2">
                         <Award className="w-4 h-4 text-yellow-600" />
                         <span className="text-sm font-bold text-primary">أوسمة الطالب</span>
                       </div>
                       <div className="flex flex-wrap gap-2">
                         {earnedBadges.length > 0 ? earnedBadges.map(badge => (
                           <div key={badge.id} className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 border ${badge.color}`} title={badge.description}>
                             <span>{badge.icon}</span>
                             <span>{badge.name}</span>
                           </div>
                         )) : (
                           <span className="text-xs text-muted-foreground">لم يحصل على أوسمة بعد</span>
                         )}
                       </div>
                    </div>
                  </div>

                  {/* Progress Chart */}
                  <div className="bg-white p-4 rounded-lg border border-border shadow-sm">
                     <h4 className="font-bold text-primary mb-2 flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4" /> منحنى الأخطاء (آخر 10)
                    </h4>
                    <div className="h-[120px] w-full">
                      {chartData.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4a8b60" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#4a8b60" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="page" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                            <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} width={20} />
                            <Tooltip 
                              contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                              labelStyle={{color: '#666'}}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="errors" 
                              stroke="#4a8b60" 
                              strokeWidth={2}
                              fillOpacity={1} 
                              fill="url(#colorErrors)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                         <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                           بيانات غير كافية للرسم البياني
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="pageNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الصفحة (1-604)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="number" min={1} max={604} {...field} className="h-12 text-lg bg-white" />
                          {pageContext && (
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground bg-muted/20 px-2 py-1 rounded pointer-events-none flex items-center gap-2">
                              <span className="font-bold text-primary">{pageContext.surah}</span>
                              <span className="w-px h-4 bg-border"></span>
                              <span>جزء {pageContext.juz}</span>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="errorCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عدد الأخطاء</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} className="h-12 text-lg bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-14 text-xl bg-primary hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                {isSubmitting ? "جاري الحفظ..." : "تسجيل التلاوة"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Section B: Recent Activity Feed */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-primary mb-4 border-r-4 border-secondary pr-3">آخر التلاوات المسجلة</h3>
        <div className="grid gap-4">
          {recentActivity.filter(rec => {
            // Only show if student and teacher still exist
            return students.some(s => s.id === rec.studentId) && teachers.some(t => t.id === rec.teacherId);
          }).length > 0 ? recentActivity.filter(rec => {
            return students.some(s => s.id === rec.studentId) && teachers.some(t => t.id === rec.teacherId);
          }).map(rec => {
            const student = students.find(s => s.id === rec.studentId);
            const teacher = teachers.find(t => t.id === rec.teacherId);
            const rating = getRating(rec.errorCount);
            
            return (
              <Card key={rec.id} className="hover:shadow-md transition-shadow duration-200 border-r-4 border-r-primary/20">
                <CardContent className="p-4 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-lg font-bold text-foreground">{student?.name || 'Unknown'}</span>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      <div>👤 {teacher?.name || 'Unknown'}</div>
                      <div>📅 {format(new Date(rec.timestamp), 'dd/MM/yyyy HH:mm')}</div>
                      <div>📖 صفحة {rec.pageNumber}</div>
                    </div>
                  </div>
                  
                  <div className={`flex flex-col items-center gap-2 px-4 py-2 rounded-lg border ${getBadgeColor(rec.errorCount)}`}>
                    <span className="font-bold text-sm">{getRatingLabel(rec.errorCount)}</span>
                    <span className="text-xs opacity-75">{rec.errorCount} أخطاء</span>
                  </div>
                </CardContent>
              </Card>
            );
          }) : (
            <div className="text-center py-10 text-muted-foreground bg-white rounded-lg border border-dashed">
              لا توجد تسجيلات حتى الآن
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
