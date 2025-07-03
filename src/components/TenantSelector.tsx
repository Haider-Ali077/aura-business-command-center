
import { useState } from 'react';
import { useTenantStore } from '@/store/tenantStore';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, RefreshCw } from 'lucide-react';

export function TenantSelector() {
  const { currentSession, tenants, switchTenant, refreshDashboardData, isLoading } = useTenantStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTenantChange = async (tenantId: string) => {
    try {
      await switchTenant(tenantId);
    } catch (error) {
      console.error('Error switching tenant:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshDashboardData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!currentSession) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-gray-500" />
      <Select value={currentSession.tenantId.toString()} onValueChange={handleTenantChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select company" />
        </SelectTrigger>
        <SelectContent>
          {tenants.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.id}>
              <div className="flex flex-col">
                <span className="font-medium">{tenant.name}</span>
                <span className="text-xs text-gray-500">{tenant.company_code}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing || isLoading}
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}
