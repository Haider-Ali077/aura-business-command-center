import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRoleStore, dashboardModules } from '@/store/roleStore';
import { useAuthStore } from '@/store/authStore';
import { ExecutiveDashboard } from '@/components/dashboard/ExecutiveDashboard';
import { FinanceDashboard } from '@/components/dashboard/FinanceDashboard';
import { SalesDashboard } from '@/components/dashboard/SalesDashboard';
import { InventoryDashboard } from '@/components/dashboard/InventoryDashboard';
import { HRDashboard } from '@/components/dashboard/HRDashboard';
import { BarChart3, DollarSign, TrendingUp, Package, Users, ArrowLeft, Shield } from "lucide-react";

const iconMap = {
  BarChart3,
  DollarSign,
  TrendingUp,
  Package,
  Users
};

export default function RoleDashboards() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { hasModuleAccess, getAccessibleModules, getUserRole } = useRoleStore();
  const { session } = useAuthStore();
  const [accessibleModules, setAccessibleModules] = useState(getAccessibleModules());
  
  useEffect(() => {
    setAccessibleModules(getAccessibleModules());
  }, [session]);

  // Show module selection page if no moduleId
  if (!moduleId) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Role-Based Dashboards</h1>
              <p className="text-gray-600 mt-2">
                Select a dashboard module based on your role: <Badge variant="outline">{getUserRole()}</Badge>
              </p>
            </div>
          </div>

          {accessibleModules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Dashboard Access</h3>
                <p className="text-gray-600 text-center">
                  Your current role ({getUserRole()}) doesn't have access to any dashboard modules.
                  Please contact your administrator for access.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accessibleModules.map((module) => {
                const IconComponent = iconMap[module.icon as keyof typeof iconMap];
                return (
                  <Card key={module.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          {IconComponent && <IconComponent className="h-6 w-6 text-white" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{module.name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {module.roles.slice(0, 3).map(role => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                          {module.roles.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{module.roles.length - 3} more
                            </Badge>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => window.location.href = `/dashboards/${module.id}`}
                          className="ml-2"
                        >
                          Open
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // Check access for specific module
  if (!hasModuleAccess(moduleId)) {
    return <Navigate to="/dashboards" replace />;
  }

  // Get module info
  const currentModule = dashboardModules.find(m => m.id === moduleId);
  if (!currentModule) {
    return <Navigate to="/dashboards" replace />;
  }

  // Render specific dashboard
  const renderDashboard = () => {
    switch (moduleId) {
      case 'executive':
        return <ExecutiveDashboard />;
      case 'finance':
        return <FinanceDashboard />;
      case 'sales':
        return <SalesDashboard />;
      case 'inventory':
        return <InventoryDashboard />;
      case 'hr':
        return <HRDashboard />;
      default:
        return <Navigate to="/dashboards" replace />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Modules
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{getUserRole()}</Badge>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{currentModule.name}</span>
            </div>
          </div>
        </div>
        
        {renderDashboard()}
      </div>
    </Layout>
  );
}