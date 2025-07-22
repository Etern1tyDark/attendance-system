'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from '@/lib/toast';
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  Plus,
  LogOut,
  CheckCircle,
  XCircle,
  Edit,
  BarChart3
} from 'lucide-react';
import { classApi, attendanceApi, feedbackApi, Class, Attendance, Feedback } from '@/lib/types';
import { getUser, logout, isTeacher } from '@/lib/auth';
import useIsClient from '@/hooks/useIsClient';

export default function TeacherDashboard() {
  const router = useRouter();
  const isClient = useIsClient();
  const [user, setUser] = useState(getUser());
  const [classes, setClasses] = useState<Class[]>([]);
  const [feedback, setFeedback] = useState<{[classId: string]: Feedback[]}>({});
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('classes');
  const [showCreateClass, setShowCreateClass] = useState(false);

  useEffect(() => {
    if (!isClient) return;
    
    if (!isTeacher()) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [router, isClient]);

  const fetchData = async () => {
    if (!isClient) return;
    
    try {
      const [classesRes, statsRes] = await Promise.all([
        classApi.getClasses({ teacherId: user?.id }),
        classApi.getClassStats()
      ]);

      setClasses(classesRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch (error) {
      if (isClient) {
        toast.error('Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (classData: any) => {
    if (!isClient) return;
    
    try {
      await classApi.createClass(classData);
      toast.success('Class created successfully!');
      setShowCreateClass(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create class');
    }
  };

  const handleUpdateMaterial = async (classId: string, material: string) => {
    if (!isClient) return;
    
    try {
      await classApi.updateClassMaterial(classId, material);
      toast.success('Class material updated successfully!');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update material');
    }
  };

  const handleMarkAttendance = async (classId: string) => {
    if (!user) return;
    
    try {
      const attendanceData = {
        classId,
        fingerprintData: `teacher_fingerprint_${user.id}_${Date.now()}`,
        faceData: `teacher_face_${user.id}_${Date.now()}`
      };

      await attendanceApi.markAttendance(attendanceData);
      toast.success('Teacher attendance marked successfully!');
      fetchData(); // Refresh the data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const getTodaysClasses = () => {
    const today = new Date().toISOString().split('T')[0];
    return classes.filter(cls => cls.date.startsWith(today));
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
              <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Teacher Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={() => setShowCreateClass(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Class
              </button>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
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
                        <p className="text-sm text-gray-500 mt-1">
                          Status: <span className={cls.status === 'SUCCESS' ? 'text-green-600' : cls.status === 'EMPTY' ? 'text-red-600' : 'text-gray-600'}>
                            {cls.status || 'PENDING'}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {cls.attendedStudentCount}/{cls.studentCount} students
                        </span>
                        {!cls.teacherAttended && (
                          <button
                            onClick={() => handleMarkAttendance(cls._id)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark Attendance
                          </button>
                        )}
                        {cls.teacherAttended && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-md flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Attended
                          </span>
                        )}
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
                onClick={() => setActiveTab('feedback')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'feedback'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
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
                  <p className="text-gray-500 text-center py-8">No classes created yet</p>
                ) : (
                  classes.map((cls) => (
                  <div key={cls._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{cls.className}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(cls.date).toLocaleDateString()} • {new Date(cls.startTime).toLocaleTimeString()} - {new Date(cls.endTime).toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Status: <span className={cls.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}>
                            {cls.status}
                          </span> • {cls.attendedStudentCount}/{cls.studentCount} students attended
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const material = prompt('Update class material:', cls.material);
                          if (material !== null) {
                            handleUpdateMaterial(cls._id, material);
                          }
                        }}
                        className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md text-sm"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit Material
                      </button>
                    </div>
                    {cls.material && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Feedback</h3>
                {classes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No classes created yet</p>
                ) : (
                  classes.map((cls) => (
                    <div key={cls._id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{cls.className}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(cls.date).toLocaleDateString()} • {new Date(cls.startTime).toLocaleTimeString()} - {new Date(cls.endTime).toLocaleTimeString()}
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

      {/* Create Class Modal */}
      {showCreateClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Class</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const data = {
                className: formData.get('className') as string,
                date: formData.get('date') as string,
                startTime: `${formData.get('date')}T${formData.get('startTime')}`,
                endTime: `${formData.get('date')}T${formData.get('endTime')}`,
                material: formData.get('material') as string,
              };
              handleCreateClass(data);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name
                  </label>
                  <input
                    name="className"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter class name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    name="date"
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      name="startTime"
                      type="time"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      name="endTime"
                      type="time"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material (Optional)
                  </label>
                  <textarea
                    name="material"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter class material or notes"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateClass(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
