import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * Hook to detect user changes and trigger cleanup
 * This ensures that when a user logs out or switches users,
 * the previous user's state is properly cleaned up
 */
export const useUserChangeDetection = () => {
  const { session } = useAuthStore();
  const previousUserIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    const currentUserId = session?.user?.user_id?.toString() || null;
    const previousUserId = previousUserIdRef.current;
    
    // If user has changed (including logout)
    if (previousUserId !== null && previousUserId !== currentUserId) {
      console.log(`🔄 User changed from ${previousUserId} to ${currentUserId}`);
      
      // Trigger cleanup for the previous user
      if (previousUserId) {
        console.log(`🧹 Cleaning up state for previous user: ${previousUserId}`);
        
        // Clear any cached data or state that might be user-specific
        // This could include clearing localStorage, sessionStorage, or other caches
        try {
          // Clear any user-specific localStorage items
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`user_${previousUserId}_`)) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
          
          // Clear any user-specific sessionStorage items
          const sessionKeysToRemove = [];
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith(`user_${previousUserId}_`)) {
              sessionKeysToRemove.push(key);
            }
          }
          sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
          
          console.log(`✅ Cleaned up ${keysToRemove.length} localStorage and ${sessionKeysToRemove.length} sessionStorage items`);
        } catch (error) {
          console.warn('⚠️ Error during cleanup:', error);
        }
      }
    }
    
    // Update the ref with current user
    previousUserIdRef.current = currentUserId;
    
    // Log current user state
    if (currentUserId) {
      console.log(`👤 Current user: ${currentUserId} (Tenant: ${session?.user?.tenant_id})`);
    } else {
      console.log('👤 No user logged in');
    }
    
  }, [session?.user?.user_id, session?.user?.tenant_id]);
  
  return {
    currentUserId: session?.user?.user_id?.toString() || null,
    currentTenantId: session?.user?.tenant_id || null,
    isLoggedIn: !!session?.user?.user_id
  };
};
