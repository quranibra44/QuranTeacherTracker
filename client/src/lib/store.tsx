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
  importData: (data: any) => void;
  exportData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // Initialize from localStorage or defaults
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('teachers');
    return saved ? JSON.parse(saved) : initialTeachers;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('students');
    return saved ? JSON.parse(saved) : initialStudents;
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

  const exportData = () => {
    const data = {
      version: 1,
      exportDate: new Date().toISOString(),
      teachers,
      students,
      readings: recitations,
      totalRecords: teachers.length + students.length + recitations.length
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quran-tracking-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({ title: `Exported ${data.totalRecords} records`, className: "bg-primary text-white border-none" });
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
      addRecitation,
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
