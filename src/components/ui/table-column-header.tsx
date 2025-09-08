import React from "react";
import { ChevronUp, ChevronDown, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SortDirection = 'asc' | 'desc' | null;

export interface ColumnHeaderProps {
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  sortDirection?: SortDirection;
  hasActiveFilter?: boolean;
  onSort?: () => void;
  onFilterToggle?: () => void;
  onClearFilter?: () => void;
  className?: string;
}

export function TableColumnHeader({
  label,
  sortable = true,
  filterable = true,
  sortDirection,
  hasActiveFilter,
  onSort,
  onFilterToggle,
  onClearFilter,
  className
}: ColumnHeaderProps) {
  return (
    <div className={cn("flex items-center gap-1 group", className)}>
      <span className="text-xs font-medium flex-1 truncate">{label}</span>
      
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {sortable && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 hover:bg-muted"
            onClick={onSort}
          >
            {sortDirection === 'asc' ? (
              <ChevronUp className="h-3 w-3" />
            ) : sortDirection === 'desc' ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <div className="h-3 w-3 flex flex-col justify-center">
                <ChevronUp className="h-1.5 w-3 -mb-0.5" />
                <ChevronDown className="h-1.5 w-3" />
              </div>
            )}
          </Button>
        )}
        
        {filterable && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-5 w-5 p-0 hover:bg-muted",
              hasActiveFilter && "text-primary bg-primary/10"
            )}
            onClick={onFilterToggle}
          >
            <Filter className="h-3 w-3" />
          </Button>
        )}
        
        {hasActiveFilter && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
            onClick={onClearFilter}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}