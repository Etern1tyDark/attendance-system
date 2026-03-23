'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Camera,
  CheckCircle,
  Fingerprint,
  LogOut,
  MessageSquare,
  XCircle,
} from 'lucide-react';
import toast from '@/lib/toast';
import { attendanceApi, classApi, feedbackApi, Class, Attendance, Feedback } from '@/lib/types';
import { getUser, isStudent, logout } from '@/lib/auth';
import useIsClient from '@/hooks/useIsClient';
import { toLocalDateKey } from '@/lib/date';

export default function StudentDashboard() {
  const router = useRouter();
  const isClient = useIsClient();
  const [user] = useState(getUser());
  const [classes, setClasses] = useState<Class[]>([]);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'classes' | 'attendance' | 'feedback'>('classes');
  const [feedbackForm, setFeedbackForm] = useState<Record<string, { rating: number; comment: string }>>({});

  useEffect(() => {
    if (!isClient) {
      return;
    }

    if (!isStudent()) {
      router.push('/login');
      return;
    }

    void fetchData();
  }, [isClient, router]);

  const fetchData = async () => {
    try {
      const [classesRes, allClassesRes, attendanceRes, feedbackRes] = await Promise.all([
        classApi.getClasses(),
        classApi.getAllClassesWithStatus(),
        attendanceApi.getAttendanceByUser(),
        feedbackApi.getFeedbackByStudent(),
      ]);

      setClasses(classesRes.data.data || []);
      setAllClasses(allClassesRes.data.data || []);
      setAttendance(attendanceRes.data.data || []);
      setFeedback(feedbackRes.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (classId: string) => {
    try {
      await attendanceApi.markAttendance({
        classId,
        fingerprintData: `fingerprint_${user?.id}_${Date.now()}`,
        faceData: `face_${user?.id}_${Date.now()}`,
      });
      toast.success('Attendance marked successfully');
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const handleSubmitFeedback = async (classId: string) => {
    const formData = feedbackForm[classId];
    if (!formData?.comment.trim()) {
      toast.error('Please provide both rating and comment');
      return;
    }

    try {
      await feedbackApi.submitFeedback({
        classId,
        rating: formData.rating,
        comment: formData.comment,
      });
      toast.success('Feedback submitted successfully');
      setFeedbackForm((prev) => {
        const nextForm = { ...prev };
        delete nextForm[classId];
        return nextForm;
      });
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    }
  };

  const updateFeedbackForm = (classId: string, field: 'rating' | 'comment', value: number | string) => {
    setFeedbackForm((prev) => ({
      ...prev,
      [classId]: {
        rating: field === 'rating' ? (value as number) : prev[classId]?.rating || 1,
        comment: field === 'comment' ? (value as string) : prev[classId]?.comment || '',
      },
    }));
  };

  const hasSubmittedFeedback = (classId: string) => {
    return feedback.some((entry) => {
      if (typeof entry.classId === 'object' && entry.classId && '_id' in entry.classId) {
        return entry.classId._id === classId;
      }
      return entry.classId === classId;
    });
  };

  const todaysClasses = classes.filter((cls) => toLocalDateKey(cls.date) === toLocalDateKey(new Date()));
  const attendanceRate =
    attendance.length === 0
      ? 0
      : Math.round((attendance.filter((record) => record.status === 'PRESENT').length / attendance.length) * 100);

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
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Fingerprint className="mr-3 h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <button
              onClick={logout}
              className="rounded-lg p-2 text-gray-400 hover:text-gray-600"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard icon={<Calendar className="h-6 w-6 text-blue-600" />} label="Total Classes" value={classes.length} accent="bg-blue-100" />
          <StatCard icon={<CheckCircle className="h-6 w-6 text-green-600" />} label="Attendance Rate" value={`${attendanceRate}%`} accent="bg-green-100" />
          <StatCard icon={<MessageSquare className="h-6 w-6 text-purple-600" />} label="Feedback Given" value={feedback.length} accent="bg-purple-100" />
        </div>

        <section className="mb-8 rounded-lg bg-white shadow">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Today's Classes</h2>
          </div>
          <div className="p-6">
            {todaysClasses.length === 0 ? (
              <p className="py-8 text-center text-gray-500">No classes scheduled for today</p>
            ) : (
              <div className="grid gap-4">
                {todaysClasses.map((cls) => (
                  <div key={cls._id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{cls.className}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(cls.startTime).toLocaleTimeString()} - {new Date(cls.endTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleMarkAttendance(cls._id)}
                        className="flex items-center rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                      >
                        <Fingerprint className="mr-1 h-4 w-4" />
                        Mark Attendance
                      </button>
                    </div>
                    {cls.material && (
                      <div className="mt-2 rounded-md bg-gray-50 p-3">
                        <p className="text-sm text-gray-700">{cls.material}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg bg-white shadow">
          <div className="border-b px-6 py-4">
            <nav className="flex space-x-8">
              {(['classes', 'attendance', 'feedback'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`border-b-2 px-1 py-2 text-sm font-medium ${
                    activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'classes' ? 'All Classes' : tab === 'attendance' ? 'Attendance History' : 'My Feedback'}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'classes' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">All Classes</h3>
                {allClasses.length === 0 ? (
                  <p className="py-8 text-center text-gray-500">No classes found</p>
                ) : (
                  allClasses.map((cls) => (
                    <div key={cls._id} className="rounded-lg border bg-white p-4">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{cls.className}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(cls.date).toLocaleDateString()} - {new Date(cls.startTime).toLocaleTimeString()} - {new Date(cls.endTime).toLocaleTimeString()}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Teacher: {typeof cls.teacherId === 'object' ? cls.teacherId.name : 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Status:{' '}
                            <span className={cls.status === 'SUCCESS' ? 'text-green-600' : cls.status === 'EMPTY' ? 'text-red-600' : 'text-gray-600'}>
                              {cls.status}
                            </span>
                          </p>
                          <p className="text-sm text-gray-500">
                            Attendance: {cls.attendedStudentCount}/{cls.studentCount} students ({cls.studentCount > 0 ? Math.round((cls.attendedStudentCount / cls.studentCount) * 100) : 0}%)
                          </p>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          {new Date(cls.endTime) < new Date() && !hasSubmittedFeedback(cls._id) && (
                            <div className="rounded-lg bg-blue-50 p-3">
                              <p className="mb-2 text-sm font-medium text-blue-900">Submit Feedback</p>
                              <div className="space-y-2">
                                <div>
                                  <label className="mb-1 block text-xs text-blue-700">Rating (1-5)</label>
                                  <select
                                    value={feedbackForm[cls._id]?.rating || 1}
                                    onChange={(event) => updateFeedbackForm(cls._id, 'rating', parseInt(event.target.value, 10))}
                                    className="w-full rounded border border-blue-200 px-2 py-1 text-sm"
                                  >
                                    {[1, 2, 3, 4, 5].map((value) => (
                                      <option key={value} value={value}>
                                        {value} Star{value > 1 ? 's' : ''}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="mb-1 block text-xs text-blue-700">Comment</label>
                                  <textarea
                                    value={feedbackForm[cls._id]?.comment || ''}
                                    onChange={(event) => updateFeedbackForm(cls._id, 'comment', event.target.value)}
                                    placeholder="Share your feedback..."
                                    className="w-full resize-none rounded border border-blue-200 px-2 py-1 text-sm"
                                    rows={2}
                                  />
                                </div>
                                <button
                                  onClick={() => handleSubmitFeedback(cls._id)}
                                  className="w-full rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                                >
                                  Submit Feedback
                                </button>
                              </div>
                            </div>
                          )}
                          {hasSubmittedFeedback(cls._id) && (
                            <div className="text-sm font-medium text-green-600">Feedback Submitted</div>
                          )}
                          {new Date(cls.endTime) >= new Date() && (
                            <button
                              onClick={() => handleMarkAttendance(cls._id)}
                              className="flex items-center rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                            >
                              <Fingerprint className="mr-1 h-4 w-4" />
                              Mark Attendance
                            </button>
                          )}
                        </div>
                      </div>
                      {cls.material && (
                        <div className="mt-3 rounded-md bg-gray-50 p-3">
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
                  <p className="py-8 text-center text-gray-500">No attendance records yet</p>
                ) : (
                  attendance.map((record) => (
                    <div key={record._id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">Class Attendance</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(record.timestamp).toLocaleDateString()} at {new Date(record.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {record.status === 'PRESENT' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${record.status === 'PRESENT' ? 'text-green-600' : 'text-red-600'}`}>
                            {record.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Fingerprint className="mr-1 h-3 w-3" />
                          {record.fingerprintVerified ? 'Verified' : 'Not Verified'}
                        </span>
                        <span className="flex items-center">
                          <Camera className="mr-1 h-3 w-3" />
                          {record.faceVerified ? 'Verified' : 'Not Verified'}
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
                  <p className="py-8 text-center text-gray-500">No feedback submitted yet</p>
                ) : (
                  feedback.map((entry) => (
                    <div key={entry._id} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">Class Feedback</h3>
                          <p className="text-sm text-gray-600">Rating: {entry.rating}/5 stars</p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{entry.comment}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-center">
        <div className={`rounded-full p-3 ${accent}`}>{icon}</div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
