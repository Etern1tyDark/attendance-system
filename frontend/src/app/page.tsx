'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUserRole } from '@/lib/auth';
import { Fingerprint, Users, BookOpen, MessageSquare, BarChart3 } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const role = getUserRole();
    if (role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else if (role === 'TEACHER') {
      router.push('/teacher/dashboard');
    } else if (role === 'STUDENT') {
      router.push('/student/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-blue-600 rounded-full">
              <Fingerprint className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Smart Attendance System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive attendance management system with biometric authentication 
            for schools and educational institutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
              <Fingerprint className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Biometric Auth</h3>
            <p className="text-sm text-gray-600">
              Secure fingerprint and face recognition for attendance marking
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Role Management</h3>
            <p className="text-sm text-gray-600">
              Separate dashboards for admins, teachers, and students
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Class Management</h3>
            <p className="text-sm text-gray-600">
              Create and manage classes with materials and schedules
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-sm text-gray-600">
              Track attendance rates and class success statistics
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to Smart Attendance
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to access your dashboard and start managing attendance.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/register')}
              className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
