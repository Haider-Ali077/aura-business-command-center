import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableColumnHeader, type SortDirection } from "./table-column-header";
import { FilterDropdown, type FilterConfig, type FilterType } from "./table-filters";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChartMetadata } from "@/types/chart";

interface SortConfig {
  key: string;
  direction: SortDirection;
}

interface ColumnFilter {
  key: string;
  config: FilterConfig;
}

export interface SortableFilterableTableProps {
  data: any[];
  metadata?: ChartMetadata;
  tableName?: string;
  context?: 'dashboard' | 'chatbot';
  className?: string;
  maxHeight?: string | number;
}

export function SortableFilterableTable({
  data,
  metadata,
  tableName,
  context,
  className,
  maxHeight = "400px"
}: SortableFilterableTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filters, setFilters] = useState<ColumnFilter[]>([]);
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null);

  // Get table keys (column names)
  const tableKeys = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (metadata?.columns) {
      return metadata.columns.map(col => col.key);
    }
    return Object.keys(data[0] || {});
  }, [data, metadata]);

  // Get column type for filtering
  const getColumnType = (key: string): FilterType => {
    if (metadata?.columns) {
      const column = metadata.columns.find(col => col.key === key);
      if (column) {
        switch (column.type) {
          case 'number': return 'number';
          case 'date': return 'date';
          default: return 'text';
        }
      }
    }
    
    // Infer type from data
    const sampleValue = data.find(row => row[key] != null)?.[key];
    if (typeof sampleValue === 'number') return 'number';
    if (sampleValue instanceof Date) return 'date';
    if (typeof sampleValue === 'string' && !isNaN(Date.parse(sampleValue))) return 'date';
    return 'text';
  };

  // Get unique values for a column (for dropdown filters)
  const getUniqueValues = (key: string) => {
    const values = [...new Set(data.map(row => row[key]).filter(val => val != null))];
    return values.slice(0, 20); // Limit to 20 for performance
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bVal == null) return sortConfig.direction === 'asc' ? 1 : -1;
      
      // Handle different data types
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortConfig.direction === 'asc' 
          ? aVal.getTime() - bVal.getTime() 
          : bVal.getTime() - aVal.getTime();
      }
      
      // String comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [data, sortConfig]);

  // Filter data
  const filteredData = useMemo(() => {
    if (filters.length === 0) return sortedData;
    
    return sortedData.filter(row => {
      return filters.every(filter => {
        const value = row[filter.key];
        const { operator, value: filterValue, value2 } = filter.config;
        
        if (value == null) return false;
        
        switch (operator) {
          case 'contains':
            return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
          case 'equals':
            return String(value).toLowerCase() === String(filterValue).toLowerCase();
          case 'starts_with':
            return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
          case 'ends_with':
            return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
          case 'gt':
            return Number(value) > Number(filterValue);
          case 'lt':
            return Number(value) < Number(filterValue);
          case 'between':
            return Number(value) >= Number(filterValue) && Number(value) <= Number(value2);
          case 'date_range':
            const dateValue = new Date(value);
            const startDate = new Date(filterValue as Date);
            const endDate = new Date(value2 as Date);
            return dateValue >= startDate && dateValue <= endDate;
          default:
            return true;
        }
      });
    });
  }, [sortedData, filters]);

  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      if (current.direction === 'desc') {
        return null; // Reset to no sort
      }
      return { key, direction: 'asc' };
    });
  };

  // Handle filtering
  const handleFilter = (key: string, config: FilterConfig | null) => {
    setFilters(current => {
      const filtered = current.filter(f => f.key !== key);
      if (config) {
        return [...filtered, { key, config }];
      }
      return filtered;
    });
  };

  // Format cell value
  const formatCellValue = (value: any, key: string) => {
    if (value == null) return '';
    
    if (typeof value === 'number') {
      // Check if it looks like a year
      if (key.toLowerCase().includes('year') || 
          (value >= 1900 && value <= 2100 && value % 1 === 0)) {
        return value.toString();
      }
      return value.toLocaleString();
    }
    
    return String(value);
  };

  const getColumnLabel = (key: string) => {
    return metadata?.columns.find(col => col.key === key)?.label || key;
  };

  const hasActiveFilter = (key: string) => {
    return filters.some(f => f.key === key);
  };

  const getActiveFilter = (key: string) => {
    return filters.find(f => f.key === key)?.config || null;
  };

  return (
    <div className="h-full w-full overflow-hidden" style={{ maxHeight }}>
      {tableName && context !== 'chatbot' && (
        <div className="mb-2 px-2 py-1 bg-muted/50 rounded-t-md border-b">
          <h4 className="text-sm font-medium text-foreground truncate">{tableName}</h4>
        </div>
      )}
      <div className="h-full overflow-auto">
        <Table className="min-w-full">
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              {tableKeys.map((key) => (
                <TableHead key={key} className="text-xs px-2 py-1">
                  <DropdownMenu 
                    open={openFilterKey === key}
                    onOpenChange={(open) => setOpenFilterKey(open ? key : null)}
                  >
                    <DropdownMenuTrigger asChild>
                      <div className="cursor-pointer">
                        <TableColumnHeader
                          label={getColumnLabel(key)}
                          sortDirection={sortConfig?.key === key ? sortConfig.direction : null}
                          hasActiveFilter={hasActiveFilter(key)}
                          onSort={() => handleSort(key)}
                          onFilterToggle={() => setOpenFilterKey(openFilterKey === key ? null : key)}
                          onClearFilter={() => handleFilter(key, null)}
                        />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="p-0">
                      <FilterDropdown
                        type={getColumnType(key)}
                        config={getActiveFilter(key)}
                        onFilterChange={(config) => handleFilter(key, config)}
                        uniqueValues={getUniqueValues(key)}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row, index) => (
              <TableRow key={index}>
                {tableKeys.map((key, cellIndex) => (
                  <TableCell key={cellIndex} className="text-xs px-2 py-1">
                    {formatCellValue(row[key], key)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredData.length === 0 && data.length > 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No results match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}