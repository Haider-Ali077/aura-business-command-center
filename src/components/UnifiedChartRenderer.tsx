import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { SortableFilterableTable } from '@/components/ui/sortable-filterable-table';
// select dropdown removed — legend shown inline
import * as XLSX from 'xlsx';
// Layers icon removed
import { EnhancedChartData, ChartConfig, ChartMetadata } from '@/types/chart';
// import { Button } from './ui/button';
import { Button } from '@/components/ui/button';

const DEFAULT_COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1', '#14B8A6', '#F43F5E', '#22C55E', '#A855F7', '#EAB308', '#06B6D4', '#64748B', '#DC2626'];

// Custom tooltip component with better formatting
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom label formatter for Y-axis
const formatYAxisLabel = (value: any) => {
  if (typeof value === 'number') {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  }
  return value;
};

interface UnifiedChartRendererProps {
  type: string;
  data: EnhancedChartData[] | any[];
  config?: ChartConfig | any;
  metadata?: ChartMetadata | any;
  isLoading?: boolean;
  isMaximized?: boolean;
  context?: 'dashboard' | 'chatbot' | string;
  tableName?: string;
}

export const UnifiedChartRenderer = ({ 
  type, 
  data, 
  config, 
  metadata, 
  isLoading = false, 
  isMaximized = false,
  context = 'dashboard',
  tableName
}: UnifiedChartRendererProps) => {
  const chartHeight = isMaximized ? 500 : (context === 'chatbot' ? 200 : 280);
  // Height reserved for the legend area (space below the chart)
  const LEGEND_HEIGHT = 42;
  const chartInnerHeight = Math.max(80, chartHeight - LEGEND_HEIGHT);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  const labelKey = config?.xLabel || metadata?.labelKey || 'name';
  const allKeys = Object.keys(safeData[0] || {});
  const seriesKeys = allKeys.filter((k) => k !== labelKey);
  const effectiveSeriesKeys = config?.dataKeys && config.dataKeys.length ? config.dataKeys : seriesKeys;
  const tableKeys = config?.dataKeys || allKeys;
  const colors = config?.colors || DEFAULT_COLORS;
  const showGrid = config?.showGrid !== false;

  // Hover / pin state for legend interactions
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);
  const [pinnedSeries, setPinnedSeries] = useState<string | null>(null);
  // dropdown/select state removed — legend shown inline

  // <CHANGE> Legend now only appears inside the dropdown
  // New compact in-chart legend (single row) with hover/pin interactions
  const LegendBar = () => (
    // Non-overlapping legend placed below the chart and centered
    <div className="w-full flex justify-center mt-2 pointer-events-auto">
      <div className="bg-background/80 backdrop-blur-sm border border-border rounded-lg px-3 py-1 flex items-center gap-3 justify-center shadow-sm overflow-x-auto">
        {effectiveSeriesKeys.map((key, idx) => {
          const color = colors[idx % colors.length];
          const isPinned = pinnedSeries === key;
          const isHovered = hoveredSeries === key;
          return (
            <div
              key={key}
              onMouseEnter={() => setHoveredSeries(key)}
              onMouseLeave={() => setHoveredSeries((s) => (s === key ? null : s))}
              onClick={() => setPinnedSeries((p) => (p === key ? null : key))}
              className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer select-none ${isPinned || isHovered ? 'ring-1 ring-offset-1' : 'opacity-95'}`}
              title={key}
            >
              <span style={{ width: 12, height: 12, borderRadius: 6, background: color, display: 'inline-block', boxShadow: isPinned ? `0 0 8px ${color}66` : undefined, border: '1px solid rgba(0,0,0,0.08)' }} />
              <span className="text-xs whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{key}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // SeriesSelectOverlay removed — not used since legend is inline

  // Export table rows to a real Excel .xlsx file using SheetJS (xlsx)
  const exportTableToXLSX = (rows: any[], keys: string[], filename?: string) => {
    if (!rows || !rows.length) return;

    // Build a new array of objects preserving order of keys and using headers
    const headerMap = keys;
    const formatted = rows.map((r) => {
      const obj: any = {};
      for (const k of headerMap) {
        obj[k] = (r as any)[k];
      }
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(formatted, { header: headerMap });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    const outName = (filename || 'table') + '-' + Date.now() + '.xlsx';
    XLSX.writeFile(wb, outName);
  }

  // Observe the DOM for any element that has data-maximized="true" so we can
  // hide series overlays on other charts. This runs only on the client.
  // Previously there was code to watch other charts and manage a select overlay.
  // That code was removed because the legend is shown inline below the chart.

  // Clear hover state when the user clicks anywhere on the document
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const onDocClick = () => setHoveredSeries(null);
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  switch (type) {
    case 'line':
      return (
        <div className="relative w-full flex flex-col" style={{ height: chartHeight }} data-maximized={isMaximized ? 'true' : undefined}>
          <div style={{ height: chartInnerHeight }}>
            <ResponsiveContainer width="100%" height={chartInnerHeight}>
              <LineChart data={safeData} margin={{ top: 15, right: 15, left: 15, bottom: 8 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
              <XAxis dataKey={labelKey} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} label={{ value: config?.xLabel, position: 'insideBottom', offset: -5, style: { fontSize: '10px' } }} />
              <YAxis tickFormatter={formatYAxisLabel} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} label={{ value: config?.yLabel, angle: -90, position: 'insideLeft', style: { fontSize: '10px' } }} />
              <Tooltip content={<CustomTooltip />} />
              {effectiveSeriesKeys.map((key, idx) => {
                const color = colors[idx % colors.length];
                const isActive = pinnedSeries ? pinnedSeries === key : (!hoveredSeries || hoveredSeries === key);
                return (
                  <Line key={key} type="monotone" dataKey={key} name={key} stroke={color} strokeWidth={isActive ? (pinnedSeries === key || hoveredSeries === key ? 3 : 2) : 1} strokeOpacity={isActive ? 1 : 0.25} dot={false} />
                );
              })}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <LegendBar />
        </div>
      );

    case 'bar':
      return (
        <div className="relative w-full flex flex-col" style={{ height: chartHeight }} data-maximized={isMaximized ? 'true' : undefined}>
          <div style={{ height: chartInnerHeight }}>
            <ResponsiveContainer width="100%" height={chartInnerHeight}>
              <BarChart data={safeData} margin={{ top: 15, right: 15, left: 15, bottom: 8 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
              <XAxis dataKey={labelKey} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} label={{ value: config?.xLabel, position: 'insideBottom', offset: -5, style: { fontSize: '10px' } }} />
              <YAxis tickFormatter={formatYAxisLabel} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} label={{ value: config?.yLabel, angle: -90, position: 'insideLeft', style: { fontSize: '10px' } }} />
              <Tooltip content={<CustomTooltip />} />
              {effectiveSeriesKeys.map((key, idx) => {
                const color = colors[idx % colors.length];
                const isActive = pinnedSeries ? pinnedSeries === key : (!hoveredSeries || hoveredSeries === key);
                return (
                  <Bar key={key} dataKey={key} name={key} fill={color} radius={[3,3,0,0]} fillOpacity={isActive ? 1 : 0.35} />
                );
              })}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <LegendBar />
        </div>
      );

    case 'area':
      return (
        <div className="relative w-full flex flex-col" style={{ height: chartHeight }} data-maximized={isMaximized ? 'true' : undefined}>
          <div style={{ height: chartInnerHeight }}>
            <ResponsiveContainer width="100%" height={chartInnerHeight}>
              <AreaChart data={safeData} margin={{ top: 15, right: 15, left: 15, bottom: 8 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
              <XAxis dataKey={labelKey} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} label={{ value: config?.xLabel, position: 'insideBottom', offset: -5, style: { fontSize: '10px' } }} />
              <YAxis tickFormatter={formatYAxisLabel} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} label={{ value: config?.yLabel, angle: -90, position: 'insideLeft', style: { fontSize: '10px' } }} />
              <Tooltip content={<CustomTooltip />} />
              {effectiveSeriesKeys.map((key, idx) => {
                const color = colors[idx % colors.length];
                const isActive = pinnedSeries ? pinnedSeries === key : (!hoveredSeries || hoveredSeries === key);
                return (
                  <Area key={key} type="monotone" dataKey={key} name={key} stackId={config?.chartType === 'area' ? '1' : undefined} stroke={color} fill={isActive ? `${color}33` : `${color}22`} strokeOpacity={isActive ? 1 : 0.25} strokeWidth={isActive ? (pinnedSeries ? 2 : 1.5) : 1} />
                );
              })}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <LegendBar />
        </div>
      );

    case 'doughnut':
    case 'pie':
      // Doughnut chart with innerRadius and outerRadius
      // 'pie' is a fallback for legacy data from backend
      return (
        <div className="relative w-full" style={{ height: chartHeight }} data-maximized={isMaximized ? 'true' : undefined}>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie data={safeData} cx="50%" cy="50%" labelLine={false} label={({ payload, percent }) => safeData.length <= 8 ? `${payload[labelKey]} ${(percent * 100).toFixed(0)}%` : percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''} outerRadius="70%" innerRadius="45%" fill="#8884d8" dataKey={effectiveSeriesKeys[0]} nameKey={labelKey}>
                {safeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );

    case 'table':
  return (
    <div
      className="relative w-full flex flex-col gap-2"
      style={{ height: chartHeight }}
      data-maximized={isMaximized ? 'true' : undefined}
    >
      {/* Top bar with Export button */}
      <div className="flex justify-end items-center px-2">
        <Button
          variant='gradient'
          size='sm'
          onClick={() =>
            exportTableToXLSX(
              safeData as any[],
              tableKeys as string[],
              tableName || 'table'
            )
          }
          title="Export table to Excel (.xlsx)"
          className="px-3 py-1.5"
        >
          Export
        </Button>
      </div>

      {/* Actual table component */}
      <div className="flex-1 overflow-hidden">
        <SortableFilterableTable
          data={safeData}
          metadata={metadata}
          tableName={tableName}
          context={context as any}
          maxHeight={chartHeight - 40}
        />
      </div>
    </div>
  );

    default:
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">Unsupported chart type: {type}</div>
      );
  }
};