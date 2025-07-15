
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Dashboard from '@/pages/Dashboard';
import Analytics from '@/pages/Analytics';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import { ExecutiveDashboard } from "@/components/dashboard/ExecutiveDashboard";
import { FinanceDashboard } from "@/components/dashboard/FinanceDashboard";
import { SalesDashboard } from "@/components/dashboard/SalesDashboard";
import { InventoryDashboard } from "@/components/dashboard/InventoryDashboard";
import { HRDashboard } from "@/components/dashboard/HRDashboard";
import NotFound from '@/pages/NotFound';
import { LoginForm } from '@/components/LoginForm';
import { useAuthStore } from '@/store/authStore';
import './App.css';

const queryClient = new QueryClient();

function App() {
  const { session } = useAuthStore();

  if (!session) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <LoginForm />
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard/executive" replace />} />
              {/* <Route path="/dashboard" element={<Dashboard />} /> */}
              <Route path="/dashboard/executive" element={<ExecutiveDashboard />} />
              <Route path="/dashboard/finance" element={<FinanceDashboard />} />
              <Route path="/dashboard/sales" element={<SalesDashboard />} />
              <Route path="/dashboard/inventory" element={<InventoryDashboard />} />
              <Route path="/dashboard/hr" element={<HRDashboard />} />
              {/* <Route path="/analytics" element={<Analytics />} /> */}
              {/* <Route path="/reports" element={<Reports />} /> */}
              <Route path="/settings" element={<Settings />} />
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
