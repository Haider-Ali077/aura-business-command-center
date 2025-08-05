import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useRoleStore } from '@/store/roleStore';

interface ProtectedRouteProps {
  children: ReactNode;
  moduleId: string;
}

export function ProtectedRoute({ children, moduleId }: ProtectedRouteProps) {
  const { hasModuleAccess, getAccessibleModules } = useRoleStore();
  
  // Check if user has access to this specific module
  if (!hasModuleAccess(moduleId)) {
    // Redirect to the first accessible dashboard, or home if none
    const accessibleModules = getAccessibleModules();
    const redirectPath = accessibleModules.length > 0 
      ? `/dashboard/${accessibleModules[0].id}` 
      : '/';
    
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}