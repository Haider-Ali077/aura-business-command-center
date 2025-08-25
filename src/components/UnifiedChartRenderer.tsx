import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EnhancedChartData, ChartConfig, ChartMetadata } from '@/types/chart';

// Custom tooltip component with better formatting
const CustomTooltip = ({ active, payload, label, config }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground">
          {config?.xLabel || 'Label'}: {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${config?.yLabel || entry.name}: ${typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}`}
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

interface UnifiedChartRendererProps {
  type: 'line' | 'bar' | 'area' | 'pie' | 'table';
  data: EnhancedChartData[];
  config?: ChartConfig;
  metadata?: ChartMetadata;
  isLoading?: boolean;
  isMaximized?: boolean;
}

const DEFAULT_COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4'];

export const UnifiedChartRenderer = ({ 
  type, 
  data, 
  config, 
  metadata, 
  isLoading = false, 
  isMaximized = false 
}: UnifiedChartRendererProps) => {
  const chartHeight = isMaximized ? 400 : 200;
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : [];
  
  if (safeData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  // Determine keys to use for charts
  const labelKey = config?.xLabel || metadata?.labelKey || 'name';
  const dataKey = config?.yLabel || metadata?.dataKey || 'value';
  
  // For tables, use configured keys or all available keys
  const tableKeys = config?.dataKeys || Object.keys(safeData[0]);
  
  const colors = config?.colors || DEFAULT_COLORS;
  const showGrid = config?.showGrid !== false; // Default to true
  
  console.log('UnifiedChartRenderer:', { type, labelKey, dataKey, tableKeys, dataLength: safeData.length });

  switch (type) {
    case 'line':
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart data={safeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis 
              dataKey={labelKey}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              label={{ value: config?.xLabel, position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              tickFormatter={formatYAxisLabel}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              label={{ value: config?.yLabel, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip config={config} />} />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={colors[0]} 
              strokeWidth={3}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );

    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={safeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis 
              dataKey={labelKey} 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              label={{ value: config?.xLabel, position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              tickFormatter={formatYAxisLabel}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              label={{ value: config?.yLabel, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip config={config} />} />
            <Bar 
              dataKey={dataKey} 
              fill={colors[0]}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      );

    case 'area':
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <AreaChart data={safeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis 
              dataKey={labelKey}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              label={{ value: config?.xLabel, position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              tickFormatter={formatYAxisLabel}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              label={{ value: config?.yLabel, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip config={config} />} />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stackId="1" 
              stroke={colors[0]} 
              fill={`${colors[0]}20`}
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
              data={safeData.slice(0, 6)}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ payload, percent }) => `${payload[labelKey]} ${(percent * 100).toFixed(0)}%`}
              outerRadius={Math.min(chartHeight / 3, 100)}
              fill="#8884d8"
              dataKey={dataKey}
              nameKey={labelKey}
            >
              {safeData.slice(0, 6).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip config={config} />} />
          </PieChart>
        </ResponsiveContainer>
      );

    case 'table':
      return (
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className={`overflow-y-auto ${safeData.length > 8 ? 'max-h-80' : ''}`}>
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  {tableKeys.map((key) => (
                    <TableHead key={key} className="text-xs px-2 md:px-4">
                      {metadata?.columns.find(col => col.key === key)?.label || key}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeData.map((row, index) => (
                  <TableRow key={index}>
                    {tableKeys.map((key, cellIndex) => (
                      <TableCell key={cellIndex} className="text-xs px-2 md:px-4">
                        {typeof row[key] === 'number' ? row[key].toLocaleString() : String(row[key] || '')}
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
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Unsupported chart type: {type}
        </div>
      );
  }
};