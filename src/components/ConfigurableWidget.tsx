
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
      case 'table':
        return { span: 'md:col-span-2', height: 400 }; // Full width for tables on medium screens and up
      case 'pie':
      case 'bar':
      case 'area':
      case 'line':
      default:
        return { span: 'col-span-1', height: 300 }; // Single column on mobile, half width on larger screens
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
      // Always fetch fresh data using SQL query to ensure consistency
      console.log('Fetching fresh data for widget:', widget.title, 'Query:', widget.sqlQuery);
      const result = await sqlService.getChartData(widget.sqlQuery);
      console.log('Fresh data result for', widget.title, ':', result);
      setChartData(result);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Fallback to pre-configured data or passed data
      if (widget.config?.chartData) {
        setChartData(widget.config.chartData);
      } else {
        setChartData(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displayData = chartData.length > 0 ? chartData : data;

  return (
    <Card 
      className={`group transition-all duration-200 ${optimizedLayout.span} ${
        isMaximized ? 'fixed inset-4 z-50 bg-background border-border' : ''
      }`}
      style={{ 
        minHeight: isMaximized ? 'auto' : '400px'
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
      <CardContent className="p-4 pt-0">
        <ChartRenderer
          type={widget.type}
          data={displayData}
          isLoading={isLoading}
          isMaximized={isMaximized}
        />
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
