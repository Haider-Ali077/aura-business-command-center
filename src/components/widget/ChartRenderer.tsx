
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
  
  // Auto-detect the primary data key for charts
  const getDataKey = (data: ChartData[]) => {
    if (data.length === 0) return 'value';
    
    const firstItem = data[0];
    const keys = Object.keys(firstItem).filter(key => key !== 'name');
    
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
  
  const dataKey = getDataKey(data);
  
  // Debug: Log the data structure to console
  console.log('Chart data for debugging:', data);
  console.log('DataKey:', dataKey);
  console.log('First item keys:', data.length > 0 ? Object.keys(data[0]) : 'No data');
  
  switch (type) {
    case 'line':
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
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
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
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
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
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
              data={data.slice(0, 6)}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={Math.min(chartHeight / 3, 100)}
              fill="#8884d8"
              dataKey={dataKey}
            >
              {data.slice(0, 6).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      );
    case 'table':
      return (
        <div className="h-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {data.length > 0 && Object.keys(data[0]).map((key) => (
                  <TableHead key={key} className="text-xs">{key}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  {Object.values(row).map((value, cellIndex) => (
                    <TableCell key={cellIndex} className="text-xs">
                      {typeof value === 'number' ? value.toLocaleString() : String(value)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    default:
      return <div className="h-full flex items-center justify-center text-gray-500">No chart available</div>;
  }
};
