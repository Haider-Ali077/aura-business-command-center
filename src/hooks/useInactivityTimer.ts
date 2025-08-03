import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export const useInactivityTimer = () => {
  const { updateActivity, checkInactivity, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateActivity();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Set up interval to check inactivity every minute
    const inactivityInterval = setInterval(() => {
      checkInactivity();
    }, 60000); // Check every minute

    return () => {
      // Clean up event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearInterval(inactivityInterval);
    };
  }, [updateActivity, checkInactivity, isAuthenticated]);
};