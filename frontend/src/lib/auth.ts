import Cookies from 'js-cookie';
import { User } from './types';

export const getToken = () => {
  return Cookies.get('token');
};

export const setToken = (token: string) => {
  Cookies.set('token', token, { expires: 1 }); // 1 day
};

export const removeToken = () => {
  Cookies.remove('token');
};

export const getUser = (): User | null => {
  const userStr = Cookies.get('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setUser = (user: User) => {
  Cookies.set('user', JSON.stringify(user), { expires: 1 });
};

export const removeUser = () => {
  Cookies.remove('user');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const getUserRole = () => {
  const user = getUser();
  return user?.role;
};

export const isAdmin = () => {
  return getUserRole() === 'ADMIN';
};

export const isTeacher = () => {
  return getUserRole() === 'TEACHER';
};

export const isStudent = () => {
  return getUserRole() === 'STUDENT';
};

export const logout = () => {
  removeToken();
  removeUser();
  window.location.href = '/login';
};
