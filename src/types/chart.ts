// Enhanced chart types for unified rendering across chatbot and dashboard

export interface ChartConfig {
  xLabel?: string;
  yLabel?: string;
  dataKeys?: string[]; // For tables with multiple columns
  chartType?: 'line' | 'bar' | 'area' | 'doughnut' | 'table';
  colors?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
}

export interface EnhancedChartData {
  name: string;
  [key: string]: any;
}

export interface ChartMetadata {
  columns: Array<{
    key: string;
    label: string;
    type: 'string' | 'number' | 'date';
  }>;
  dataKey?: string; // Primary numeric field for charts
  labelKey?: string; // Primary label field for charts
}

export interface SqlResult {
  columns: string[];
  rows: any[][];
  metadata?: ChartMetadata;
}