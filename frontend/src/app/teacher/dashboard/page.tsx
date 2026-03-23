'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  Edit,
  LogOut,
  Plus,
  XCircle,
} from 'lucide-react';
import toast from '@/lib/toast';
import { attendanceApi, classApi, feedbackApi, userApi, Class, Feedback } from '@/lib/types';
import { getUser, isTeacher, logout } from '@/lib/auth';
import useIsClient from '@/hooks/useIsClient';
import { toLocalDateKey } from '@/lib/date';
import DataExportMenu from '@/components/DataExportMenu';

export default function TeacherDashboard() {
  const router = useRouter();
  const isClient = useIsClient();
  const [user] = useState(getUser());
  const [classes, setClasses] = useState<Class[]>([]);
  const [feedback, setFeedback] = useState<Record<string, Feedback[]>>({});
  const [stats, setStats] = useState({ totalClasses: 0, successClasses: 0, emptyClasses: 0, successRate: 0 });
  const [loading, setLoading] = useState(true);
  const [exportingFormat, setExportingFormat] = useState<'csv' | 'xlsx' | null>(null);
  const [activeTab, setActiveTab] = useState<'classes' | 'feedback'>('classes');
  const [showCreateClass, setShowCreateClass] = useState(false);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    if (!isTeacher()) {
      router.push('/login');
      return;
    }

    void fetchData();
  }, [isClient, router]);

  const fetchData = async () => {
    try {
      const [classesRes, statsRes] = await Promise.all([
        classApi.getClasses({ teacherId: user?.id }),
        classApi.getClassStats(),
      ]);

      setClasses(classesRes.data.data || []);
      setStats(statsRes.data.data || { totalClasses: 0, successClasses: 0, emptyClasses: 0, successRate: 0 });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (classData: {
    className: string;
    date: string;
    startTime: string;
    endTime: string;
    material?: string;
  }) => {
    try {
      await classApi.createClass(classData);
      toast.success('Class created successfully');
      setShowCreateClass(false);
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create class');
    }
  };

  const handleUpdateMaterial = async (classId: string, material: string) => {
    try {
      await classApi.updateClassMaterial(classId, material);
      toast.success('Class material updated successfully');
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update material');
    }
  };

  const handleMarkAttendance = async (classId: string) => {
    if (!user) {
      return;
    }

    try {
      await attendanceApi.markAttendance({
        classId,
        fingerprintData: `teacher_fingerprint_${user.id}_${Date.now()}`,
        faceData: `teacher_face_${user.id}_${Date.now()}`,
      });
      toast.success('Teacher attendance marked successfully');
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      setExportingFormat(format);
      const response = await userApi.exportAllData(format);
      const contentType =
        format === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv;charset=utf-8;';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const contentDisposition = response.headers['content-disposition'];
      const filenameMatch = contentDisposition?.match(/filename="?(.*?)"?$/);

      link.href = url;
      link.download = filenameMatch?.[1] || `teacher-attendance-export.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} export downloaded successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to export ${format.toUpperCase()} data`);
    } finally {
      setExportingFormat(null);
    }
  };

  const fetchClassFeedback = async (classId: string) => {
    try {
      const feedbackRes = await feedbackApi.getFeedbackByClass(classId);
      setFeedback((prev) => ({
        ...prev,
        [classId]: feedbackRes.data.data || [],
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load feedback');
    }
  };

  const todaysClasses = classes.filter((cls) => toLocalDateKey(cls.date) === toLocalDateKey(new Date()));

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
            <BookOpen className="mr-3 h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Teacher Dashboard</h1>
          </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <DataExportMenu
                loadingFormat={exportingFormat}
                onSelect={handleExport}
              />
            <button
              onClick={() => setShowCreateClass(true)}
              className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Class
            </button>
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
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <StatCard icon={<Calendar className="h-6 w-6 text-blue-600" />} label="Total Classes" value={stats.totalClasses} accent="bg-blue-100" />
          <StatCard icon={<CheckCircle className="h-6 w-6 text-green-600" />} label="Success Classes" value={stats.successClasses} accent="bg-green-100" />
          <StatCard icon={<XCircle className="h-6 w-6 text-red-600" />} label="Empty Classes" value={stats.emptyClasses} accent="bg-red-100" />
          <StatCard icon={<BarChart3 className="h-6 w-6 text-purple-600" />} label="Success Rate" value={`${Math.round(stats.successRate)}%`} accent="bg-purple-100" />
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
                        <p className="mt-1 text-sm text-gray-500">
                          Status:{' '}
                          <span className={cls.status === 'SUCCESS' ? 'text-green-600' : cls.status === 'EMPTY' ? 'text-red-600' : 'text-gray-600'}>
                            {cls.status || 'PENDING'}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {cls.attendedStudentCount}/{cls.studentCount} students
                        </span>
                        {!cls.teacherAttended ? (
                          <button
                            onClick={() => handleMarkAttendance(cls._id)}
                            className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Mark Attendance
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 rounded-md bg-green-100 px-3 py-1 text-sm text-green-800">
                            <CheckCircle className="h-4 w-4" />
                            Attended
                          </span>
                        )}
                      </div>
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
              <button
                onClick={() => setActiveTab('classes')}
                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === 'classes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                All Classes
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === 'feedback' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Student Feedback
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'classes' && (
              <div className="space-y-4">
                {classes.length === 0 ? (
                  <p className="py-8 text-center text-gray-500">No classes created yet</p>
                ) : (
                  classes.map((cls) => (
                    <div key={cls._id} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{cls.className}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(cls.date).toLocaleDateString()} - {new Date(cls.startTime).toLocaleTimeString()} - {new Date(cls.endTime).toLocaleTimeString()}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Status:{' '}
                            <span className={cls.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}>
                              {cls.status}
                            </span>{' '}
                            - {cls.attendedStudentCount}/{cls.studentCount} students attended
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const material = window.prompt('Update class material:', cls.material);
                            if (material !== null) {
                              void handleUpdateMaterial(cls._id, material);
                            }
                          }}
                          className="flex items-center rounded-md px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="mr-1 h-4 w-4" />
                          Edit Material
                        </button>
                      </div>
                      {cls.material && (
                        <div className="mt-2 rounded-md bg-gray-50 p-3">
                          <p className="text-sm text-gray-700">{cls.material}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="space-y-4">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Student Feedback</h3>
                {classes.length === 0 ? (
                  <p className="py-8 text-center text-gray-500">No classes created yet</p>
                ) : (
                  classes.map((cls) => (
                    <div key={cls._id} className="rounded-lg border bg-white p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{cls.className}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(cls.date).toLocaleDateString()} - {new Date(cls.startTime).toLocaleTimeString()} - {new Date(cls.endTime).toLocaleTimeString()}
                          </p>
                        </div>
                        <button
                          onClick={() => fetchClassFeedback(cls._id)}
                          className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                        >
                          View Feedback
                        </button>
                      </div>

                      {feedback[cls._id] && (
                        <div className="mt-4 space-y-3">
                          <div className="rounded-md bg-gray-50 p-3">
                            <h5 className="mb-2 font-medium text-gray-900">Feedback Summary</h5>
                            <p className="text-sm text-gray-600">Total responses: {feedback[cls._id].length}</p>
                            {feedback[cls._id].length > 0 && (
                              <p className="text-sm text-gray-600">
                                Average rating: {(feedback[cls._id].reduce((sum, entry) => sum + entry.rating, 0) / feedback[cls._id].length).toFixed(1)}/5
                              </p>
                            )}
                          </div>

                          {feedback[cls._id].length === 0 ? (
                            <p className="py-4 text-center text-gray-500">No feedback submitted yet</p>
                          ) : (
                            <div className="space-y-3">
                              <h6 className="font-medium text-gray-900">Anonymous Comments</h6>
                              {feedback[cls._id].map((entry) => (
                                <div key={entry._id} className="rounded-md border bg-white p-3">
                                  <div className="mb-2 flex items-start justify-between">
                                    <div className="flex items-center">
                                      <span className="text-lg text-yellow-400">{'*'.repeat(entry.rating)}</span>
                                      <span className="ml-2 text-sm text-gray-600">({entry.rating}/5)</span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {new Date(entry.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700">{entry.comment}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {showCreateClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Create New Class</h2>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.target as HTMLFormElement);
                void handleCreateClass({
                  className: formData.get('className') as string,
                  date: formData.get('date') as string,
                  startTime: `${formData.get('date')}T${formData.get('startTime')}`,
                  endTime: `${formData.get('date')}T${formData.get('endTime')}`,
                  material: formData.get('material') as string,
                });
              }}
            >
              <div className="space-y-4">
                <Field label="Class Name">
                  <input
                    name="className"
                    type="text"
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter class name"
                  />
                </Field>
                <Field label="Date">
                  <input
                    name="date"
                    type="date"
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Start Time">
                    <input
                      name="startTime"
                      type="time"
                      required
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </Field>
                  <Field label="End Time">
                    <input
                      name="endTime"
                      type="time"
                      required
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </Field>
                </div>
                <Field label="Material (Optional)">
                  <textarea
                    name="material"
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter class material or notes"
                  />
                </Field>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateClass(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}
