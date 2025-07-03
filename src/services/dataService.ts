import { useTenantStore } from '@/store/tenantStore';
import { useAuthStore } from '@/store/authStore';

export interface DashboardData {
  revenue: number;
  customers: number;
  orders: number;
  growthRate: number;
  salesData: Array<{
    name: string;
    value: number;
    orders: number;
    customers: number;
    visits: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'order' | 'report' | 'alert';
    title: string;
    description: string;
    timestamp: string;
  }>;
}

export interface AnalyticsData {
  revenue: number;
  customers: number;
  orders: number;
  visits: number;
  name: string;
}

class DataService {
  private getApiUrl(endpoint: string): string {
    const session = useTenantStore.getState().currentSession;
    if (!session) {
      throw new Error('No active session');
    }
    
    return `http://localhost:8000/api/v1/tenants/${session.tenantId}/${endpoint}`;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const authSession = useAuthStore.getState().session;
    const tenantSession = useTenantStore.getState().currentSession;
    
    if (!authSession || !tenantSession) {
      throw new Error('No active session');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authSession.token}`,
      'X-User-ID': authSession.user.user_id.toString(),
      'X-Tenant-ID': tenantSession.tenantId.toString(),
      'X-Role-ID': authSession.user.role_id.toString(),
    };
  }

  async fetchDashboardData(): Promise<DashboardData> {
    try {
      const response = await fetch(this.getApiUrl('dashboard'), {
        headers: await this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Return dummy data for now
      return {
        revenue: 45231.89,
        customers: 2350,
        orders: 12234,
        growthRate: 12.5,
        salesData: [
          { name: 'Jan', value: 4000, orders: 240, customers: 180, visits: 1200 },
          { name: 'Feb', value: 3000, orders: 198, customers: 160, visits: 1900 },
          { name: 'Mar', value: 2000, orders: 180, customers: 140, visits: 1600 },
          { name: 'Apr', value: 2780, orders: 208, customers: 190, visits: 2100 },
          { name: 'May', value: 1890, orders: 181, customers: 170, visits: 2400 },
          { name: 'Jun', value: 2390, orders: 250, customers: 200, visits: 1800 },
        ],
        recentActivity: [
          {
            id: '1',
            type: 'order',
            title: 'New order received',
            description: 'Order #1234 - $299.99',
            timestamp: '2 min ago',
          },
          {
            id: '2',
            type: 'report',
            title: 'Report generated',
            description: 'Monthly sales report',
            timestamp: '15 min ago',
          },
          {
            id: '3',
            type: 'alert',
            title: 'Inventory alert',
            description: 'Low stock on item #456',
            timestamp: '1 hour ago',
          },
        ],
      };
    }
  }

  async fetchAnalyticsData(): Promise<AnalyticsData[]> {
    try {
      const response = await fetch(this.getApiUrl('analytics'), {
        headers: await this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      
      // Return dummy data for now
      return [
        { name: 'Jan', revenue: 4000, customers: 240, orders: 120, visits: 1200 },
        { name: 'Feb', revenue: 3000, customers: 198, orders: 98, visits: 1900 },
        { name: 'Mar', revenue: 2000, customers: 180, orders: 85, visits: 1600 },
        { name: 'Apr', revenue: 2780, customers: 208, orders: 110, visits: 2100 },
        { name: 'May', revenue: 1890, customers: 181, orders: 95, visits: 2400 },
        { name: 'Jun', revenue: 2390, customers: 250, orders: 125, visits: 1800 },
      ];
    }
  }

  async saveChartToAnalytics(chartData: any): Promise<void> {
    try {
      const response = await fetch(this.getApiUrl('analytics/charts'), {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify(chartData),
      });

      if (!response.ok) {
        throw new Error('Failed to save chart to analytics');
      }
    } catch (error) {
      console.error('Error saving chart to analytics:', error);
    }
  }

  async chatWithAgent(message: string): Promise<string> {
    try {
      const response = await fetch(this.getApiUrl('chat/agent'), {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({
          message,
          tenant_context: useTenantStore.getState().currentSession?.tenantInfo
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to chat with agent');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error chatting with agent:', error);
      return 'Sorry, I encountered an error processing your request.';
    }
  }
}

export const dataService = new DataService();
