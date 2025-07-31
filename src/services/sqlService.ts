
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
        const columnName = column.toLowerCase();
        let value = row[index];
        
        // Handle the first column (name/label)
        if (index === 0) {
          let nameValue = String(value);
          
          // Convert numeric months to month names
          if (typeof value === 'number' && value >= 1 && value <= 12) {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            nameValue = monthNames[value - 1];
          }
          
          // Handle date formatting
          if (value && typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
            const date = new Date(value);
            nameValue = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
          
          item.name = nameValue;
        }
        
        // Store original column value
        item[columnName] = value;
        
        // Auto-detect primary data key for charts
        if (index > 0 && typeof value === 'number') {
          // If we haven't set a primary value yet, use this numeric column
          if (!item.value) {
            item.value = value;
          }
          
          // Map based on common column patterns
          if (columnName.includes('revenue') || columnName.includes('sales') || 
              columnName.includes('amount') || columnName.includes('total')) {
            item.value = value;
            item.revenue = value;
          } else if (columnName.includes('customer') || columnName.includes('count') || 
                     columnName.includes('qty') || columnName.includes('quantity')) {
            if (!item.value || columnName.includes('customer')) {
              item.value = value;
            }
            item.customers = value;
          } else if (columnName.includes('visit') || columnName.includes('traffic') || 
                     columnName.includes('view')) {
            if (!item.value) {
              item.value = value;
            }
            item.visits = value;
          } else if (columnName.includes('payment') || columnName.includes('transaction')) {
            if (!item.value) {
              item.value = value;
            }
            item.payments = value;
          }
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
