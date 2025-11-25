import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
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
  const { teachers, students, recitations, addTeacher, deleteTeacher, addStudent, deleteStudent, exportData, importData } = useAppStore();

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
            <CardTitle className="text-2xl text-secondary-foreground">الرجاء إدخال كلمة المرور</CardTitle>
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
      {/* Section A: Backup */}
      <Card className="overflow-hidden border-t-4 border-t-primary">
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="flex items-center gap-2 text-primary text-2xl">
            <Download className="w-6 h-6" />
            النسخ الاحتياطي والإحصائيات
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl text-center border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl font-bold text-primary mb-1">{teachers.length}</div>
              <div className="text-sm font-medium text-muted-foreground">معلم</div>
            </div>
            <div className="bg-white p-6 rounded-xl text-center border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl font-bold text-primary mb-1">{students.length}</div>
              <div className="text-sm font-medium text-muted-foreground">طالب</div>
            </div>
            <div className="bg-white p-6 rounded-xl text-center border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl font-bold text-primary mb-1">{recitations.length}</div>
              <div className="text-sm font-medium text-muted-foreground">تلاوة</div>
            </div>
          </div>
          <div className="flex gap-4">
            <Button onClick={exportData} className="flex-1 bg-primary text-white h-12 text-lg shadow-sm hover:shadow hover:-translate-y-0.5 transition-all">
              <Download className="ml-2 w-5 h-5" /> تصدير البيانات
            </Button>
            <div className="relative flex-1">
              <input 
                type="file" 
                id="import-file" 
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      try {
                        const data = JSON.parse(ev.target?.result as string);
                        importData(data);
                      } catch(err) {
                        console.error(err);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
              <Button variant="outline" className="w-full h-12 border-primary text-primary hover:bg-primary/5 text-lg">
                <Upload className="ml-2 w-5 h-5" /> استيراد البيانات
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-secondary">
           <CardHeader>
             <CardTitle className="flex items-center gap-2 text-xl">
               <FileText className="w-5 h-5 text-secondary" /> تقارير المعلمين
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-3">
             <ReportDialog 
               title="تقرير المعلمين الأسبوعي" 
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
               title="تقرير المعلمين الشهري" 
               type="monthly" 
               role="teacher" 
               data={teachers} 
               recitations={recitations}
             >
               <Button variant="outline" className="w-full justify-between h-14 text-lg hover:bg-secondary/5 hover:text-secondary hover:border-secondary transition-colors">
                 <span>تقرير شهري (30 يوم)</span>
                 <span className="text-2xl">📆</span>
               </Button>
             </ReportDialog>
           </CardContent>
        </Card>
        <Card className="border-t-4 border-t-blue-500">
           <CardHeader>
             <CardTitle className="flex items-center gap-2 text-xl">
               <FileText className="w-5 h-5 text-blue-500" /> تقارير الطلاب
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-3">
            <ReportDialog 
               title="تقرير الطلاب الأسبوعي" 
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
               title="تقرير الطلاب الشهري" 
               type="monthly" 
               role="student" 
               data={students} 
               recitations={recitations}
             >
               <Button variant="outline" className="w-full justify-between h-14 text-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                 <span>تقرير شهري (30 يوم)</span>
                 <span className="text-2xl">📆</span>
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addTeacher(name);
      setName('');
      setIsOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-secondary" />
          المعلمين ({teachers.length})
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
                <DialogTitle>إضافة معلم جديد</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <Input 
                  placeholder="اسم المعلم" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="text-lg"
                />
                <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700">حفظ</Button>
              </form>
            </DialogContent>
          </Dialog>
          
           {/* Multiple Add Teacher - Simplified for now */}
           <Button size="sm" variant="outline" className="text-secondary border-secondary hover:bg-secondary/10 gap-1">
                📝
           </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
          {teachers.length === 0 ? (
            <p className="text-muted-foreground text-center py-10 bg-muted/20 rounded-lg border border-dashed">لا يوجد معلمين</p>
          ) : (
            teachers.map((t: any, i: number) => (
              <div key={t.id} className="flex items-center justify-between bg-white border p-3 rounded-md group hover:border-secondary/50 hover:shadow-sm transition-all">
                <span className="font-medium flex gap-3">
                  <span className="text-muted-foreground w-6 text-center">{i + 1}.</span>
                  {t.name}
                </span>
                <DeleteConfirmButton onDelete={() => deleteTeacher(t.id)} />
              </div>
            ))
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


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-secondary" />
          الطلاب ({students.length})
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
                <DialogTitle>إضافة طالب جديد</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <Input 
                    placeholder="اسم الطالب" 
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
                <Button size="sm" variant="outline" className="text-secondary border-secondary hover:bg-secondary/10 gap-1">
                📝
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
            <p className="text-muted-foreground text-center py-10 bg-muted/20 rounded-lg border border-dashed">لا يوجد طلاب</p>
          ) : (
            students.map((s: any, i: number) => (
              <div key={s.id} className="flex items-center justify-between bg-white border p-3 rounded-md group hover:border-secondary/50 hover:shadow-sm transition-all">
                 <span className="font-medium flex gap-3">
                  <span className="text-muted-foreground w-6 text-center">{i + 1}.</span>
                  {s.name}
                </span>
                <DeleteConfirmButton onDelete={() => deleteStudent(s.id)} />
              </div>
            ))
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

  // Filter Logic
  const filteredData = useMemo(() => {
    const days = type === 'weekly' ? 7 : 30;
    const cutoffDate = subDays(new Date(), days);

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
      if (sort === 'most') return b.stats.count - a.stats.count;
      if (sort === 'least') return a.stats.count - b.stats.count;
      if (sort === 'name-asc') return a.name.localeCompare(b.name);
      if (sort === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });
  }, [data, recitations, searchTerm, filter, sort, type, role]);

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
              placeholder={`🔍 بحث عن ${role === 'teacher' ? 'معلم' : 'طالب'}...`} 
              className="pr-10 h-12 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
                 <SelectItem value="most">الأكثر تسجيلاً</SelectItem>
                 <SelectItem value="least">الأقل تسجيلاً</SelectItem>
                 <SelectItem value="name-asc">الاسم (أ-ي)</SelectItem>
                 <SelectItem value="name-desc">الاسم (ي-أ)</SelectItem>
               </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-muted/10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((item: any, i: number) => (
              <Dialog key={item.id}>
                <DialogTrigger asChild>
                  <Card className="overflow-hidden hover:shadow-md transition-all cursor-pointer hover:border-primary group">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="font-bold text-lg truncate flex gap-2">
                          <span className="text-muted-foreground group-hover:text-primary transition-colors">{i+1}.</span>
                          {item.name}
                        </div>
                        {item.stats.count > 0 && <span className="text-yellow-500 text-xl">⭐</span>}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center text-sm mb-3">
                        <div className="bg-muted/30 p-2 rounded group-hover:bg-primary/5 transition-colors">
                          <div className="font-bold text-primary">{item.stats.days}</div>
                          <div className="text-xs text-muted-foreground">أيام</div>
                        </div>
                        <div className="bg-muted/30 p-2 rounded group-hover:bg-primary/5 transition-colors">
                          <div className="font-bold text-primary">
                            {role === 'teacher' ? item.stats.uniqueStudents : item.stats.errors}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {role === 'teacher' ? 'طلاب' : 'أخطاء'}
                          </div>
                        </div>
                        <div className="bg-muted/30 p-2 rounded group-hover:bg-primary/5 transition-colors">
                          <div className="font-bold text-primary">{item.stats.count}</div>
                          <div className="text-xs text-muted-foreground">تلاوة</div>
                        </div>
                      </div>
                      <div className="text-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                         اضغط للتفاصيل
                      </div>
                    </CardContent>
                  </Card>
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
