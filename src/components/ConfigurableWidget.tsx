import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sqlService } from "@/services/sqlService";
import { UnifiedChartRenderer } from "./UnifiedChartRenderer";
import { WidgetHeader } from "./widget/WidgetHeader";
import { ChartConfig, ChartMetadata, EnhancedChartData } from "@/types/chart";

interface Widget {
  id: string;
  title: string;
  type: string;
  span: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  sqlQuery?: string;
  tableName?: string;
  config?: {
    timePeriod?: string;
    dataSource?: string;
    chartData?: any;
    chartConfig?: ChartConfig;
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

export function ConfigurableWidget({
  widget,
  data,
  onRemove,
  onUpdate,
  onMove,
  onResize,
}: ConfigurableWidgetProps) {
  const [timePeriod, setTimePeriod] = useState(widget.config?.timePeriod || "6months");
  const [chartData, setChartData] = useState<EnhancedChartData[]>([]);
  const [metadata, setMetadata] = useState<ChartMetadata | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Determine layout by chart type
  const getOptimizedLayout = (type: string) => {
    switch (type) {
      case "table":
        return { span: "md:col-span-2", height: 400 };
      case "doughnut":
      case "bar":
      case "area":
      case "line":
      default:
        return { span: "col-span-1", height: 300 };
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
    if (!widget.sqlQuery) {
      const enhancedData = Array.isArray(data)
        ? data.map((item) => ({
            ...item,
            name: item.name || String(Object.values(item)[0]),
          }))
        : [];
      setChartData(enhancedData);
      return;
    }

    setIsLoading(true);
    try {
      const result = await sqlService.getEnhancedChartData(
        widget.sqlQuery,
        widget.config?.chartConfig
      );
      console.log("Enhanced data result for", widget.title, ":", result);
      setChartData(result.data);
      setMetadata(result.metadata);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      if (widget.config?.chartData) {
        const enhancedData = Array.isArray(widget.config.chartData)
          ? widget.config.chartData.map((item) => ({
              ...item,
              name: item.name || String(Object.values(item)[0]),
            }))
          : [];
        setChartData(enhancedData);
      } else {
        const enhancedData = Array.isArray(data)
          ? data.map((item) => ({
              ...item,
              name: item.name || String(Object.values(item)[0]),
            }))
          : [];
        setChartData(enhancedData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displayData = chartData.length > 0 ? chartData : data;

  return (
    <Card
      className={`group transition-all duration-200 ${optimizedLayout.span} ${
        isMaximized
          ? "fixed inset-4 z-50 bg-background border-border"
          : "min-h-[380px] flex flex-col"
      }`}
      style={isMaximized ? { height: "calc(100vh - 2rem)" } : {}}
    >
      {/* 🔧 Added gap-4 to give space between title and icons */}
      <CardHeader className="flex flex-row items-center justify-between pb-2 gap-4">
        <WidgetHeader
          widget={widget}
          timePeriod={timePeriod}
          isMaximized={isMaximized}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onToggleMaximize={() => setIsMaximized(!isMaximized)}
        />
      </CardHeader>

      <CardContent className="p-3 pt-0 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 w-full min-h-[280px]">
          <UnifiedChartRenderer
            type={widget.type as "line" | "bar" | "area" | "doughnut" | "table"}
            data={displayData}
            config={widget.config?.chartConfig}
            metadata={metadata}
            isLoading={isLoading}
            isMaximized={isMaximized}
            context="dashboard"
            tableName={widget.tableName}
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
