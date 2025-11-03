import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Maximize2, X } from "lucide-react";
import { WidgetConfigDialog } from "./WidgetConfigDialog";
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

interface WidgetHeaderProps {
  widget: Widget;
  timePeriod: string;
  isMaximized: boolean;
  onUpdate: (id: string, updates: Partial<Widget>) => void;
  onRemove: (id: string) => void;
  onToggleMaximize: () => void;
}

export const WidgetHeader = ({
  widget,
  timePeriod,
  isMaximized,
  onUpdate,
  onRemove,
  onToggleMaximize,
}: WidgetHeaderProps) => {
  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/widgets/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: widget.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete widget");
      }

      onRemove(widget.id);
      toast.success("Widget deleted successfully");
    } catch (error) {
      console.error("Error deleting widget:", error);
      toast.error("Failed to delete widget");
    }
  };

  return (
    <div className="flex items-center w-full">
      {/* Title Section */}
      <CardTitle className="text-lg flex items-center gap-2 mr-6">
        {widget.title}
        {widget.config?.timePeriod && (
          <span className="text-sm text-gray-500 ml-1">
            ({timePeriod})
          </span>
        )}
      </CardTitle>

      {/* Spacer to push icons to far right */}
      <div className="flex-1" />

      {/* Icon Section */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" onClick={onToggleMaximize}>
          <Maximize2 className="h-4 w-4" />
        </Button>

        <WidgetConfigDialog widget={widget} onUpdate={onUpdate} />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Widget</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this widget? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
