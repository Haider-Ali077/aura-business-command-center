
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Settings, X, Maximize2, GripHorizontal } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { sqlService, ChartData } from "@/services/sqlService";

interface Widget {
  id: string;
  title: string;
  type: string;
  span: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  sqlQuery?: string;
  config?: {
    timePeriod?: string;
    dataSource?: string;
    chartData?: any;
  };
}

interface ConfigurableWidgetProps {
  widget: Widget;
  data: any[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Widget>) => void;
  onMove: (id: string, position: { x: number; y: number }) => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
}

export function ConfigurableWidget({ widget, data, onRemove, onUpdate, onMove, onResize }: ConfigurableWidgetProps) {
  const [configOpen, setConfigOpen] = useState(false);
  const [timePeriod, setTimePeriod] = useState(widget.config?.timePeriod || '6months');
  const [sqlQuery, setSqlQuery] = useState(widget.sqlQuery || '');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (widget.sqlQuery) {
      fetchData();
    } else {
      setChartData(data);
    }
  }, [widget.sqlQuery, data]);

  const fetchData = async () => {
    if (!widget.sqlQuery) return;
    
    setIsLoading(true);
    try {
      const result = await sqlService.getChartData(widget.sqlQuery);
      setChartData(result);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setChartData(data); // Fallback to default data
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigSave = () => {
    onUpdate(widget.id, {
      config: { ...widget.config, timePeriod },
      sqlQuery: sqlQuery
    });
    setConfigOpen(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      const startX = e.clientX;
      const startY = e.clientY;
      const startPosition = { ...widget.position };

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = Math.round((e.clientX - startX) / 320);
        const deltaY = Math.round((e.clientY - startY) / 380);
        
        const newPosition = {
          x: Math.max(0, startPosition.x + deltaX),
          y: Math.max(0, startPosition.y + deltaY)
        };
        
        onMove(widget.id, newPosition);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = { ...widget.size };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      const newSize = {
        width: Math.max(280, startSize.width + deltaX),
        height: Math.max(300, startSize.height + deltaY)
      };
      
      onResize(widget.id, newSize);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const renderChart = () => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
    const chartHeight = isMaximized ? 400 : Math.max(200, widget.size.height - 120);
    const displayData = chartData.length > 0 ? chartData : data;
    
    if (isLoading) {
      return (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    switch (widget.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="customers" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="visits" stackId="1" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={displayData.slice(0, 4)}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={Math.min(chartHeight / 6, 80)}
                fill="#8884d8"
                dataKey="revenue"
              >
                {displayData.slice(0, 4).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return <div className="h-64 flex items-center justify-center text-gray-500">No chart available</div>;
    }
  };

  return (
    <Card 
      className={`group transition-all duration-200 select-none ${
        isMaximized ? 'fixed inset-4 z-50 bg-white dark:bg-gray-800' : ''
      } ${isDragging ? 'opacity-75 z-20' : ''} ${isResizing ? 'z-20' : ''}`}
      style={{
        gridColumn: `${widget.position.x + 1} / span ${widget.span}`,
        gridRow: `${widget.position.y + 1}`,
        width: isMaximized ? 'auto' : `${widget.size.width}px`,
        height: isMaximized ? 'auto' : `${widget.size.height}px`,
        cursor: isDragging ? 'grabbing' : 'auto'
      }}
      onMouseDown={handleMouseDown}
    >
      <CardHeader className="flex flex-row items-center justify-between cursor-grab active:cursor-grabbing">
        <CardTitle className="text-lg flex items-center gap-2">
          <GripHorizontal className="h-4 w-4 text-gray-400" />
          {widget.title}
          {widget.config?.timePeriod && (
            <span className="text-sm text-gray-500 ml-2">({timePeriod})</span>
          )}
        </CardTitle>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsMaximized(!isMaximized);
            }}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Dialog open={configOpen} onOpenChange={setConfigOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure {widget.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">SQL Query</label>
                  <Textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    placeholder="SELECT * FROM your_table"
                    rows={4}
                  />
                </div>
                {widget.title.toLowerCase().includes('revenue') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Time Period</label>
                    <Select value={timePeriod} onValueChange={setTimePeriod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3months">Last 3 Months</SelectItem>
                        <SelectItem value="6months">Last 6 Months</SelectItem>
                        <SelectItem value="1year">Last Year</SelectItem>
                        <SelectItem value="2years">Last 2 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setConfigOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleConfigSave}>
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onRemove(widget.id);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        {renderChart()}
      </CardContent>
      
      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={handleResizeMouseDown}
      >
        <div className="w-full h-full bg-gray-400 transform rotate-45 translate-x-1 translate-y-1"></div>
      </div>
      
      {isMaximized && (
        <div className="absolute top-4 right-4">
          <Button variant="outline" size="sm" onClick={() => setIsMaximized(false)}>
            Close
          </Button>
        </div>
      )}
    </Card>
  );
}
