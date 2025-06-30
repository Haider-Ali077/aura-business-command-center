
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, X, Maximize2, Move } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

interface Widget {
  id: string;
  title: string;
  type: string;
  span: number;
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

  const handleConfigSave = () => {
    onUpdate(widget.id, {
      config: { ...widget.config, timePeriod }
    });
    setConfigOpen(false);
  };

  const renderChart = () => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
    
    switch (widget.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={250}>
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
          <ResponsiveContainer width="100%" height={250}>
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
          <ResponsiveContainer width="100%" height={250}>
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
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.slice(0, 4)}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
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
    <Card className={`${widget.span === 2 ? 'lg:col-span-2' : 'lg:col-span-1'} group`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Move className="h-4 w-4 text-gray-400 cursor-move" />
          {widget.title}
          {widget.config?.timePeriod && (
            <span className="text-sm text-gray-500">({timePeriod})</span>
          )}
        </CardTitle>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm">
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
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}
