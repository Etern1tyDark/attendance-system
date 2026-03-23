'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  CheckCircle,
  LogOut,
  Settings,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import toast from '@/lib/toast';
import { classApi, feedbackApi, userApi, User, Class, Feedback } from '@/lib/types';
import { getUser, isAdmin, logout } from '@/lib/auth';
import useIsClient from '@/hooks/useIsClient';
import { toLocalDateKey } from '@/lib/date';
import DataExportMenu from '@/components/DataExportMenu';

export default function AdminDashboard() {
  const router = useRouter();
  const isClient = useIsClient();
  const [user] = useState(getUser());
  const [stats, setStats] = useState({ totalClasses: 0, successClasses: 0, emptyClasses: 0, successRate: 0 });
  const [classes, setClasses] = useState<Class[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [feedback, setFeedback] = useState<Record<string, Feedback[]>>({});
  const [loading, setLoading] = useState(true);
  const [exportingFormat, setExportingFormat] = useState<'csv' | 'xlsx' | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'classes' | 'feedback'>('overview');

  useEffect(() => {
    if (!isClient) {
      return;
    }

    if (!isAdmin()) {
      router.push('/login');
      return;
    }

    void fetchData();
  }, [isClient, router]);

  const fetchData = async () => {
    try {
      const [classesRes, usersRes] = await Promise.all([
        classApi.getClasses(),
        userApi.getUsers(),
      ]);

      const nextClasses = classesRes.data.data || [];
      const nextUsers = usersRes.data.data || [];
      const totalClasses = nextClasses.length;
      const successClasses = nextClasses.filter((cls: Class) => cls.status === 'SUCCESS').length;
      const emptyClasses = totalClasses - successClasses;

      setClasses(nextClasses);
      setUsers(nextUsers);
      setStats({
        totalClasses,
        successClasses,
        emptyClasses,
        successRate: totalClasses > 0 ? (successClasses / totalClasses) * 100 : 0,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!window.confirm('Delete this class and its attendance records?')) {
      return;
    }

    try {
      await classApi.deleteClass(classId);
      toast.success('Class deleted successfully');
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete class');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Delete this user?')) {
      return;
    }

    try {
      await userApi.deleteUser(userId);
      toast.success('User deleted successfully');
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
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
      link.download = filenameMatch?.[1] || `smart-attendance-export.${format}`;
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

  const getUserStats = () => {
    const totalUsers = users.length;
    return {
      totalUsers,
      teachers: users.filter((currentUser) => currentUser.role === 'TEACHER').length,
      students: users.filter((currentUser) => currentUser.role === 'STUDENT').length,
      admins: users.filter((currentUser) => currentUser.role === 'ADMIN').length,
    };
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
            <Settings className="mr-3 h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <DataExportMenu
                loadingFormat={exportingFormat}
                onSelect={handleExport}
              />
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
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<BookOpen className="h-6 w-6 text-blue-600" />} label="Total Classes" value={stats.totalClasses} accent="bg-blue-100" />
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
                          Teacher: {typeof cls.teacherId === 'object' ? cls.teacherId.name : 'Unknown'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          cls.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {cls.status}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {cls.attendedStudentCount}/{cls.studentCount} attended
                        </p>
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
              {(['overview', 'users', 'classes', 'feedback'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`border-b-2 px-1 py-2 text-sm font-medium ${
                    activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'overview' ? 'System Overview' : tab === 'users' ? 'Users' : tab === 'classes' ? 'All Classes' : 'Feedback'}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">System Statistics</h3>
                  <OverviewRow label="Total Classes Created" value={stats.totalClasses} valueClassName="text-gray-900" />
                  <OverviewRow label="Successful Classes" value={stats.successClasses} valueClassName="text-green-600" />
                  <OverviewRow label="Empty Classes" value={stats.emptyClasses} valueClassName="text-red-600" />
                  <OverviewRow label="Overall Success Rate" value={`${Math.round(stats.successRate)}%`} valueClassName="text-blue-600" />
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="flex w-full items-center rounded-md bg-blue-50 p-3 text-left transition-colors hover:bg-blue-100"
                  >
                    <Users className="mr-3 h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900">Manage Users</div>
                      <div className="text-sm text-blue-600">View and manage all users ({getUserStats().totalUsers} users)</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('classes')}
                    className="flex w-full items-center rounded-md bg-green-50 p-3 text-left transition-colors hover:bg-green-100"
                  >
                    <BookOpen className="mr-3 h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-green-900">Manage Classes</div>
                      <div className="text-sm text-green-600">View and manage all classes ({stats.totalClasses} classes)</div>
                    </div>
                  </button>
                  <div className="flex w-full items-center rounded-md bg-purple-50 p-3 text-left">
                    <BarChart3 className="mr-3 h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium text-purple-900">System Health</div>
                      <div className="text-sm text-purple-600">Success Rate: {Math.round(stats.successRate)}%</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                  <span className="text-sm text-gray-500">{users.length} total users</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Actions</TableHead>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No users found</td>
                        </tr>
                      ) : (
                        users.map((userItem) => (
                          <tr key={userItem._id}>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                                <div className="text-sm text-gray-500">{userItem.email}</div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                userItem.role === 'ADMIN'
                                  ? 'bg-blue-100 text-blue-800'
                                  : userItem.role === 'TEACHER'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-green-100 text-green-800'
                              }`}>
                                {userItem.role}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {userItem.studentId || userItem.teacherId || userItem.adminId || 'N/A'}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                              {userItem.role !== 'ADMIN' && userItem._id !== user?.id ? (
                                <button
                                  onClick={() => handleDeleteUser(userItem._id)}
                                  className="flex items-center gap-1 text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              ) : (
                                <span className="text-gray-400">Protected</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'classes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">All Classes</h3>
                  <span className="text-sm text-gray-500">{classes.length} total classes</span>
                </div>
                {classes.length === 0 ? (
                  <p className="py-8 text-center text-gray-500">No classes found</p>
                ) : (
                  classes.map((cls) => (
                    <div key={cls._id} className="rounded-lg border bg-white p-4">
                      <div className="flex items-start justify-between">
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
                              {cls.status || 'PENDING'}
                            </span>
                          </p>
                          <p className="text-sm text-gray-500">
                            Attendance: {cls.attendedStudentCount}/{cls.studentCount} students
                            {cls.studentCount > 0 && (
                              <span className="ml-2">
                                ({Math.round((cls.attendedStudentCount / cls.studentCount) * 100)}% rate)
                              </span>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteClass(cls._id)}
                          className="ml-4 flex items-center gap-1 rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
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

            {activeTab === 'feedback' && (
              <div className="space-y-4">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">System Feedback</h3>
                {classes.length === 0 ? (
                  <p className="py-8 text-center text-gray-500">No classes found</p>
                ) : (
                  classes.map((cls) => (
                    <div key={cls._id} className="rounded-lg border bg-white p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{cls.className}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(cls.date).toLocaleDateString()} - {new Date(cls.startTime).toLocaleTimeString()} - {new Date(cls.endTime).toLocaleTimeString()}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Teacher: {typeof cls.teacherId === 'object' ? cls.teacherId.name : 'Unknown'}
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

function OverviewRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string | number;
  valueClassName: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-md bg-gray-50 p-3">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className={`text-sm font-bold ${valueClassName}`}>{value}</span>
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
      {children}
    </th>
  );
}
