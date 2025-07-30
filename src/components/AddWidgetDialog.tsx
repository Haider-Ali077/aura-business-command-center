import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, BarChart3, LineChart, PieChart, AreaChart } from "lucide-react";
import { useRoleStore } from "@/store/roleStore";
import { useAuthStore } from "@/store/authStore";

const availableWidgets = [
  { id: 'revenue', title: 'Revenue Trends', type: 'line', icon: LineChart, description: 'Track revenue over time' },
  { id: 'customers', title: 'Customer Growth', type: 'bar', icon: BarChart3, description: 'Monitor customer acquisition' },
  { id: 'traffic', title: 'Website Traffic', type: 'area', icon: AreaChart, description: 'Analyze website visits' },
  { id: 'orders', title: 'Order Volume', type: 'bar', icon: BarChart3, description: 'Track order statistics' },
  { id: 'conversion', title: 'Conversion Rate', type: 'line', icon: LineChart, description: 'Monitor conversion metrics' },
  { id: 'performance', title: 'Performance Metrics', type: 'pie', icon: PieChart, description: 'Overall performance data' },
];

interface AddWidgetDialogProps {
  onAddWidget: (widget: { id: string; title: string; type: string; span: number }, dashboard: string) => void;
}

export function AddWidgetDialog({ onAddWidget }: AddWidgetDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<string>("");
  const { getAccessibleModules } = useRoleStore();
  const { session } = useAuthStore();
  
  const accessibleModules = getAccessibleModules();

  const handleAddWidget = (widget: typeof availableWidgets[0]) => {
    if (!selectedDashboard) return;
    
    onAddWidget({
      id: Date.now().toString(),
      title: widget.title,
      type: widget.type,
      span: 1
    }, selectedDashboard);
    setOpen(false);
    setSelectedDashboard("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Widget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select Dashboard</label>
            <Select value={selectedDashboard} onValueChange={setSelectedDashboard}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a dashboard" />
              </SelectTrigger>
              <SelectContent>
                {accessibleModules.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {availableWidgets.map((widget) => (
              <Card 
                key={widget.id} 
                className={`hover:shadow-md transition-shadow cursor-pointer ${!selectedDashboard ? 'opacity-50 cursor-not-allowed' : ''}`} 
                onClick={() => selectedDashboard && handleAddWidget(widget)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <widget.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{widget.title}</h3>
                      <p className="text-xs text-gray-500">{widget.description}</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full" disabled={!selectedDashboard}>
                    Add Widget
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}