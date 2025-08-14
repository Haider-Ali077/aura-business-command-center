
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Dashboard from '@/pages/Dashboard';
import Analytics from '@/pages/Analytics';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import TenantManagement from '@/pages/admin/TenantManagement';
import UserManagement from '@/pages/admin/UserManagement';
import KpiManagement from '@/pages/admin/KpiManagement';
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
import { Layout } from '@/components/Layout';
import './App.css';

const queryClient = new QueryClient();

function App() {
  const { session } = useAuthStore();
  const { getAccessibleModules } = useRoleStore();
  
  // Initialize inactivity timer
  useInactivityTimer();

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoginForm />
        <Toaster />
      </div>
    );
  }

  // Get the first accessible dashboard for the user
  const accessibleModules = getAccessibleModules();
  const defaultDashboard = accessibleModules.length > 0 ? `/dashboard/${accessibleModules[0].id}` : '/settings';

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Routes>
              <Route path="/" element={<Navigate to={defaultDashboard} replace />} />
              <Route 
                path="/dashboard/executive" 
                element={
                  <Layout>
                    <ProtectedRoute moduleId="executive">
                      <ExecutiveDashboard />
                    </ProtectedRoute>
                  </Layout>
                } 
              />
              <Route 
                path="/dashboard/finance" 
                element={
                  <Layout>
                    <ProtectedRoute moduleId="finance">
                      <FinanceDashboard />
                    </ProtectedRoute>
                  </Layout>
                } 
              />
              <Route 
                path="/dashboard/sales" 
                element={
                  <Layout>
                    <ProtectedRoute moduleId="sales">
                      <SalesDashboard />
                    </ProtectedRoute>
                  </Layout>
                } 
              />
              <Route 
                path="/dashboard/purchase" 
                element={
                  <Layout>
                    <ProtectedRoute moduleId="purchase">
                      <PurchaseDashboard />
                    </ProtectedRoute>
                  </Layout>
                } 
              />
              <Route 
                path="/dashboard/inventory" 
                element={
                  <Layout>
                    <ProtectedRoute moduleId="inventory">
                      <InventoryDashboard />
                    </ProtectedRoute>
                  </Layout>
                } 
              />
              <Route 
                path="/dashboard/hr" 
                element={
                  <Layout>
                    <ProtectedRoute moduleId="hr">
                      <HRDashboard />
                    </ProtectedRoute>
                  </Layout>
                } 
              />
              <Route path="/settings" element={<Layout><Settings /></Layout>} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <Layout>
                  <AdminDashboard />
                </Layout>
              } />
              <Route path="/admin/tenants" element={
                <Layout>
                  <TenantManagement />
                </Layout>
              } />
              <Route path="/admin/users" element={
                <Layout>
                  <UserManagement />
                </Layout>
              } />
              <Route path="/admin/kpis" element={
                <Layout>
                  <KpiManagement />
                </Layout>
              } />
              
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
