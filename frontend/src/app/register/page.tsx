'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from '@/lib/toast';
import { Eye, EyeOff, Fingerprint, User, GraduationCap } from 'lucide-react';
import { authApi, RegisterData } from '@/lib/types';
import WebcamCapture from '@/components/WebcamCapture';

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [capturedBiometric, setCapturedBiometric] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterData>();

  const watchRole = watch('role');

  const handleBiometricCapture = (imageSrc: string) => {
    setCapturedBiometric(imageSrc);
    toast.success('Biometric data captured successfully!');
  };

  const onSubmit = async (data: RegisterData) => {
    setLoading(true);
    try {
      const response = await authApi.register(data);
      
      if (response.data.status === 'success') {
        toast.success('Registration successful! Please login.');
        router.push('/login');
      } else {
        toast.error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-blue-600 rounded-full">
                <Fingerprint className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">
              Join Smart Attendance System
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="TEACHER"
                    {...register('role', { required: 'Role is required' })}
                    className="mr-3"
                  />
                  <User className="w-5 h-5 text-blue-600 mr-2" />
                  <div>
                    <div className="font-medium">Teacher</div>
                    <div className="text-sm text-gray-600">Create and manage classes</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="STUDENT"
                    {...register('role', { required: 'Role is required' })}
                    className="mr-3"
                  />
                  <GraduationCap className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <div className="font-medium">Student</div>
                    <div className="text-sm text-gray-600">Attend classes and provide feedback</div>
                  </div>
                </label>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            {/* Biometric Setup Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Biometric Setup (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => setShowBiometricSetup(!showBiometricSetup)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {showBiometricSetup ? 'Hide' : 'Setup Biometric'}
                </button>
              </div>
              
              {showBiometricSetup && (
                <div className="space-y-3">
                  <WebcamCapture
                    title="Face Recognition Setup"
                    isActive={showBiometricSetup}
                    onCapture={handleBiometricCapture}
                  />
                  {capturedBiometric && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Fingerprint className="w-4 h-4" />
                      Biometric data captured successfully
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Biometric setup helps improve attendance marking accuracy. You can skip this step and set it up later.
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
