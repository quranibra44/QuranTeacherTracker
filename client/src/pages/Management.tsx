import React, { useState, useMemo } from 'react';
import { useAppStore, useClearDatabase } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, Download, Upload, FileText, Users, GraduationCap, Trash2, Plus, X, Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { format, subDays, isAfter, parseISO } from 'date-fns';
import { getRating } from '@/lib/types';
import { StudentDetailReport, TeacherDetailReport } from '@/components/Reports';

export default function Management() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isClearingConfirm, setIsClearingConfirm] = useState(false);
  const { teachers, students, recitations, addTeacher, deleteTeacher, addStudent, deleteStudent, exportData, importData } = useAppStore();
  const clearDatabase = useClearDatabase();

  // Login logic
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '321') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('كلمة المرور غير صحيحة');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md border-t-4 border-t-secondary shadow-lg animate-in zoom-in-95 duration-300">
          <CardHeader className="text-center">
            <div className="mx-auto bg-secondary/10 w-20 h-20 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-10 h-10 text-secondary" />
            </div>
            <CardTitle className="text-xl text-secondary mb-3">إدارة المقرأة</CardTitle>
            <p className="text-2xl text-secondary-foreground">الرجاء إدخال كلمة المرور</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input 
                type="password" 
                placeholder="كلمة المرور" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="text-center text-lg h-14 tracking-widest"
              />
              {error && <p className="text-destructive text-center text-sm font-medium">{error}</p>}
              <Button type="submit" className="w-full h-12 text-lg bg-secondary hover:bg-secondary/90 text-white">
                دخول
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Reports Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-secondary">
           <CardHeader>
             <CardTitle className="flex items-center gap-2 text-xl">
               <FileText className="w-5 h-5 text-secondary" /> تقارير المعلمات
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-3">
             <ReportDialog 
               title="تقرير المعلمات الأسبوعي" 
               type="weekly" 
               role="teacher" 
               data={teachers} 
               recitations={recitations}
             >
               <Button variant="outline" className="w-full justify-between h-14 text-lg hover:bg-secondary/5 hover:text-secondary hover:border-secondary transition-colors">
                 <span>تقرير أسبوعي (7 أيام)</span>
                 <span className="text-2xl">📅</span>
               </Button>
             </ReportDialog>
             <ReportDialog 
               title="تقرير المعلمات الشهري" 
               type="monthly" 
               role="teacher" 
               data={teachers} 
               recitations={recitations}
             >
               <Button variant="outline" className="w-full justify-between h-14 text-lg hover:bg-secondary/5 hover:text-secondary hover:border-secondary transition-colors">
                 <span>تقرير شهري</span>
                 <span className="text-2xl">📆</span>
               </Button>
             </ReportDialog>
             <ReportDialog 
               title="تقرير المعلمات السنوي" 
               type="yearly" 
               role="teacher" 
               data={teachers} 
               recitations={recitations}
             >
               <Button variant="outline" className="w-full justify-between h-14 text-lg hover:bg-secondary/5 hover:text-secondary hover:border-secondary transition-colors">
                 <span>تقرير سنوي</span>
                 <span className="text-2xl">📊</span>
               </Button>
             </ReportDialog>
           </CardContent>
        </Card>
        <Card className="border-t-4 border-t-blue-500">
           <CardHeader>
             <CardTitle className="flex items-center gap-2 text-xl">
               <FileText className="w-5 h-5 text-blue-500" /> تقارير الطالبات
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-3">
            <ReportDialog 
               title="تقرير الطالبات الأسبوعي" 
               type="weekly" 
               role="student" 
               data={students} 
               recitations={recitations}
             >
               <Button variant="outline" className="w-full justify-between h-14 text-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                 <span>تقرير أسبوعي (7 أيام)</span>
                 <span className="text-2xl">📅</span>
               </Button>
             </ReportDialog>
             <ReportDialog 
               title="تقرير الطالبات الشهري" 
               type="monthly" 
               role="student" 
               data={students} 
               recitations={recitations}
             >
               <Button variant="outline" className="w-full justify-between h-14 text-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                 <span>تقرير شهري</span>
                 <span className="text-2xl">📆</span>
               </Button>
             </ReportDialog>
             <ReportDialog 
               title="تقرير الطالبات السنوي" 
               type="yearly" 
               role="student" 
               data={students} 
               recitations={recitations}
             >
               <Button variant="outline" className="w-full justify-between h-14 text-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                 <span>تقرير سنوي</span>
                 <span className="text-2xl">📊</span>
               </Button>
             </ReportDialog>
           </CardContent>
        </Card>
      </div>

      {/* Management Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TeacherManager teachers={teachers} addTeacher={addTeacher} deleteTeacher={deleteTeacher} />
        <StudentManager students={students} addStudent={addStudent} deleteStudent={deleteStudent} />
      </div>

      {/* Statistics Section - At Bottom */}
      <Card className="overflow-hidden border-t-4 border-t-primary">
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="flex items-center gap-2 text-primary text-2xl">
            <Download className="w-6 h-6" />
            الإحصائيات
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl text-center border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl font-bold text-primary mb-1">{teachers.length}</div>
              <div className="text-sm font-medium text-muted-foreground">معلمة</div>
            </div>
            <div className="bg-white p-6 rounded-xl text-center border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl font-bold text-primary mb-1">{students.length}</div>
              <div className="text-sm font-medium text-muted-foreground">طالبة</div>
            </div>
            <div className="bg-white p-6 rounded-xl text-center border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl font-bold text-primary mb-1">{recitations.length}</div>
              <div className="text-sm font-medium text-muted-foreground">تلاوة</div>
            </div>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => exportData('csv')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg shadow-sm hover:shadow hover:-translate-y-0.5 transition-all">
              <Download className="ml-2 w-5 h-5" /> تصدير التقرير (CSV)
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex-1 h-12 text-lg shadow-sm hover:shadow hover:-translate-y-0.5 transition-all">
                  <Trash2 className="ml-2 w-5 h-5" /> مسح قاعدة البيانات
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-destructive">تحذير: مسح قاعدة البيانات</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-foreground">هل أنت متأكد من رغبتك في حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.</p>
                  <div className="flex gap-3">
                    <Button 
                      variant="destructive" 
                      onClick={clearDatabase}
                      className="flex-1"
                    >
                      نعم، احذف كل شيء
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsClearingConfirm(false)}
                      className="flex-1"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DeleteConfirmButton({ onDelete }: { onDelete: () => void }) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (isConfirming) {
    return (
      <div className="flex gap-2 animate-in fade-in zoom-in duration-200">
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={(e) => { e.stopPropagation(); onDelete(); setIsConfirming(false); }}
        >
          تأكيد الحذف
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={(e) => { e.stopPropagation(); setIsConfirming(false); }}
        >
          إلغاء
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
      onClick={(e) => { e.stopPropagation(); setIsConfirming(true); }}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}

function TeacherManager({ teachers, addTeacher, deleteTeacher }: any) {
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [multipleOpen, setMultipleOpen] = useState(false);
  const [multipleText, setMultipleText] = useState('');
  const [showAll, setShowAll] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addTeacher(name);
      setName('');
      setIsOpen(false);
    }
  };

  const handleMultipleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const names = multipleText.split('\n').filter(n => n.trim());
    names.forEach((n, i) => {
      setTimeout(() => addTeacher(n.trim()), i * 200);
    });
    setMultipleText('');
    setMultipleOpen(false);
  };

  const displayTeachers = showAll ? teachers : teachers.slice(0, 10);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-secondary" />
          المعلمات ({teachers.length})
        </CardTitle>
        <div className="flex gap-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1">
                <Plus className="w-4 h-4" /> إضافة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة معلمة جديدة</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <Input 
                  placeholder="اسم المعلمة" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="text-lg"
                />
                <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700">حفظ</Button>
              </form>
            </DialogContent>
          </Dialog>
          
           <Dialog open={multipleOpen} onOpenChange={setMultipleOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="text-secondary border-secondary hover:bg-secondary/10 text-xs">
                إضافة مجموعة مدرسين
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة عدة مدرسين</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleMultipleSubmit} className="space-y-4 mt-4">
                <div className="text-sm text-muted-foreground">أدخل كل اسم في سطر منفصل</div>
                <Textarea 
                  placeholder="أحمد محمد&#10;فاطمة علي&#10;عائشة حسن" 
                  rows={5}
                  value={multipleText} 
                  onChange={e => setMultipleText(e.target.value)} 
                  className="text-lg"
                />
                <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700">إضافة الكل</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
          {teachers.length === 0 ? (
            <p className="text-muted-foreground text-center py-10 bg-muted/20 rounded-lg border border-dashed">لا توجد معلمات</p>
          ) : (
            <>
              {displayTeachers.map((t: any, i: number) => (
                <div key={t.id} className="flex items-center justify-between bg-white border p-3 rounded-md group hover:border-secondary/50 hover:shadow-sm transition-all">
                  <span className="font-medium flex gap-3">
                    <span className="text-muted-foreground w-6 text-center">{i + 1}.</span>
                    {t.name}
                  </span>
                  <DeleteConfirmButton onDelete={() => deleteTeacher(t.id)} />
                </div>
              ))}
              {teachers.length > 10 && !showAll && (
                <Button 
                  variant="ghost" 
                  className="w-full mt-2 text-primary hover:bg-primary/5"
                  onClick={() => setShowAll(true)}
                >
                  عرض الكل ({teachers.length})
                </Button>
              )}
              {showAll && teachers.length > 10 && (
                <Button 
                  variant="ghost" 
                  className="w-full mt-2 text-muted-foreground hover:bg-muted/20"
                  onClick={() => setShowAll(false)}
                >
                  إخفاء الإضافيين
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StudentManager({ students, addStudent, deleteStudent }: any) {
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [multipleOpen, setMultipleOpen] = useState(false);
  const [multipleText, setMultipleText] = useState('');
  const [showAll, setShowAll] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addStudent(name);
      setName('');
      setIsOpen(false);
    }
  };

  const handleMultipleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const names = multipleText.split('\n').filter(n => n.trim());
    names.forEach((n, i) => {
      setTimeout(() => addStudent(n.trim()), i * 200);
    });
    setMultipleText('');
    setMultipleOpen(false);
  };

  const displayStudents = showAll ? students : students.slice(0, 10);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-secondary" />
          الطالبات ({students.length})
        </CardTitle>
        <div className="flex gap-2">
            {/* Add Single Student */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1">
                <Plus className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>إضافة طالبة جديدة</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <Input 
                    placeholder="اسم الطالبة" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="text-lg"
                />
                <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700">حفظ</Button>
                </form>
            </DialogContent>
            </Dialog>

            {/* Bulk Add Students */}
            <Dialog open={multipleOpen} onOpenChange={setMultipleOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-secondary border-secondary hover:bg-secondary/10 text-xs">
                إضافة مجموعة طلاب
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>إضافة عدة طلاب</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleMultipleSubmit} className="space-y-4 mt-4">
                <div className="text-sm text-muted-foreground">أدخل كل اسم في سطر منفصل</div>
                <Textarea 
                    placeholder="فاطمة أحمد&#10;عائشة محمد&#10;خديجة علي" 
                    rows={5}
                    value={multipleText} 
                    onChange={e => setMultipleText(e.target.value)} 
                    className="text-lg"
                />
                <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700">إضافة الكل</Button>
                </form>
            </DialogContent>
            </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
          {students.length === 0 ? (
            <p className="text-muted-foreground text-center py-10 bg-muted/20 rounded-lg border border-dashed">لا توجد طالبات</p>
          ) : (
            <>
              {displayStudents.map((s: any, i: number) => (
                <div key={s.id} className="flex items-center justify-between bg-white border p-3 rounded-md group hover:border-secondary/50 hover:shadow-sm transition-all">
                   <span className="font-medium flex gap-3">
                    <span className="text-muted-foreground w-6 text-center">{i + 1}.</span>
                    {s.name}
                  </span>
                  <DeleteConfirmButton onDelete={() => deleteStudent(s.id)} />
                </div>
              ))}
              {students.length > 10 && !showAll && (
                <Button 
                  variant="ghost" 
                  className="w-full mt-2 text-primary hover:bg-primary/5"
                  onClick={() => setShowAll(true)}
                >
                  عرض الكل ({students.length})
                </Button>
              )}
              {showAll && students.length > 10 && (
                <Button 
                  variant="ghost" 
                  className="w-full mt-2 text-muted-foreground hover:bg-muted/20"
                  onClick={() => setShowAll(false)}
                >
                  إخفاء الإضافيين
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ReportDialog({ title, type, role, data, recitations, children }: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [sort, setSort] = useState('most');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Filter Logic
  const filteredData = useMemo(() => {
    let cutoffDate;
    
    if (type === 'weekly') {
      cutoffDate = subDays(new Date(), 7);
    } else if (type === 'monthly') {
      // Get first day of selected month
      const firstDay = new Date(selectedYear, selectedMonth, 1);
      cutoffDate = firstDay;
    } else { // yearly
      // Get first day of selected year
      const firstDay = new Date(selectedYear, 0, 1);
      cutoffDate = firstDay;
    }

    return data.filter((item: any) => {
      // Search
      if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      
      // Get item's recitations in period
      const itemRecitations = recitations.filter((r: any) => {
        const rDate = parseISO(r.timestamp);
        return isAfter(rDate, cutoffDate) && (role === 'teacher' ? r.teacherId === item.id : r.studentId === item.id);
      });

      const isActive = itemRecitations.length > 0;

      // Filter
      if (filter === 'active' && !isActive) return false;
      if (filter === 'inactive' && isActive) return false;

      // Attach stats for sorting
      item.stats = {
        count: itemRecitations.length,
        errors: itemRecitations.reduce((acc: number, curr: any) => acc + curr.errorCount, 0),
        days: new Set(itemRecitations.map((r: any) => r.timestamp.split('T')[0])).size,
        uniqueStudents: role === 'teacher' 
          ? new Set(itemRecitations.map((r: any) => r.studentId)).size 
          : 0
      };

      return true;
    }).sort((a: any, b: any) => {
      // For student reports: sort by days
      if (role === 'student') {
        if (sort === 'most') return b.stats.days - a.stats.days;
        if (sort === 'least') return a.stats.days - b.stats.days;
      } else {
        // For teacher reports: sort by days
        if (sort === 'most') return b.stats.days - a.stats.days;
        if (sort === 'least') return a.stats.days - b.stats.days;
      }
      if (sort === 'name-asc') return a.name.localeCompare(b.name);
      if (sort === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });
  }, [data, recitations, searchTerm, filter, sort, type, role, selectedMonth, selectedYear]);

  // Summary stats
  const totalRecitations = filteredData.reduce((acc: number, curr: any) => acc + curr.stats.count, 0);
  const activeCount = filteredData.filter((i: any) => i.stats.count > 0).length;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-2 border-b bg-muted/20">
          <DialogTitle className="text-2xl text-primary">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 border-b bg-white grid gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              placeholder={`🔍 بحث عن ${role === 'teacher' ? 'معلمة' : 'طالبة'}...`} 
              className="pr-10 h-12 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {type === 'yearly' && (
            <div className="flex gap-3 flex-wrap">
              <Select value={String(selectedMonth)} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="اختر الشهر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">يناير</SelectItem>
                  <SelectItem value="1">فبراير</SelectItem>
                  <SelectItem value="2">مارس</SelectItem>
                  <SelectItem value="3">أبريل</SelectItem>
                  <SelectItem value="4">مايو</SelectItem>
                  <SelectItem value="5">يونيو</SelectItem>
                  <SelectItem value="6">يوليو</SelectItem>
                  <SelectItem value="7">أغسطس</SelectItem>
                  <SelectItem value="8">سبتمبر</SelectItem>
                  <SelectItem value="9">أكتوبر</SelectItem>
                  <SelectItem value="10">نوفمبر</SelectItem>
                  <SelectItem value="11">ديسمبر</SelectItem>
                </SelectContent>
              </Select>
              <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="اختر السنة" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 justify-between">
            <div className="flex gap-2">
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'} 
                onClick={() => setFilter('all')}
                size="sm"
              >
                الكل
              </Button>
              <Button 
                variant={filter === 'active' ? 'default' : 'outline'} 
                onClick={() => setFilter('active')}
                size="sm"
                className={filter === 'active' ? 'bg-green-600' : ''}
              >
                نشط
              </Button>
              <Button 
                variant={filter === 'inactive' ? 'default' : 'outline'} 
                onClick={() => setFilter('inactive')}
                size="sm"
                className={filter === 'inactive' ? 'bg-orange-500' : ''}
              >
                غير نشط
              </Button>
            </div>
            <Select value={sort} onValueChange={setSort}>
               <SelectTrigger className="w-[180px]">
                 <SelectValue placeholder="ترتيب حسب" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="most">{role === 'student' ? 'أكثر أيام' : 'أكثر أيام'}</SelectItem>
                 <SelectItem value="least">{role === 'student' ? 'أقل أيام' : 'أقل أيام'}</SelectItem>
                 <SelectItem value="name-asc">الاسم (أ-ي)</SelectItem>
                 <SelectItem value="name-desc">الاسم (ي-أ)</SelectItem>
               </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-muted/10">
          <div className="space-y-2">
            {filteredData.map((item: any, i: number) => (
              <Dialog key={item.id}>
                <DialogTrigger asChild>
                  <div className="p-4 bg-white border rounded-lg hover:border-primary hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-muted-foreground font-medium w-6 text-center">{i+1}.</span>
                        <div className="flex-1">
                          <div className="font-bold text-lg">{item.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="font-bold text-lg text-primary">{item.stats.days}</div>
                          <div className="text-xs text-muted-foreground">أيام</div>
                        </div>
                        {role === 'student' && (
                          <div className="text-center">
                            <div className="font-bold text-lg text-red-600">{item.stats.errors}</div>
                            <div className="text-xs text-muted-foreground">أخطاء</div>
                          </div>
                        )}
                        {role === 'teacher' && (
                          <div className="text-center">
                            <div className="font-bold text-lg text-primary">{item.stats.uniqueStudents}</div>
                            <div className="text-xs text-muted-foreground">طالبات</div>
                          </div>
                        )}
                        {item.stats.count > 0 && <span className="text-yellow-500 text-xl">⭐</span>}
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-primary border-b pb-2 mb-4">
                      تقرير تفصيلي: {item.name}
                    </DialogTitle>
                  </DialogHeader>
                  {role === 'student' ? (
                    <StudentDetailReport student={item} recitations={recitations} />
                  ) : (
                    <TeacherDetailReport teacher={item} recitations={recitations} />
                  )}
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>

        <div className="p-4 border-t bg-white flex justify-between items-center text-sm font-medium">
          <div>عدد النشطين: {activeCount}</div>
          <div>إجمالي التلاوات: {totalRecitations}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
