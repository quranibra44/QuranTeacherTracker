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
import { Star, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      errorCount: 0,
    },
  });

  // Watch for student changes to update history
  const watchedStudentId = form.watch("studentId");
  React.useEffect(() => {
    if (watchedStudentId) setSelectedStudentId(watchedStudentId);
  }, [watchedStudentId]);

  const studentHistory = React.useMemo(() => {
    if (!selectedStudentId) return [];
    return recitations
      .filter(r => r.studentId === selectedStudentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3);
  }, [selectedStudentId, recitations]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
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

  const getBadgeColor = (errors: number) => {
    if (errors <= 3) return "bg-green-100 text-green-800 border-green-200";
    if (errors <= 6) return "bg-green-50 text-green-700 border-green-200";
    if (errors <= 9) return "bg-lime-50 text-lime-700 border-lime-200";
    return "bg-orange-100 text-orange-800 border-orange-200";
  };

  return (
    <div className="space-y-8">
      {/* Section A: Recording Form */}
      <Card className="border-t-4 border-t-primary shadow-sm">
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

              {/* Student History Box */}
              {selectedStudentId && (
                <div className="bg-accent/30 p-4 rounded-lg border border-accent animate-in slide-in-from-top-2">
                  <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                    <span className="text-xl">📜</span> سجل الطالب الأخير
                  </h4>
                  {studentHistory.length > 0 ? (
                    <div className="space-y-2">
                      {studentHistory.map(rec => {
                         const tName = teachers.find(t => t.id === rec.teacherId)?.name || 'Unknown';
                         return (
                           <div key={rec.id} className="flex justify-between items-center bg-white p-2 rounded border border-border/50 text-sm">
                             <span>صفحة {rec.pageNumber}</span>
                             <span className="text-muted-foreground">{tName}</span>
                             <span className="text-muted-foreground">{format(new Date(rec.timestamp), 'dd/MM')}</span>
                             <span className={`px-2 py-0.5 rounded text-xs ${getBadgeColor(rec.errorCount)}`}>
                               {rec.errorCount} أخطاء
                             </span>
                           </div>
                         );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">لا يوجد سجلات سابقة لهذا الطالب</p>
                  )}
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
                        <Input type="number" min={1} max={604} {...field} className="h-12 text-lg bg-white" />
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
                className="w-full h-14 text-xl bg-primary hover:bg-primary/90 transition-all"
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
          {recentActivity.length > 0 ? recentActivity.map(rec => {
            const student = students.find(s => s.id === rec.studentId);
            const teacher = teachers.find(t => t.id === rec.teacherId);
            const rating = getRating(rec.errorCount);
            
            return (
              <Card key={rec.id} className="hover:shadow-md transition-shadow duration-200 border-r-4 border-r-primary/20">
                <CardContent className="p-4 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-lg font-bold text-foreground">{student?.name || 'Unknown Student'}</span>
                    <div className="text-sm text-muted-foreground flex gap-2 items-center">
                      <span>👤 {teacher?.name}</span>
                      <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                      <span>📖 صفحة {rec.pageNumber}</span>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getBadgeColor(rec.errorCount)}`}>
                    {rec.errorCount <= 3 && <Star className="w-4 h-4 fill-current" />}
                    {rec.errorCount > 3 && rec.errorCount <= 9 && <CheckCircle2 className="w-4 h-4" />}
                    {rec.errorCount > 9 && <AlertCircle className="w-4 h-4" />}
                    <span className="font-bold text-sm">{rating}</span>
                    <span className="text-xs opacity-75">({rec.errorCount} أخطاء)</span>
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
