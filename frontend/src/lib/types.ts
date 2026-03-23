import { api } from './api';

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  studentId?: string;
  teacherId?: string;
  adminId?: string;
  fingerprintData?: string;
  faceData?: string;
}

export interface TeacherSummary {
  _id: string;
  name: string;
  email: string;
  teacherId?: string;
}

export interface ClassSummary {
  _id: string;
  className: string;
  date: string;
  startTime: string;
  endTime: string;
  material?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'TEACHER' | 'STUDENT';
}

export interface Class {
  _id: string;
  className: string;
  teacherId: string | TeacherSummary;
  date: string;
  startTime: string;
  endTime: string;
  material: string;
  status: 'SUCCESS' | 'EMPTY';
  teacherAttended: boolean;
  studentCount: number;
  attendedStudentCount: number;
}

export interface Attendance {
  _id: string;
  userId: string | User;
  classId: string | ClassSummary;
  status: 'PRESENT' | 'ABSENT';
  fingerprintVerified: boolean;
  faceVerified: boolean;
  timestamp: string;
}

export interface Feedback {
  _id: string;
  studentId: string | User;
  classId: string | ClassSummary;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export const authApi = {
  login: (data: LoginData) => api.post('/user/login', data),
  register: (data: RegisterData) => api.post('/user/register', data),
  getProfile: () => api.get('/user/profile'),
  updateBiometric: (data: { fingerprintData?: string; faceData?: string }) =>
    api.put('/user/biometric', data),
};

export const userApi = {
  getUsers: () => api.get('/user/list'),
  deleteUser: (userId: string) => api.delete(`/user/${userId}`),
  exportAllData: (format: 'csv' | 'xlsx') =>
    api.get('/user/export', { params: { format }, responseType: 'blob' }),
};

export const attendanceApi = {
  markAttendance: (data: {
    classId: string;
    fingerprintData?: string;
    faceData?: string;
  }) => api.post('/attendance/mark', data),
  getAttendanceByClass: (classId: string) => api.get(`/attendance/class/${classId}`),
  getAttendanceByUser: () => api.get('/attendance/user'),
  getAttendanceStats: (classId: string) => api.get(`/attendance/stats/${classId}`),
};

export const classApi = {
  createClass: (data: {
    className: string;
    date: string;
    startTime: string;
    endTime: string;
    material?: string;
  }) => api.post('/class', data),
  getClasses: (params?: { teacherId?: string; date?: string }) =>
    api.get('/class', { params }),
  getAllClassesWithStatus: () => api.get('/class/all'),
  getClassById: (classId: string) => api.get(`/class/${classId}`),
  updateClassMaterial: (classId: string, material: string) =>
    api.put(`/class/${classId}/material`, { material }),
  getClassStats: () => api.get('/class/stats'),
  deleteClass: (classId: string) => api.delete(`/class/${classId}`),
};

export const feedbackApi = {
  submitFeedback: (data: {
    classId: string;
    rating: number;
    comment: string;
  }) => api.post('/feedback/submit', data),
  getFeedbackByClass: (classId: string) => api.get(`/feedback/class/${classId}`),
  getFeedbackByStudent: () => api.get('/feedback/student'),
  updateFeedback: (feedbackId: string, data: {
    rating?: number;
    comment?: string;
  }) => api.put(`/feedback/${feedbackId}`, data),
};
