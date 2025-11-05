import React, { useState, useEffect } from 'react';
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
  // Responsive maximized height: base on viewport so maximize doesn't get cut off
  const [maximizedHeight, setMaximizedHeight] = useState<number>(500);
  useEffect(() => {
    if (!isMaximized) return;
    const compute = () => {
      if (typeof window === 'undefined') return;
      // Reserve space for modal header/footer and some padding (approx 180px)
      const h = Math.max(300, Math.min(900, window.innerHeight - 180));
      setMaximizedHeight(h);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [isMaximized]);

  const chartHeight = isMaximized ? maximizedHeight : (context === 'chatbot' ? 200 : 280);
  // Height reserved for the legend area (space below the chart)
  const LEGEND_HEIGHT = 42;
  // Keep chart full height; allocate extra outer height to fit legend below
  const chartInnerHeight = Math.max(80, chartHeight);
  const outerHeight = chartHeight + LEGEND_HEIGHT;

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

  // Determine the key used for X axis labels. Chatbot chart conversion often
  // populates a `name` property while `config.xLabel` contains a human label
  // like "Month". Prefer an actual existing key on the data (e.g. 'name'),
  // then fall back to config.xLabel, metadata, or the first available key.
  const firstRowKeys = Object.keys(safeData[0] || {});
  let labelKey: string;
  if (firstRowKeys.includes('name')) {
    labelKey = 'name';
  } else if (config?.xLabel && firstRowKeys.includes(config.xLabel)) {
    labelKey = config.xLabel;
  } else if (metadata?.labelKey && firstRowKeys.includes(metadata.labelKey)) {
    labelKey = metadata.labelKey;
  } else if (firstRowKeys.length > 0) {
    // Prefer the first key that looks like a label (string values in the first row)
    labelKey = firstRowKeys[0];
  } else {
    labelKey = 'name';
  }
  const allKeys = firstRowKeys;
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
  const LegendBar = ({ top }: { top?: boolean } = {}) => (
    // Legend placed above or below the chart and centered. When `top` is true,
    // add bottom margin instead of top margin so it doesn't overlap the chart.
    <div className={`w-full flex justify-center pointer-events-auto ${top ? 'mb-2' : 'mt-2'}`}>
      <div className="px-1 py-0 flex items-center gap-3 justify-center overflow-x-auto">
        {effectiveSeriesKeys.map((key, idx) => {
          const color = colors[idx % colors.length];
          const isPinned = pinnedSeries === key;
          const isHovered = hoveredSeries === key;
          return (
            <div
              key={key}
              onMouseEnter={() => setHoveredSeries(key)}
              onMouseLeave={() => setHoveredSeries((s) => (s === key ? null : s))}
              onClick={(e) => { e.stopPropagation(); setPinnedSeries((p) => (p === key ? null : key)); }}
              className={`flex items-center gap-2 px-2 py-0 cursor-pointer select-none ${isPinned || isHovered ? 'ring-1 ring-offset-1' : 'opacity-95'}`}
              title={key}
            >
              <span style={{ width: 12, height: 12, borderRadius: 6, background: color, display: 'inline-block', boxShadow: isPinned ? `0 0 8px ${color}66` : undefined }} />
              <span className="text-xs whitespace-nowrap ml-1" style={{ color: 'var(--muted-foreground)' }}>{key}</span>
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

  // extra margin at top for chatbot context so overlay icons placed in the
  // container header don't overlap the plotting grid. When maximized, use
  // the tighter margin to avoid extra clipping.
  const chartMarginTop = context === 'chatbot' && !isMaximized ? 28 : 15;
  switch (type) {
    case 'line':
      return (
        <div className="relative w-full flex flex-col" style={{ height: outerHeight }} data-maximized={isMaximized ? 'true' : undefined}>
          {/* If maximized, render legend at top to avoid it being cut off at the bottom */}
          {isMaximized && <LegendBar top />}
          <div style={{ height: chartInnerHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={safeData} margin={{ top: chartMarginTop, right: 15, left: 15, bottom: 8 }}>
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
          {context !== 'chatbot' && !isMaximized && <LegendBar />}
        </div>
      );

    case 'bar':
      return (
        <div className="relative w-full flex flex-col" style={{ height: outerHeight }} data-maximized={isMaximized ? 'true' : undefined}>
          {isMaximized && <LegendBar top />}
          <div style={{ height: chartInnerHeight }}>
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safeData} margin={{ top: chartMarginTop, right: 15, left: 15, bottom: 8 }}>
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
          {context !== 'chatbot' && !isMaximized && <LegendBar />}
        </div>
      );

    case 'area':
      return (
        <div className="relative w-full flex flex-col" style={{ height: outerHeight }} data-maximized={isMaximized ? 'true' : undefined}>
          {isMaximized && <LegendBar top />}
          <div style={{ height: chartInnerHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={safeData} margin={{ top: chartMarginTop, right: 15, left: 15, bottom: 8 }}>
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
          {context !== 'chatbot' && !isMaximized && <LegendBar />}
        </div>
      );

   case "doughnut":
case "pie": {
  const valueKey = effectiveSeriesKeys[0];

  // ✅ Keep original data (no aggregation)
  const finalData = safeData;

  const total = finalData.reduce(
    (s, r) => s + Number((r as any)[valueKey] || 0),
    0
  );

  // ✅ Responsive radius + label font scaling
  const getResponsiveSettings = () => {
    const width = window.innerWidth;
    if (width >= 1400)
      return { outer: "65%", inner: "45%", font: 16, offset: 20 };
    if (width >= 1024)
      return { outer: "60%", inner: "42%", font: 14, offset: 18 };
    if (width >= 768)
      return { outer: "55%", inner: "38%", font: 12, offset: 15 };
    return { outer: "52%", inner: "35%", font: 10, offset: 10 };
  };

  const { outer, inner, font, offset } = getResponsiveSettings();

  // ✅ Simple scrollable legend - no refs, no effects, just pure HTML scrolling
  const legendHeight = Math.min(chartHeight - 40, 300);
  const legendItems = finalData.map((entry: any, idx: number) => {
    const label = entry[labelKey];
    const color = colors[idx % colors.length];
    const isPinned = pinnedSeries === String(label);
    const isHovered = hoveredSeries === String(label);
    const isActive = pinnedSeries ? isPinned : !hoveredSeries || isHovered;

    return (
      <div
        key={`legend-${idx}`}
        onMouseEnter={() => setHoveredSeries(String(label))}
        onMouseLeave={() => setHoveredSeries((s) => (s === String(label) ? null : s))}
        onClick={(e) => {
          e.stopPropagation();
          setPinnedSeries((p) => (p === String(label) ? null : String(label)));
        }}
        className={`flex items-center gap-3 py-2 px-1 cursor-pointer select-none transition-all ${
          isActive ? "bg-muted/10 rounded-lg" : "opacity-90"
        } hover:bg-muted/20`}
        title={String(label)}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            background: color,
            display: "inline-block",
            boxShadow: isPinned ? `0 0 8px ${color}66` : undefined,
            flexShrink: 0,
          }}
        />
        <span className="text-sm truncate">{label}</span>
      </div>
    );
  });

  // ✅ Hide label % on chart if <5%
  const renderOutsideLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    index,
  }: any) => {
    if (percent < 0.05) return null;

    const RADIAN = Math.PI / 180;
    const radius = outerRadius + offset;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const color = colors[index % colors.length];

    return (
      <text
        x={x}
        y={y}
        fill={color}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={font}
        fontWeight={500}
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  return (
    <div
      className="relative w-full"
      style={{ height: chartHeight }}
      data-maximized={isMaximized ? "true" : undefined}
    >
      <div className="flex h-full items-center justify-between gap-2">
        <div
          className="flex-1 flex items-center justify-center"
          style={{ minWidth: 0 }}
        >
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={finalData}
                cx="50%"
                cy="50%"
                label={renderOutsideLabel}
                labelLine={false}
                outerRadius={outer}
                innerRadius={inner}
                dataKey={valueKey}
                nameKey={labelKey}
                isAnimationActive={false}
                paddingAngle={2}
              >
                {finalData.map((entry, index) => {
                  const label = entry[labelKey];
                  const color = colors[index % colors.length];
                  const isPinned = pinnedSeries === String(label);
                  const isHovered = hoveredSeries === String(label);
                  const isActive = pinnedSeries
                    ? isPinned
                    : !hoveredSeries || isHovered;

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={color}
                      stroke={isActive ? "#00000022" : undefined}
                      strokeWidth={isActive ? 2 : 0}
                      fillOpacity={isActive ? 1 : 0.6}
                      onMouseEnter={() => setHoveredSeries(String(label))}
                      onMouseLeave={() =>
                        setHoveredSeries((s) =>
                          s === String(label) ? null : s
                        )
                      }
                      onClick={(e: any) => {
                        e.stopPropagation();
                        setPinnedSeries((p) =>
                          p === String(label) ? null : String(label)
                        );
                      }}
                    />
                  );
                })}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {(context !== "chatbot" &&
          (isMaximized || context === "dashboard")) && (
          <div className="w-52 pl-4 flex flex-col overflow-hidden" style={{ height: legendHeight }}>
            <div className="h-full overflow-auto pr-2">
              {legendItems}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

    case 'table':
  return (
    <div
      className="relative w-full flex flex-col gap-2"
      style={{ height: chartHeight }}
      data-maximized={isMaximized ? 'true' : undefined}
    >
      {/* Top bar with Export button - positioned to avoid overlap with maximize button in chatbot */}
      <div className={`flex items-center px-2 ${context === 'chatbot' ? 'justify-start pr-12' : 'justify-end'}`}>
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