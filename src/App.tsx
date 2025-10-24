import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Settings from '@/pages/Settings';

import TenantManagement from '@/pages/admin/TenantManagement';
import UserManagement from '@/pages/admin/UserManagement';
import KpiManagement from '@/pages/admin/KpiManagement';
import WidgetManagement from '@/pages/admin/WidgetManagement';
import RoleManagement from '@/pages/admin/RoleManagement';
import PermissionManagement from '@/pages/admin/PermissionManagement';
import { ExecutiveDashboard } from "@/components/dashboard/ExecutiveDashboard";
import { FinanceDashboard } from "@/components/dashboard/FinanceDashboard";
import { SalesDashboard } from "@/components/dashboard/SalesDashboard";
import PurchaseDashboard from "@/components/dashboard/PurchaseDashboard";
import { InventoryDashboard } from "@/components/dashboard/InventoryDashboard";
import { HRDashboard } from "@/components/dashboard/HRDashboard";
import NotFound from '@/pages/NotFound';
import { LoginForm } from '@/components/LoginForm';
import { useAuthStore } from '@/store/authStore';
import { useRoleStore } from '@/store/roleStore';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { PermissionProtectedRoute } from '@/components/PermissionProtectedRoute';
import './App.css';

// ✅ Added import for Landing Page
import LandingPage from '@/components/Landing';

const queryClient = new QueryClient();

function App() {
  const { session } = useAuthStore();
  const { getAccessibleModules } = useRoleStore();
  
  // Initialize inactivity timer
  useInactivityTimer();

  // Get the first accessible dashboard for the user
  const accessibleModules = getAccessibleModules();
  const defaultDashboard = accessibleModules.length > 0 ? `/dashboard/${accessibleModules[0].id}` : '/settings';

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Routes>
              {/* ✅ Landing Page is now the main route always */}
              <Route path="/" element={<LandingPage />} />

              {/* ✅ Login page remains separate */}
              <Route path="/login" element={<LoginForm />} />

              {/* ✅ Dashboards (protected routes) */}
              <Route 
                path="/dashboard/executive" 
                element={
                  <ProtectedRoute moduleId="executive">
                    <ExecutiveDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/finance" 
                element={
                  <ProtectedRoute moduleId="finance">
                    <FinanceDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/sales" 
                element={
                  <ProtectedRoute moduleId="sales">
                    <SalesDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/purchase" 
                element={
                  <ProtectedRoute moduleId="purchase">
                    <PurchaseDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/inventory" 
                element={
                  <ProtectedRoute moduleId="inventory">
                    <InventoryDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/hr" 
                element={
                  <ProtectedRoute moduleId="hr">
                    <HRDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* ✅ Settings */}
              <Route path="/settings" element={<Settings />} />

              {/* ✅ Admin routes */}
              <Route path="/admin/tenants" element={
                <AdminProtectedRoute>
                  <TenantManagement />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <AdminProtectedRoute>
                  <UserManagement />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/kpis" element={
                <AdminProtectedRoute>
                  <KpiManagement />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/widgets" element={
                <AdminProtectedRoute>
                  <WidgetManagement />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/roles" element={
                <AdminProtectedRoute>
                  <RoleManagement />
                </AdminProtectedRoute>
              } />
              <Route path="/permissions" element={
                <PermissionProtectedRoute>
                  <PermissionManagement />
                </PermissionProtectedRoute>
              } />

              {/* ✅ Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
