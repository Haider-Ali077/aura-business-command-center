import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export type FilterType = 'text' | 'number' | 'date';
export type FilterOperator = 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'gt' | 'lt' | 'between' | 'date_range';

export interface FilterConfig {
  operator: FilterOperator;
  value: string | number | Date | null;
  value2?: string | number | Date | null; // For 'between' and 'date_range'
}

export interface FilterDropdownProps {
  type: FilterType;
  config: FilterConfig | null;
  onFilterChange: (config: FilterConfig | null) => void;
  uniqueValues?: (string | number)[];
}

export function FilterDropdown({
  type,
  config,
  onFilterChange,
  uniqueValues = []
}: FilterDropdownProps) {
  const handleOperatorChange = (operator: FilterOperator) => {
    onFilterChange({
      operator,
      value: config?.value || null,
      value2: config?.value2 || null
    });
  };

  const handleValueChange = (value: string | number | Date | null, isSecondValue = false) => {
    if (!config) return;
    
    if (isSecondValue) {
      onFilterChange({
        ...config,
        value2: value
      });
    } else {
      onFilterChange({
        ...config,
        value
      });
    }
  };

  const handleClear = () => {
    onFilterChange(null);
  };

  const getOperatorOptions = () => {
    switch (type) {
      case 'text':
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'equals', label: 'Equals' },
          { value: 'starts_with', label: 'Starts with' },
          { value: 'ends_with', label: 'Ends with' }
        ];
      case 'number':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'gt', label: 'Greater than' },
          { value: 'lt', label: 'Less than' },
          { value: 'between', label: 'Between' }
        ];
      case 'date':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'date_range', label: 'Date range' }
        ];
      default:
        return [];
    }
  };

  const renderValueInput = () => {
    if (!config) return null;

    switch (type) {
      case 'text':
        // If there are limited unique values (< 20), show dropdown
        if (uniqueValues.length > 0 && uniqueValues.length <= 20) {
          return (
            <Select
              value={config.value as string || ''}
              onValueChange={handleValueChange}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select value..." />
              </SelectTrigger>
              <SelectContent>
                {uniqueValues.map((val) => (
                  <SelectItem key={String(val)} value={String(val)}>
                    {String(val)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        return (
          <Input
            placeholder="Enter text..."
            value={(config.value as string) || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            className="h-8"
          />
        );
        
      case 'number':
        return (
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Enter number..."
              value={config.value as string || ''}
              onChange={(e) => handleValueChange(e.target.value ? Number(e.target.value) : null)}
              className="h-8"
            />
            {config.operator === 'between' && (
              <Input
                type="number"
                placeholder="To..."
                value={config.value2 as string || ''}
                onChange={(e) => handleValueChange(e.target.value ? Number(e.target.value) : null, true)}
                className="h-8"
              />
            )}
          </div>
        );
        
      case 'date':
        return (
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-8 justify-start text-left font-normal",
                    !config.value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {config.value ? format(config.value as Date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={config.value as Date}
                    onSelect={(date) => handleValueChange(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
              </PopoverContent>
            </Popover>
            
            {config.operator === 'date_range' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-8 justify-start text-left font-normal",
                      !config.value2 && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {config.value2 ? format(config.value2 as Date, "PPP") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={config.value2 as Date}
                    onSelect={(date) => handleValueChange(date, true)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="p-3 space-y-3 min-w-[200px]">
      <div>
        <label className="text-xs font-medium mb-1 block">Filter by:</label>
        <Select
          value={config?.operator || ''}
          onValueChange={handleOperatorChange}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Select condition..." />
          </SelectTrigger>
          <SelectContent>
            {getOperatorOptions().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {config?.operator && (
        <div>
          <label className="text-xs font-medium mb-1 block">Value:</label>
          {renderValueInput()}
        </div>
      )}
      
      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          variant="outline"
          onClick={handleClear}
          className="h-7 text-xs flex-1"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}