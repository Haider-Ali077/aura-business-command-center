
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sqlService, ChartData } from "@/services/sqlService";
import { ChartRenderer } from "./widget/ChartRenderer";
import { WidgetHeader } from "./widget/WidgetHeader";

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
  const [timePeriod, setTimePeriod] = useState(widget.config?.timePeriod || '6months');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Get optimized layout for different chart types
  const getOptimizedLayout = (type: string) => {
    switch (type) {
      case 'pie':
        return { span: 1, height: 300 };
      case 'table':
        return { span: 2, height: 400 };
      case 'line':
      case 'area':
        return { span: 2, height: 320 };
      case 'bar':
        return { span: 1, height: 320 };
      default:
        return { span: 1, height: 300 };
    }
  };
  
  const optimizedLayout = getOptimizedLayout(widget.type);

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
      // Use chart data from widget config if available, otherwise fetch fresh data
      if (widget.config?.chartData) {
        setChartData(widget.config.chartData);
      } else {
        const result = await sqlService.getChartData(widget.sqlQuery);
        setChartData(result);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setChartData(data);
    } finally {
      setIsLoading(false);
    }
  };

  const displayData = chartData.length > 0 ? chartData : data;

  return (
    <Card 
      className={`h-full w-full group transition-all duration-200 ${
        isMaximized ? 'fixed inset-4 z-50 bg-background border-border' : ''
      }`}
      style={{ 
        height: isMaximized ? 'auto' : `${optimizedLayout.height}px`,
        gridColumn: `span ${optimizedLayout.span}`
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <WidgetHeader
          widget={widget}
          timePeriod={timePeriod}
          isMaximized={isMaximized}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onToggleMaximize={() => setIsMaximized(!isMaximized)}
        />
      </CardHeader>
      <CardContent className="flex-1 p-4 pt-0 h-full">
        <div className="h-full">
          <ChartRenderer
            type={widget.type}
            data={displayData}
            isLoading={isLoading}
            isMaximized={isMaximized}
          />
        </div>
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
