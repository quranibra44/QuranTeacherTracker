import React, { createContext, useContext, useState, useEffect } from 'react';
import { Teacher, Student, Recitation, initialTeachers, initialStudents } from './types';
import { useToast } from '@/hooks/use-toast';

interface AppContextType {
  teachers: Teacher[];
  students: Student[];
  recitations: Recitation[];
  addTeacher: (name: string) => void;
  deleteTeacher: (id: string) => void;
  addStudent: (name: string) => void;
  deleteStudent: (id: string) => void;
  addRecitation: (recitation: Omit<Recitation, 'id' | 'timestamp'>) => void;
  addRecitationBatch: (items: Omit<Recitation, 'id' | 'timestamp'>[]) => void;
  importData: (data: any) => void;
  exportData: (format?: 'csv') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // Initialize from localStorage or defaults (start with empty database)
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('teachers');
    return saved ? JSON.parse(saved) : [];
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('students');
    return saved ? JSON.parse(saved) : [];
  });

  const [recitations, setRecitations] = useState<Recitation[]>(() => {
    const saved = localStorage.getItem('recitations');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist to localStorage
  useEffect(() => { localStorage.setItem('teachers', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem('students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('recitations', JSON.stringify(recitations)); }, [recitations]);

  const addTeacher = (name: string) => {
    const newTeacher: Teacher = {
      id: `teacher_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name,
      createdAt: new Date().toISOString()
    };
    setTeachers(prev => [...prev, newTeacher]);
    toast({ title: "Teacher added successfully ✓", className: "bg-primary text-white border-none" });
  };

  const deleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
    toast({ title: "Deleted successfully", className: "bg-primary text-white border-none" });
  };

  const addStudent = (name: string) => {
    const newStudent: Student = {
      id: `student_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name,
      createdAt: new Date().toISOString()
    };
    setStudents(prev => [...prev, newStudent]);
    toast({ title: "Student added successfully ✓", className: "bg-primary text-white border-none" });
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    // Also delete all recitations related to this student
    setRecitations(prev => prev.filter(r => r.studentId !== id));
    toast({ title: "Deleted successfully", className: "bg-primary text-white border-none" });
  };

  const addRecitation = (data: Omit<Recitation, 'id' | 'timestamp'>) => {
    const newRecitation: Recitation = {
      ...data,
      id: `reading_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    
    if (teachers.length + students.length + recitations.length >= 999) {
      toast({ title: "Maximum limit of 999 records reached", variant: "destructive" });
      return;
    }

    setRecitations(prev => [newRecitation, ...prev]);
    toast({ title: "Recitation recorded successfully", className: "bg-primary text-white border-none" });
  };

  const addRecitationBatch = (items: Omit<Recitation, 'id' | 'timestamp'>[]) => {
    if (teachers.length + students.length + recitations.length + items.length > 999) {
      toast({ title: "Cannot add all records: Limit reached", variant: "destructive" });
      return;
    }

    const newRecitations = items.map((item, index) => ({
      ...item,
      id: `reading_${Date.now()}_${index}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    }));

    setRecitations(prev => [...newRecitations, ...prev]);
    toast({ title: `Added ${items.length} records successfully`, className: "bg-primary text-white border-none" });
  };

  const exportData = (format: 'csv' = 'csv') => {
    // UTF-8 BOM for proper Arabic support in Excel
    const BOM = '\uFEFF';
    
    const getRating = (errors: number) => {
      if (errors <= 3) return 'ممتاز';
      if (errors <= 6) return 'جيد جداً';
      if (errors <= 9) return 'جيد';
      return 'يحتاج تركيز';
    };
    
    // Properly escape CSV values with quotes
    const escapeCsv = (value: string | number): string => {
      const strValue = String(value);
      // Always quote to preserve Arabic text properly in Excel
      return `"${strValue.replace(/"/g, '""')}"`;
    };
    
    // Header row - comma-separated with quotes
    let csv = BOM + '"المعلمة","الطالبة","الصفحة","الأخطاء","التاريخ والوقت","التقييم"\n';
    
    // Data rows
    recitations.forEach(rec => {
      const teacher = teachers.find(t => t.id === rec.teacherId)?.name || 'غير معروف';
      const student = students.find(s => s.id === rec.studentId)?.name || 'غير معروف';
      const date = new Date(rec.timestamp).toLocaleDateString('ar-SA');
      const time = new Date(rec.timestamp).toLocaleTimeString('ar-SA');
      const rating = getRating(rec.errorCount);
      const row = [
        escapeCsv(teacher),
        escapeCsv(student),
        escapeCsv(rec.pageNumber),
        escapeCsv(rec.errorCount),
        escapeCsv(`${date} ${time}`),
        escapeCsv(rating)
      ].join(',');
      csv += row + '\n';
    });
    
    // Use UTF-8 encoding with BOM for proper Arabic character support
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quran-tracking-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({ title: `تم تصدير ${recitations.length} تلاوة كتقرير`, className: "bg-primary text-white border-none" });
  };

  const clearDatabase = () => {
    setTeachers([]);
    setStudents([]);
    setRecitations([]);
    localStorage.removeItem('teachers');
    localStorage.removeItem('students');
    localStorage.removeItem('recitations');
    toast({ title: 'تم مسح قاعدة البيانات بنجاح', className: "bg-primary text-white border-none" });
  };

  const importData = (data: any) => {
    try {
      if (data.teachers) setTeachers(prev => [...prev, ...data.teachers]);
      if (data.students) setStudents(prev => [...prev, ...data.students]);
      if (data.readings) setRecitations(prev => [...prev, ...data.readings]);
      toast({ title: "Import successful", className: "bg-primary text-white border-none" });
    } catch (e) {
      toast({ title: "Failed to import", variant: "destructive" });
    }
  };

  return (
    <AppContext.Provider value={{
      teachers, students, recitations,
      addTeacher, deleteTeacher,
      addStudent, deleteStudent,
      addRecitation, addRecitationBatch,
      importData, exportData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
};

export const useClearDatabase = () => {
  return () => {
    localStorage.removeItem('teachers');
    localStorage.removeItem('students');
    localStorage.removeItem('recitations');
    window.location.reload();
  };
};
