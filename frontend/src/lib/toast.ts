'use client';

// Simple client-safe notification system
export const toast = {
  success: (message: string) => {
    if (typeof window !== 'undefined') {
      console.log('✅ Success:', message);
      // You can replace this with a custom notification component later
      alert(`Success: ${message}`);
    }
  },
  error: (message: string) => {
    if (typeof window !== 'undefined') {
      console.error('❌ Error:', message);
      alert(`Error: ${message}`);
    }
  },
  info: (message: string) => {
    if (typeof window !== 'undefined') {
      console.info('ℹ️ Info:', message);
      alert(`Info: ${message}`);
    }
  },
  warning: (message: string) => {
    if (typeof window !== 'undefined') {
      console.warn('⚠️ Warning:', message);
      alert(`Warning: ${message}`);
    }
  }
};

export default toast;
