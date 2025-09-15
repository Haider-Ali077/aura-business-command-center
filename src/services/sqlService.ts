
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/config/api';
import { SqlResult, EnhancedChartData, ChartMetadata, ChartConfig } from '@/types/chart';

// Legacy interface for backward compatibility
export interface ChartData {
  name: string;
  [key: string]: any;
}

// Use enhanced version for new implementations
export type { EnhancedChartData };

class SqlService {
  async runSql(query: string, databaseName?: string): Promise<SqlResult | any[]> {
    try {
      const authStore = useAuthStore.getState();
      const session = authStore.session;
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${API_BASE_URL}/execute-sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          database_name: databaseName || session.user.tenant_name,
          user_id: session.user.user_id,
          tenant_name: session.user.tenant_id,
          token: session.token,
          role_name: session.user.role_name
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

  // Enhanced method that preserves column metadata
  generateChartMetadata(data: any[]): ChartMetadata {
    if (!Array.isArray(data) || data.length === 0) {
      return { columns: [] };
    }

    const firstItem = data[0];
    const keys = Object.keys(firstItem);
    
    const columns = keys.map(key => ({
      key,
      label: this.formatColumnLabel(key),
      type: this.detectColumnType(firstItem[key]) as 'string' | 'number' | 'date'
    }));

    // Find best label key (first non-numeric)
    const labelKey = keys.find(key => typeof firstItem[key] !== 'number') || keys[0];
    
    // Find best data key (prioritize common value fields)
    const priorityKeys = ['value', 'amount', 'total', 'count', 'revenue', 'sales'];
    const dataKey = keys.find(key => 
      typeof firstItem[key] === 'number' && 
      priorityKeys.some(p => key.toLowerCase().includes(p))
    ) || keys.filter(key => typeof firstItem[key] === 'number').pop();

    return {
      columns,
      labelKey,
      dataKey
    };
  }

  private formatColumnLabel(key: string): string {
    return key
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private detectColumnType(value: any): string {
    if (typeof value === 'number') return 'number';
    if (value && typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) return 'date';
    return 'string';
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

  // Enhanced method with chart configuration support
  async getEnhancedChartData(query: string, config?: ChartConfig, databaseName?: string): Promise<{
    data: EnhancedChartData[];
    metadata: ChartMetadata;
  }> {
    const result = await this.runSql(query, databaseName);
    
    let dataArray: any[] = [];
    
    // Convert to array format
    if (Array.isArray(result)) {
      dataArray = result;
    } else if (result && 'columns' in result && 'rows' in result) {
      dataArray = result.rows.map(row => {
        const obj: any = {};
        result.columns.forEach((col, index) => {
          obj[col] = row[index];
        });
        return obj;
      });
    }

    const metadata = this.generateChartMetadata(dataArray);
    
    // Process data with configuration
    const enhancedData = dataArray.map(item => {
      const processedItem: EnhancedChartData = { ...item };
      
      // Only add 'name' field for chart types, not tables
      if (config?.chartType && config.chartType !== 'table') {
        // Use configured label key or auto-detect
        const labelKey = config?.xLabel || metadata.labelKey || Object.keys(item)[0];
        let nameValue = String(item[labelKey]);
        
        // Handle month conversion
        if (typeof item[labelKey] === 'number' && item[labelKey] >= 1 && item[labelKey] <= 12 && 
            labelKey.toLowerCase().includes('month')) {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          nameValue = monthNames[item[labelKey] - 1];
        }
        
        // Handle date formatting
        if (typeof item[labelKey] === 'string' && item[labelKey].match(/^\d{4}-\d{2}-\d{2}/)) {
          const date = new Date(item[labelKey]);
          nameValue = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        
        processedItem.name = nameValue;
      }
      
      return processedItem;
    });

    return {
      data: enhancedData,
      metadata: {
        ...metadata,
        // Override with explicit configuration if provided
        labelKey: config?.xLabel || metadata.labelKey,
        dataKey: config?.yLabel || metadata.dataKey
      }
    };
  }
}

export const sqlService = new SqlService();
