
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Settings } from "lucide-react";

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

interface WidgetConfigDialogProps {
  widget: Widget;
  onUpdate: (id: string, updates: Partial<Widget>) => void;
}

export const WidgetConfigDialog = ({ widget, onUpdate }: WidgetConfigDialogProps) => {
  const [configOpen, setConfigOpen] = useState(false);
  const [timePeriod, setTimePeriod] = useState(widget.config?.timePeriod || '6months');
  const [sqlQuery, setSqlQuery] = useState(widget.sqlQuery || '');

  const handleConfigSave = () => {
    onUpdate(widget.id, {
      config: { ...widget.config, timePeriod },
      sqlQuery: sqlQuery
    });
    setConfigOpen(false);
  };

  return (
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
  );
};
