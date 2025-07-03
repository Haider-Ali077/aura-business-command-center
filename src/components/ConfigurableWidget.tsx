
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, X, Maximize2 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

interface Widget {
  id: string;
  title: string;
  type: string;
  span: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config?: {
    timePeriod?: string;
    dataSource?: string;
  };
}

interface ConfigurableWidgetProps {
  widget: Widget;
  data: any[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Widget>) => void;
}

export function ConfigurableWidget({ widget, data, onRemove, onUpdate }: ConfigurableWidgetProps) {
  const [configOpen, setConfigOpen] = useState(false);
  const [timePeriod, setTimePeriod] = useState(widget.config?.timePeriod || '6months');
  const [isMaximized, setIsMaximized] = useState(false);

  const handleConfigSave = () => {
    onUpdate(widget.id, {
      config: { ...widget.config, timePeriod }
    });
    setConfigOpen(false);
  };

  const renderChart = () => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
    const chartHeight = isMaximized ? 400 : 250;
    
    switch (widget.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={data}>
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
            <BarChart data={data}>
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
            <AreaChart data={data}>
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
                data={data.slice(0, 4)}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={chartHeight / 6}
                fill="#8884d8"
                dataKey="revenue"
              >
                {data.slice(0, 4).map((entry, index) => (
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
      className={`group h-full transition-all duration-200 ${isMaximized ? 'fixed inset-4 z-50 bg-white dark:bg-gray-800' : ''} ${widget.span === 2 ? 'col-span-2' : ''}`}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">
          {widget.title}
          {widget.config?.timePeriod && (
            <span className="text-sm text-gray-500 ml-2">({timePeriod})</span>
          )}
        </CardTitle>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsMaximized(!isMaximized)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Dialog open={configOpen} onOpenChange={setConfigOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure {widget.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
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
          <Button variant="ghost" size="sm" onClick={() => onRemove(widget.id)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {renderChart()}
      </CardContent>
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
