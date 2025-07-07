
import { useAuthStore } from '@/store/authStore';

export interface SqlResult {
  columns: string[];
  rows: any[][];
}

export interface ChartData {
  name: string;
  [key: string]: any;
}

class SqlService {
  async runSql(query: string): Promise<SqlResult> {
    try {
      // Get current session information from auth store
      const authStore = useAuthStore.getState();
      const session = authStore.session;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Get tenant name from session or use a default format
      const tenantName = session?.tenantInfo.company_code || 'Company_A';

      const response = await fetch('/runsql', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          query,
          tenant_name: tenantName
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        columns: data.columns || data.cols || [],
        rows: data.rows || data.data || []
      };
    } catch (error) {
      console.error('Error running SQL query:', error);
      throw error;
    }
  }

  convertToChartData(sqlResult: SqlResult): ChartData[] {
    if (!sqlResult.columns || !sqlResult.rows) {
      return [];
    }

    return sqlResult.rows.map(row => {
      const item: ChartData = { name: '' };
      
      sqlResult.columns.forEach((column, index) => {
        item[column.toLowerCase()] = row[index];
        
        // Set the first column as 'name' for charts
        if (index === 0) {
          item.name = String(row[index]);
        }
      });
      
      return item;
    });
  }

  async getChartData(query: string): Promise<ChartData[]> {
    const result = await this.runSql(query);
    return this.convertToChartData(result);
  }
}

export const sqlService = new SqlService();
