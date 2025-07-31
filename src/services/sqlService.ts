
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
  async runSql(query: string, databaseName?: string): Promise<SqlResult | any[]> {
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
      
      // Return raw data if it's already an array of objects
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
        return data;
      }
      
      // Handle legacy format - data is array of objects
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
      const lastColumnIndex = sqlResult.columns.length - 1;
      
      sqlResult.columns.forEach((column, index) => {
        const columnName = column.toLowerCase();
        let value = row[index];
        
        // Set name from first column
        if (index === 0) {
          let nameValue = String(value);
          
          // Convert numeric months to month names
          if (typeof value === 'number' && value >= 1 && value <= 12 && 
              columnName.includes('month')) {
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
        
        // Store all column values with original column names
        item[column] = value;
        
        // Set the last column as the primary value (most common pattern)
        if (index === lastColumnIndex && typeof value === 'number') {
          item.value = value;
        }
      });
      
      return item;
    });
  }

  // New method to handle data that's already in object format
  convertObjectArrayToChartData(dataArray: any[]): ChartData[] {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return [];
    }

    return dataArray.map(item => {
      const chartItem: ChartData = { name: '' };
      const keys = Object.keys(item);
      
      // First key becomes the name/label
      if (keys.length > 0) {
        const firstKey = keys[0];
        let nameValue = String(item[firstKey]);
        
        // Handle month conversion
        if (typeof item[firstKey] === 'number' && item[firstKey] >= 1 && item[firstKey] <= 12 && 
            firstKey.toLowerCase().includes('month')) {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          nameValue = monthNames[item[firstKey] - 1];
        }
        
        // Handle date formatting
        if (typeof item[firstKey] === 'string' && item[firstKey].match(/^\d{4}-\d{2}-\d{2}/)) {
          const date = new Date(item[firstKey]);
          nameValue = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        
        chartItem.name = nameValue;
      }
      
      // Store all properties
      Object.keys(item).forEach(key => {
        chartItem[key] = item[key];
      });
      
      // Last key with numeric value becomes the primary value
      const numericKeys = keys.filter(key => typeof item[key] === 'number');
      if (numericKeys.length > 0) {
        const lastNumericKey = numericKeys[numericKeys.length - 1];
        chartItem.value = item[lastNumericKey];
      }
      
      return chartItem;
    });
  }

  async getChartData(query: string, databaseName?: string): Promise<ChartData[]> {
    const result = await this.runSql(query, databaseName);
    
    console.log('SQL Result type:', Array.isArray(result) ? 'Array' : 'Object');
    console.log('SQL Result:', result);
    
    // Handle new API response format - data is already objects
    if (Array.isArray(result)) {
      console.log('Processing as array of objects');
      const chartData = result.map(item => ({
        ...item,
        name: String(item[Object.keys(item)[0]]) // First key becomes the name/label
      }));
      console.log('Converted chart data:', chartData);
      return chartData;
    }
    
    // Handle legacy SqlResult format
    if (result && 'columns' in result && 'rows' in result && result.rows.length > 0) {
      console.log('Processing as SqlResult format');
      const objectArray = result.rows.map(row => {
        const obj: any = {};
        result.columns.forEach((col, index) => {
          obj[col] = row[index];
        });
        return obj;
      });
      const chartData = objectArray.map(item => ({
        ...item,
        name: String(item[Object.keys(item)[0]]) // First key becomes the name/label
      }));
      console.log('Converted chart data from SqlResult:', chartData);
      return chartData;
    }
    
    return [];
  }
}

export const sqlService = new SqlService();
