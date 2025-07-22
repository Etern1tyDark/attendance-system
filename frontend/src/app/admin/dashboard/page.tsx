'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from '@/lib/toast';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings,
  LogOut,
  CheckCircle,
  XCircle,
  UserCheck,
  GraduationCap,
  Trash2,
  Shield,
  User as UserIcon
} from 'lucide-react';
import { classApi, attendanceApi, authApi, userApi, feedbackApi, User, Class, Feedback } from '@/lib/types';
import { getUser, logout, isAdmin } from '@/lib/auth';
import useIsClient from '@/hooks/useIsClient';

export default function AdminDashboard() {
  const router = useRouter();
  const isClient = useIsClient();
  const [user, setUser] = useState(getUser());
  const [stats, setStats] = useState<any>({});
  const [classes, setClasses] = useState<Class[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [feedback, setFeedback] = useState<{[classId: string]: Feedback[]}>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isClient) return;
    
    if (!isAdmin()) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [router, isClient]);

  const fetchData = async () => {
    if (!isClient) return;
    
    try {
      // Fetch system-wide statistics
      const [classesRes, usersRes] = await Promise.all([
        classApi.getClasses(),
        userApi.getUsers()
      ]);

      setClasses(classesRes.data.data || []);
      setUsers(usersRes.data.data || usersRes.data || []);
      
      // Calculate stats from classes data
      const totalClasses = classesRes.data.data?.length || 0;
      const successClasses = classesRes.data.data?.filter((cls: any) => cls.status === 'SUCCESS').length || 0;
      const emptyClasses = totalClasses - successClasses;
      const successRate = totalClasses > 0 ? (successClasses / totalClasses) * 100 : 0;
      
      setStats({
        totalClasses,
        successClasses,
        emptyClasses,
        successRate
      });
    } catch (error) {
      if (isClient) {
        toast.error('Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class? This will also delete all associated attendance records.')) return;

    try {
      await classApi.deleteClass(classId);
      toast.success('Class deleted successfully');
      fetchData(); // Refresh the data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete class');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await userApi.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchData(); // Refresh the data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const getUserStats = () => {
    // Ensure users is an array
    const usersArray = Array.isArray(users) ? users : [];
    const totalUsers = usersArray.length;
    const teachers = usersArray.filter(u => u.role === 'TEACHER').length;
    const students = usersArray.filter(u => u.role === 'STUDENT').length;
    const admins = usersArray.filter(u => u.role === 'ADMIN').length;
    
    return { totalUsers, teachers, students, admins };
  };

  const fetchClassFeedback = async (classId: string) => {
    try {
      const feedbackRes = await feedbackApi.getFeedbackByClass(classId);
      setFeedback(prev => ({
        ...prev,
        [classId]: feedbackRes.data.data || []
      }));
    } catch (error: any) {
      toast.error('Failed to load feedback');
    }
  };

  const getTodaysClasses = () => {
    const today = new Date().toISOString().split('T')[0];
    return classes.filter(cls => cls.date.startsWith(today));
  };

  const getRecentClasses = () => {
    return classes
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
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
              <Settings className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalClasses || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Success Classes</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.successClasses || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Empty Classes</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.emptyClasses || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(stats?.successRate || 0)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Classes Overview */}
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
                        <p className="text-sm text-gray-500 mt-1">
                          Teacher: {typeof cls.teacherId === 'object' ? cls.teacherId.name : 'Unknown'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          cls.status === 'SUCCESS' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {cls.status}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {cls.attendedStudentCount}/{cls.studentCount} attended
                        </p>
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
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                System Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Users
              </button>
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
                onClick={() => setActiveTab('feedback')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'feedback'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Feedback
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">System Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <span className="text-sm font-medium text-gray-700">Total Classes Created</span>
                      <span className="text-sm font-bold text-gray-900">{stats?.totalClasses || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <span className="text-sm font-medium text-gray-700">Successful Classes</span>
                      <span className="text-sm font-bold text-green-600">{stats?.successClasses || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <span className="text-sm font-medium text-gray-700">Empty Classes</span>
                      <span className="text-sm font-bold text-red-600">{stats?.emptyClasses || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <span className="text-sm font-medium text-gray-700">Overall Success Rate</span>
                      <span className="text-sm font-bold text-blue-600">{Math.round(stats?.successRate || 0)}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab('users')}
                      className="w-full flex items-center p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                    >
                      <Users className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <div className="font-medium text-blue-900">Manage Users</div>
                        <div className="text-sm text-blue-600">View and manage all users ({getUserStats().totalUsers} users)</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('classes')}
                      className="w-full flex items-center p-3 text-left bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                    >
                      <BookOpen className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <div className="font-medium text-green-900">Manage Classes</div>
                        <div className="text-sm text-green-600">View and manage all classes ({stats?.totalClasses || 0} classes)</div>
                      </div>
                    </button>
                    <div className="w-full flex items-center p-3 text-left bg-purple-50 rounded-md">
                      <BarChart3 className="w-5 h-5 text-purple-600 mr-3" />
                      <div>
                        <div className="font-medium text-purple-900">System Health</div>
                        <div className="text-sm text-purple-600">Success Rate: {Math.round(stats?.successRate || 0)}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">User Management</h2>
                  <span className="text-sm text-gray-500">{Array.isArray(users) ? users.length : 0} total users</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.isArray(users) && users.length > 0 ? users.map((userItem) => (
                        <tr key={userItem._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                              <div className="text-sm text-gray-500">{userItem.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              userItem.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                              userItem.role === 'TEACHER' ? 'bg-purple-100 text-purple-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {userItem.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {userItem.studentId || userItem.teacherId || userItem.adminId || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {userItem.role !== 'ADMIN' && userItem._id !== user?.id && (
                              <button
                                onClick={() => handleDeleteUser(userItem._id)}
                                className="text-red-600 hover:text-red-900 flex items-center gap-1"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            )}
                            {(userItem.role === 'ADMIN' || userItem._id === user?.id) && (
                              <span className="text-gray-400">Protected</span>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'classes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">All Classes</h3>
                  <span className="text-sm text-gray-500">{classes.length} total classes</span>
                </div>
                {classes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No classes found</p>
                ) : (
                  classes.map((cls) => (
                    <div key={cls._id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start">
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
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleDeleteClass(cls._id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
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

            {activeTab === 'feedback' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Feedback</h3>
                {classes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No classes found</p>
                ) : (
                  classes.map((cls) => (
                    <div key={cls._id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{cls.className}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(cls.date).toLocaleDateString()} • {new Date(cls.startTime).toLocaleTimeString()} - {new Date(cls.endTime).toLocaleTimeString()}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Teacher: {typeof cls.teacherId === 'object' ? cls.teacherId.name : 'Unknown'}
                          </p>
                        </div>
                        <button
                          onClick={() => fetchClassFeedback(cls._id)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          View Feedback
                        </button>
                      </div>
                      
                      {feedback[cls._id] && (
                        <div className="mt-4 space-y-3">
                          <div className="bg-gray-50 p-3 rounded-md">
                            <h5 className="font-medium text-gray-900 mb-2">Feedback Summary</h5>
                            <p className="text-sm text-gray-600">
                              Total responses: {feedback[cls._id].length}
                            </p>
                            {feedback[cls._id].length > 0 && (
                              <p className="text-sm text-gray-600">
                                Average rating: {(feedback[cls._id].reduce((sum, f) => sum + f.rating, 0) / feedback[cls._id].length).toFixed(1)}/5
                              </p>
                            )}
                          </div>
                          
                          {feedback[cls._id].length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No feedback submitted yet</p>
                          ) : (
                            <div className="space-y-3">
                              <h6 className="font-medium text-gray-900">Anonymous Comments:</h6>
                              {feedback[cls._id].map((fb, index) => (
                                <div key={fb._id} className="bg-white border p-3 rounded-md">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center">
                                      {[1,2,3,4,5].map(star => (
                                        <span key={star} className={`text-lg ${star <= fb.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                          ★
                                        </span>
                                      ))}
                                      <span className="ml-2 text-sm text-gray-600">({fb.rating}/5)</span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {new Date(fb.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 text-sm">{fb.comment}</p>
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
        </div>
      </div>
    </div>
  );
}
