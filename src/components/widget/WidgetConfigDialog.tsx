
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { toast } from "sonner";

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
  const [title, setTitle] = useState(widget.title);

  const handleConfigSave = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/widgets/update-title`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: widget.id,
          title: title
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update title');
      }

      onUpdate(widget.id, { title });
      setConfigOpen(false);
      toast.success('Title updated successfully');
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Failed to update title');
    }
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
            <label className="block text-sm font-medium mb-2">Chart Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter chart title"
            />
          </div>
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
