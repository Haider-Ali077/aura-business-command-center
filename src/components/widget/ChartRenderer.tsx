
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { ChartData } from "@/services/sqlService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ChartRendererProps {
  type: string;
  data: ChartData[];
  isLoading: boolean;
  isMaximized: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const ChartRenderer = ({ type, data, isLoading, isMaximized }: ChartRendererProps) => {
  const chartHeight = isMaximized ? 400 : 250;
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  switch (type) {
    case 'line':
      const lineDataKey = data.length > 0 ? Object.keys(data[0]).find(key => key !== 'name') || 'value' : 'value';
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey={lineDataKey} stroke="#3B82F6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      );
    case 'bar':
      const barDataKey = data.length > 0 ? Object.keys(data[0]).find(key => key !== 'name') || 'value' : 'value';
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey={barDataKey} fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      );
    case 'area':
      const areaDataKey = data.length > 0 ? Object.keys(data[0]).find(key => key !== 'name') || 'value' : 'value';
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey={areaDataKey} stackId="1" stroke="#8884d8" fill="#8884d8" />
          </AreaChart>
        </ResponsiveContainer>
      );
    case 'pie':
      const pieDataKey = data.length > 0 ? Object.keys(data[0]).find(key => key !== 'name') || 'value' : 'value';
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart>
            <Pie
              data={data.slice(0, 8)}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={Math.min(chartHeight / 4, 80)}
              fill="#8884d8"
              dataKey={pieDataKey}
            >
              {data.slice(0, 8).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
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
