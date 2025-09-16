import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useRoleStore } from '@/store/roleStore';

interface PermissionProtectedRouteProps {
  children: ReactNode;
}

export function PermissionProtectedRoute({ children }: PermissionProtectedRouteProps) {
  const { session } = useAuthStore();
  const { getAccessibleModules } = useRoleStore();
  
  // Check if user has CEO or Finance Manager role (permission management access)
  const userRole = session?.user?.role_name || '';
  const hasPermissionAccess = ['CEO', 'Finance Manager'].includes(userRole);
  
  if (!hasPermissionAccess) {
    // Redirect to the first accessible dashboard, or home if none
    const accessibleModules = getAccessibleModules();
    const redirectPath = accessibleModules.length > 0 
      ? `/dashboard/${accessibleModules[0].id}` 
      : '/';
    
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}