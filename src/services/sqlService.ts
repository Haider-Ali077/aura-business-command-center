
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
  async runSql(query: string, databaseName?: string): Promise<SqlResult> {
    try {
      const authStore = useAuthStore.getState();
      const session = authStore.session;
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch('http://127.0.0.1:8000/execute-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          database_name: databaseName || session.user.tenant_name
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle new API response format - data is array of objects
      if (Array.isArray(data) && data.length > 0) {
        const columns = Object.keys(data[0]);
        const rows = data.map(row => columns.map(col => row[col]));
        return { columns, rows };
      }
      
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
        
        if (index === 0) {
          item.name = String(row[index]);
        }
      });
      
      return item;
    });
  }

  async getChartData(query: string, databaseName?: string): Promise<ChartData[]> {
    const result = await this.runSql(query, databaseName);
    return this.convertToChartData(result);
  }
}

export const sqlService = new SqlService();
