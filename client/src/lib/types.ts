export type Teacher = {
  id: string;
  name: string;
  createdAt: string;
};

export type Student = {
  id: string;
  name: string;
  createdAt: string;
};

export type Recitation = {
  id: string;
  teacherId: string;
  studentId: string;
  pageNumber: number;
  errorCount: number;
  timestamp: string;
  isBulkImport?: boolean;
};

export type PerformanceRating = 'Excellent' | 'Very Good' | 'Good' | 'Needs Attention';

export const getRating = (errors: number): PerformanceRating => {
  if (errors <= 3) return 'Excellent';
  if (errors <= 6) return 'Very Good';
  if (errors <= 9) return 'Good';
  return 'Needs Attention';
};

export const initialTeachers: Teacher[] = [
  { id: 'teacher_1', name: 'الشيخ أحمد', createdAt: new Date().toISOString() },
  { id: 'teacher_2', name: 'الشيخة فاطمة', createdAt: new Date().toISOString() },
];

export const initialStudents: Student[] = [
  { id: 'student_1', name: 'محمد علي', createdAt: new Date().toISOString() },
  { id: 'student_2', name: 'يوسف عمر', createdAt: new Date().toISOString() },
  { id: 'student_3', name: 'مريم حسن', createdAt: new Date().toISOString() },
];
