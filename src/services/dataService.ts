import { useAuthStore } from "@/store/authStore";
import { API_BASE_URL } from '@/config/api';
import { cache } from '@/lib/cache';

// export interface DashboardData {
//   revenue: number;
//   customers: number;
//   orders: number;
//   growthRate: number;
//   salesData: Array<{
//     name: string;
//     value: number;
//     orders: number;
//     customers: number;
//     visits: number;
//   }>;
//   categoryData: Array<{
//     name: string;
//     value: number;
//     color: string;
//   }>;
// }

export interface DashboardData {
  datacards: {
    revenue: {
      value: number;
      growth: number;
    };
    orders: {
      value: number;
      growth: number;
    };
    customers: {
      value: number;
      growth: number;
    };
    avg_order_value: {
      value: number;
      growth: number;
    };
  };

  charts: {
    horizontal_bar: Array<{
      name: string;
      value: number;
    }>;

    vertical_bar: Array<{
      name: string;
      value: number;
    }>;

    doughnut: Array<{
      name: string;
      value: number;
      color: string;
    }>;

    line: Array<{
      name: string;
      value: number;
    }>;
  };
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
      throw new Error("No active session");
    }

    return {
      user_id: session.user.user_id,
      tenant_name: session.user.tenant_id,
      token: session.token,
      role_name: session.user.role_name,
    };
  }

  async fetchDashboardData(): Promise<DashboardData> {
    try {
      const requestBody = await this.getRequestBody();

      const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching dashboard data:", error);

      return {
        datacards: {
          revenue: {
            value: 125000,
            growth: 4.5,
          },
          orders: {
            value: 1200,
            growth: 3.2,
          },
          customers: {
            value: 300,
            growth: 2.1,
          },
          avg_order_value: {
            value: 104.17,
            growth: 1.7,
          },
        },
        charts: {
          horizontal_bar: [
            { name: "Acme Corp", value: 32000 },
            { name: "Globex Inc", value: 28000 },
            { name: "Soylent Corp", value: 21000 },
            { name: "Initech", value: 18000 },
            { name: "Umbrella Ltd", value: 15000 },
          ],
          vertical_bar: [
            { name: "Feb 2024", value: 20000 },
            { name: "Mar 2024", value: 25000 },
            { name: "Apr 2024", value: 30000 },
            { name: "May 2024", value: 28000 },
            { name: "Jun 2024", value: 32000 },
            { name: "Jul 2024", value: 35000 },
          ],
          doughnut: [
            { name: "Electronics", value: 40000, color: "#FF6384" },
            { name: "Furniture", value: 30000, color: "#36A2EB" },
            { name: "Apparel", value: 20000, color: "#FFCE56" },
            { name: "Office Supplies", value: 15000, color: "#4BC0C0" },
          ],
          line: [
            { name: "2024-06-30", value: 4500 },
            { name: "2024-07-01", value: 4800 },
            { name: "2024-07-02", value: 5200 },
            { name: "2024-07-03", value: 4900 },
            { name: "2024-07-04", value: 5300 },
            { name: "2024-07-05", value: 5500 },
            { name: "2024-07-06", value: 6000 },
          ],
        },
        // revenue: 45231.89,
        // customers: 2350,
        // orders: 12234,
        // growthRate: 12.5,
        // salesData: [
        //   { name: 'Jan', value: 4000, orders: 240, customers: 180, visits: 1200 },
        //   { name: 'Feb', value: 3000, orders: 198, customers: 160, visits: 1900 },
        //   { name: 'Mar', value: 2000, orders: 180, customers: 140, visits: 1600 },
        //   { name: 'Apr', value: 2780, orders: 208, customers: 190, visits: 2100 },
        //   { name: 'May', value: 1890, orders: 181, customers: 170, visits: 2400 },
        //   { name: 'Jun', value: 2390, orders: 250, customers: 200, visits: 1800 },
        // ],
        // categoryData: [
        //   { name: 'Electronics', value: 35, color: '#3B82F6' },
        //   { name: 'Clothing', value: 25, color: '#10B981' },
        //   { name: 'Home & Garden', value: 20, color: '#F59E0B' },
        //   { name: 'Sports', value: 20, color: '#EF4444' },
        // ],
      };
    }
  }

  async fetchAnalyticsData(): Promise<AnalyticsData[]> {
    try {
      const requestBody = await this.getRequestBody();

      const response = await fetch(`${API_BASE_URL}/api/analytics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching analytics data:", error);

      return [
        {
          name: "Jan",
          revenue: 4000,
          customers: 240,
          orders: 120,
          visits: 1200,
        },
        {
          name: "Feb",
          revenue: 3000,
          customers: 198,
          orders: 98,
          visits: 1900,
        },
        {
          name: "Mar",
          revenue: 2000,
          customers: 180,
          orders: 85,
          visits: 1600,
        },
        {
          name: "Apr",
          revenue: 2780,
          customers: 208,
          orders: 110,
          visits: 2100,
        },
        {
          name: "May",
          revenue: 1890,
          customers: 181,
          orders: 95,
          visits: 2400,
        },
        {
          name: "Jun",
          revenue: 2390,
          orders: 125,
          customers: 250,
          visits: 1800,
        },
      ];
    }
  }

  async saveChartToAnalytics(chartData: any): Promise<void> {
    try {
      const requestBody = await this.getRequestBody();

      const response = await fetch(
        `${API_BASE_URL}/api/analytics/charts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...requestBody,
            chart_data: chartData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save chart to analytics");
      }
    } catch (error) {
      console.error("Error saving chart to analytics:", error);
    }
  }

  async chatWithAgent(message: string): Promise<string> {
    try {
      const requestBody = await this.getRequestBody();

      const response = await fetch(`${API_BASE_URL}/api/chat/agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...requestBody,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to chat with agent");
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error chatting with agent:", error);
      return "Sorry, I encountered an error processing your request.";
    }
  }

  /**
   * Fetch KPI cards for a dashboard with caching (10 minutes)
   * This prevents re-running queries when switching between dashboards
   */
  async fetchKpis(dashboard: string, tenantId?: number): Promise<any[]> {
    try {
      const session = useAuthStore.getState().session;
      
      if (!session) {
        throw new Error('No active session');
      }

      const effectiveTenantId = tenantId || session.user.tenant_id;
      const userId = session.user.user_id;
      
      const cacheKey = `kpis:${effectiveTenantId}:${dashboard}`;

      // Check cache first
      const cached = cache.get<any[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await fetch(`${API_BASE_URL}/kpis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: effectiveTenantId,
          tenant_name: effectiveTenantId,
          dashboard,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch KPIs: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the result
      cache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      return [];
    }
  }

  /**
   * Invalidate KPI cache for a tenant/dashboard
   * Call this after any operation that changes KPI data
   */
  invalidateKpis(tenantId: number, dashboard?: string): void {
    if (dashboard) {
      cache.invalidate(`kpis:${tenantId}:${dashboard}`);
    } else {
      cache.invalidate(`kpis:${tenantId}:`);
    }
  }

  /**
   * Force refresh KPIs by invalidating cache and re-fetching
   */
  async refreshKpis(dashboard: string, tenantId?: number): Promise<any[]> {
    const session = useAuthStore.getState().session;
    if (!session) {
      throw new Error('No active session');
    }

    const effectiveTenantId = tenantId || session.user.tenant_id;
    this.invalidateKpis(effectiveTenantId, dashboard);
    
    return this.fetchKpis(dashboard, tenantId);
  }
}

export const dataService = new DataService();
