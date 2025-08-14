import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useRoleStore } from '@/store/roleStore';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { session } = useAuthStore();
  const { getAccessibleModules } = useRoleStore();
  
  // Check if user has Admin role
  if (session?.user?.role_name !== 'Admin') {
    // Redirect to the first accessible dashboard, or home if none
    const accessibleModules = getAccessibleModules();
    const redirectPath = accessibleModules.length > 0 
      ? `/dashboard/${accessibleModules[0].id}` 
      : '/';
    
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}