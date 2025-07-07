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
  categoryData: Array<{
    name: string;
    value: number;
    color: string;
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
  private async getRequestBody(): Promise<any> {
    const session = useAuthStore.getState().session;
    
    if (!session) {
      throw new Error('No active session');
    }
    
    return {
      user_id: session.user.user_id,
      tenant_name: session.user.tenant_id,
      token: session.token,
      role_name: session.user.role_name
    };
  }

  async fetchDashboardData(): Promise<DashboardData> {
    try {
      const requestBody = await this.getRequestBody();
      
      const response = await fetch('http://localhost:8000/api/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
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
        categoryData: [
          { name: 'Electronics', value: 35, color: '#3B82F6' },
          { name: 'Clothing', value: 25, color: '#10B981' },
          { name: 'Home & Garden', value: 20, color: '#F59E0B' },
          { name: 'Sports', value: 20, color: '#EF4444' },
        ],
      };
    }
  }

  async fetchAnalyticsData(): Promise<AnalyticsData[]> {
    try {
      const requestBody = await this.getRequestBody();
      
      const response = await fetch('http://localhost:8000/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      
      return [
        { name: 'Jan', revenue: 4000, customers: 240, orders: 120, visits: 1200 },
        { name: 'Feb', revenue: 3000, customers: 198, orders: 98, visits: 1900 },
        { name: 'Mar', revenue: 2000, customers: 180, orders: 85, visits: 1600 },
        { name: 'Apr', revenue: 2780, customers: 208, orders: 110, visits: 2100 },
        { name: 'May', revenue: 1890, customers: 181, orders: 95, visits: 2400 },
        { name: 'Jun', revenue: 2390, orders: 125, customers: 250, visits: 1800 },
      ];
    }
  }

  async saveChartToAnalytics(chartData: any): Promise<void> {
    try {
      const requestBody = await this.getRequestBody();
      
      const response = await fetch('http://localhost:8000/api/analytics/charts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...requestBody,
          chart_data: chartData
        }),
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
      const requestBody = await this.getRequestBody();
      
      const response = await fetch('http://localhost:8000/api/chat/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...requestBody,
          message
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
