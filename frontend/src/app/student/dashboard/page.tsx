'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from '@/lib/toast';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Fingerprint, 
  MessageSquare,
  LogOut,
  Camera,
  User
} from 'lucide-react';
import { attendanceApi, classApi, feedbackApi, Class, Attendance, Feedback } from '@/lib/types';
import { getUser, logout, isStudent } from '@/lib/auth';
import useIsClient from '@/hooks/useIsClient';

export default function StudentDashboard() {
  const router = useRouter();
  const isClient = useIsClient();
  const [user, setUser] = useState(getUser());
  const [classes, setClasses] = useState<Class[]>([]);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('classes');
  const [feedbackForm, setFeedbackForm] = useState<{[key: string]: {rating: number, comment: string}}>({});

  useEffect(() => {
    if (!isClient) return;
    
    if (!isStudent()) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [router, isClient]);

  const fetchData = async () => {
    if (!isClient) return;
    
    try {
      const [classesRes, allClassesRes, attendanceRes, feedbackRes] = await Promise.all([
        classApi.getClasses(),
        classApi.getAllClassesWithStatus(),
        attendanceApi.getAttendanceByUser(),
        feedbackApi.getFeedbackByStudent()
      ]);

      setClasses(classesRes.data.data || []);
      setAllClasses(allClassesRes.data.data || []);
      setAttendance(attendanceRes.data.data || []);
      setFeedback(feedbackRes.data.data || []);
    } catch (error) {
      if (isClient) {
        toast.error('Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (classId: string) => {
    try {
      // For demo purposes, we'll simulate biometric data
      const fingerprintData = `fingerprint_${user?.id}_${Date.now()}`;
      const faceData = `face_${user?.id}_${Date.now()}`;

      await attendanceApi.markAttendance({
        classId,
        fingerprintData,
        faceData
      });

      toast.success('Attendance marked successfully!');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const handleSubmitFeedback = async (classId: string) => {
    const formData = feedbackForm[classId];
    if (!formData || !formData.rating || !formData.comment.trim()) {
      toast.error('Please provide both rating and comment');
      return;
    }

    try {
      await feedbackApi.submitFeedback({
        classId,
        rating: formData.rating,
        comment: formData.comment
      });

      toast.success('Feedback submitted successfully!');
      // Clear the form
      setFeedbackForm(prev => {
        const newForm = { ...prev };
        delete newForm[classId];
        return newForm;
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    }
  };

  const updateFeedbackForm = (classId: string, field: 'rating' | 'comment', value: number | string) => {
    setFeedbackForm(prev => ({
      ...prev,
      [classId]: {
        rating: field === 'rating' ? value as number : prev[classId]?.rating || 1,
        comment: field === 'comment' ? value as string : prev[classId]?.comment || ''
      }
    }));
  };

  const hasSubmittedFeedback = (classId: string) => {
    return feedback.some(f => {
      if (typeof f.classId === 'object' && f.classId && '_id' in f.classId) {
        return (f.classId as any)._id === classId;
      }
      return f.classId === classId;
    });
  };

  const getTodaysClasses = () => {
    const today = new Date().toISOString().split('T')[0];
    return classes.filter(cls => cls.date.startsWith(today));
  };

  const getAttendanceRate = () => {
    if (attendance.length === 0) return 0;
    const presentCount = attendance.filter(att => att.status === 'PRESENT').length;
    return Math.round((presentCount / attendance.length) * 100);
  };

  if (loading || !isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Fingerprint className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">{getAttendanceRate()}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Feedback Given</p>
                <p className="text-2xl font-bold text-gray-900">{feedback.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Classes */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Today's Classes</h2>
          </div>
          <div className="p-6">
            {getTodaysClasses().length === 0 ? (
              <p className="text-gray-500 text-center py-8">No classes scheduled for today</p>
            ) : (
              <div className="grid gap-4">
                {getTodaysClasses().map((cls) => (
                  <div key={cls._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{cls.className}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(cls.startTime).toLocaleTimeString()} - {new Date(cls.endTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleMarkAttendance(cls._id)}
                          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          <Fingerprint className="w-4 h-4 mr-1" />
                          Mark Attendance
                        </button>
                      </div>
                    </div>
                    {cls.material && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">{cls.material}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('classes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'classes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                All Classes
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'attendance'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Attendance History
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'feedback'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Feedback
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'classes' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">All Classes</h3>
                {allClasses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No classes found</p>
                ) : (
                  allClasses.map((cls) => (
                    <div key={cls._id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{cls.className}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(cls.date).toLocaleDateString()} • {new Date(cls.startTime).toLocaleTimeString()} - {new Date(cls.endTime).toLocaleTimeString()}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Teacher: {typeof cls.teacherId === 'object' ? cls.teacherId.name : 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Status: <span className={cls.status === 'SUCCESS' ? 'text-green-600' : cls.status === 'EMPTY' ? 'text-red-600' : 'text-gray-600'}>
                              {cls.status}
                            </span>
                          </p>
                          <p className="text-sm text-gray-500">
                            Attendance: {cls.attendedStudentCount}/{cls.studentCount} students ({cls.studentCount > 0 ? Math.round((cls.attendedStudentCount / cls.studentCount) * 100) : 0}%)
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {new Date(cls.endTime) < new Date() && !hasSubmittedFeedback(cls._id) && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="text-sm font-medium text-blue-900 mb-2">Submit Feedback</p>
                              <div className="space-y-2">
                                <div>
                                  <label className="block text-xs text-blue-700 mb-1">Rating (1-5)</label>
                                  <select
                                    value={feedbackForm[cls._id]?.rating || 1}
                                    onChange={(e) => updateFeedbackForm(cls._id, 'rating', parseInt(e.target.value))}
                                    className="w-full px-2 py-1 text-sm border border-blue-200 rounded"
                                  >
                                    {[1,2,3,4,5].map(n => (
                                      <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs text-blue-700 mb-1">Comment</label>
                                  <textarea
                                    value={feedbackForm[cls._id]?.comment || ''}
                                    onChange={(e) => updateFeedbackForm(cls._id, 'comment', e.target.value)}
                                    placeholder="Share your feedback..."
                                    className="w-full px-2 py-1 text-sm border border-blue-200 rounded resize-none"
                                    rows={2}
                                  />
                                </div>
                                <button
                                  onClick={() => handleSubmitFeedback(cls._id)}
                                  className="w-full px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                >
                                  Submit Feedback
                                </button>
                              </div>
                            </div>
                          )}
                          {hasSubmittedFeedback(cls._id) && (
                            <div className="text-green-600 text-sm font-medium">
                              ✓ Feedback Submitted
                            </div>
                          )}
                          {new Date(cls.endTime) >= new Date() && (
                            <button
                              onClick={() => handleMarkAttendance(cls._id)}
                              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                            >
                              <Fingerprint className="w-4 h-4 mr-1" />
                              Mark Attendance
                            </button>
                          )}
                        </div>
                      </div>
                      {cls.material && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">{cls.material}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="space-y-4">
                {attendance.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No attendance records yet</p>
                ) : (
                  attendance.map((att) => (
                    <div key={att._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-gray-900">Class Attendance</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(att.timestamp).toLocaleDateString()} at {new Date(att.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {att.status === 'PRESENT' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${
                            att.status === 'PRESENT' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {att.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Fingerprint className="w-3 h-3 mr-1" />
                          {att.fingerprintVerified ? 'Verified' : 'Not Verified'}
                        </span>
                        <span className="flex items-center">
                          <Camera className="w-3 h-3 mr-1" />
                          {att.faceVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="space-y-4">
                {feedback.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No feedback submitted yet</p>
                ) : (
                  feedback.map((fb) => (
                    <div key={fb._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">Class Feedback</h3>
                          <p className="text-sm text-gray-600">
                            Rating: {fb.rating}/5 stars
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(fb.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{fb.comment}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
