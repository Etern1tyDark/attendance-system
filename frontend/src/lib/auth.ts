import { User } from './types';

const TOKEN_STORAGE_KEY = 'smart-attendance-token';
const USER_STORAGE_KEY = 'smart-attendance-user';

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage;
};

export const getToken = () => {
  return getStorage()?.getItem(TOKEN_STORAGE_KEY) || null;
};

export const setToken = (token: string) => {
  getStorage()?.setItem(TOKEN_STORAGE_KEY, token);
};

export const removeToken = () => {
  getStorage()?.removeItem(TOKEN_STORAGE_KEY);
};

export const getUser = (): User | null => {
  const userStr = getStorage()?.getItem(USER_STORAGE_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setUser = (user: User) => {
  getStorage()?.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const removeUser = () => {
  getStorage()?.removeItem(USER_STORAGE_KEY);
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

  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};
