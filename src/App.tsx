
import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from '@/store/authStore';
import { useTenantStore } from "@/store/tenantStore";
import { LoginForm } from "@/components/LoginForm";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { session, isAuthenticated, isSessionExpired, logout } = useAuthStore();
  const { fetchUserTenants, setSession, clearSession } = useTenantStore();

  useEffect(() => {
    if (isSessionExpired()) {
      logout();
      clearSession();
      return;
    }

    if (isAuthenticated() && session) {
      // Initialize tenant session
      fetchUserTenants(session.user.user_id, session.user.tenant_id);
      
      // Set tenant session
      const tenantSession = {
        userId: session.user.user_id,
        email: session.user.email,
        tenantId: session.user.tenant_id,
        roleId: session.user.role_id,
        tenantInfo: {
          id: session.user.tenant_id.toString(),
          name: `Tenant ${session.user.tenant_id}`,
          database_url: '',
          company_code: `T${session.user.tenant_id}`
        },
        lastAccessed: new Date(),
      };
      setSession(tenantSession);
    }
  }, [session, isAuthenticated, isSessionExpired, fetchUserTenants, setSession, logout, clearSession]);

  if (!isAuthenticated()) {
    return <LoginForm />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
