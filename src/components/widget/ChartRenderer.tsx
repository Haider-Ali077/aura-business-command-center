
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { ChartData } from "@/services/sqlService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Custom tooltip component with better formatting
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom label formatter for Y-axis
const formatYAxisLabel = (value: any) => {
  if (typeof value === 'number') {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  }
  return value;
};

interface ChartRendererProps {
  type: string;
  data: ChartData[];
  isLoading: boolean;
  isMaximized: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4'];

export const ChartRenderer = ({ type, data, isLoading, isMaximized }: ChartRendererProps) => {
  // Match default dashboard chart heights - fixed 300px like the rest
  const chartHeight = isMaximized ? 400 : 300;
  
  // Convert numeric month to month name
  const formatMonthData = (data: ChartData[]) => {
    // Safety check: ensure data is an array
    if (!Array.isArray(data)) {
      console.warn('ChartRenderer: data is not an array:', data);
      return [];
    }
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return data.map(item => {
      if (item.month && typeof item.month === 'number') {
        return { ...item, month: monthNames[item.month - 1] || item.month };
      }
      return item;
    });
  };

  // Auto-detect the label key for X-axis (first non-numeric key)
  const getLabelKey = (data: ChartData[]) => {
    if (!Array.isArray(data) || data.length === 0) return 'name';
    
    const firstItem = data[0];
    if (!firstItem || typeof firstItem !== 'object') return 'name';
    
    const keys = Object.keys(firstItem);
    
    // Find the first non-numeric key for labels
    const labelKey = keys.find(key => typeof firstItem[key] !== 'number');
    return labelKey || 'name';
  };
  
  // Auto-detect the primary data key for charts
  const getDataKey = (data: ChartData[]) => {
    if (!Array.isArray(data) || data.length === 0) return 'value';
    
    const firstItem = data[0];
    if (!firstItem || typeof firstItem !== 'object') return 'value';
    
    const keys = Object.keys(firstItem);
    
    // Find the first numeric key, or fall back to 'value'
    const numericKey = keys.find(key => typeof firstItem[key] === 'number');
    return numericKey || keys[0] || 'value';
  };
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Ensure data is an array before processing
  const safeData = Array.isArray(data) ? data : [];
  
  // Format month data before processing
  const formattedData = formatMonthData(safeData);
  const dataKey = getDataKey(formattedData);
  const labelKey = getLabelKey(formattedData);
  
  // Debug: Log the data structure to console
  console.log('Chart data for debugging:', formattedData);
  console.log('DataKey:', dataKey);
  console.log('LabelKey:', labelKey);
  console.log('First item keys:', formattedData.length > 0 ? Object.keys(formattedData[0]) : 'No data');
  
  switch (type) {
    case 'line':
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey={labelKey}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tickFormatter={formatYAxisLabel}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey={labelKey} 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tickFormatter={formatYAxisLabel}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey={dataKey} 
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    case 'area':
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <AreaChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey={labelKey}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tickFormatter={formatYAxisLabel}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stackId="1" 
              stroke="#3B82F6" 
              fill="rgba(59, 130, 246, 0.2)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart>
            <Pie
              data={formattedData.slice(0, 6)}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ payload, percent }) => `${payload[labelKey]} ${(percent * 100).toFixed(0)}%`}
              outerRadius={Math.min(chartHeight / 3, 100)}
              fill="#8884d8"
              dataKey={dataKey}
              nameKey={labelKey}
            >
              {formattedData.slice(0, 6).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      );
    case 'table':
      return (
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className={`overflow-y-auto ${data.length > 8 ? 'max-h-80' : ''}`}>
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  {formattedData.length > 0 && Object.keys(formattedData[0]).map((key) => (
                    <TableHead key={key} className="text-xs px-2 md:px-4">{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {formattedData.map((row, index) => (
                  <TableRow key={index}>
                    {Object.values(row).map((value, cellIndex) => (
                      <TableCell key={cellIndex} className="text-xs px-2 md:px-4">
                        {typeof value === 'number' ? value.toLocaleString() : String(value)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      );
    default:
      return <div className="h-full flex items-center justify-center text-gray-500">No chart available</div>;
  }
};
