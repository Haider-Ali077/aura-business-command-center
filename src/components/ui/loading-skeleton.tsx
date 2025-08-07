import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'chart' | 'kpi' | 'table';
  count?: number;
}

export function LoadingSkeleton({ className, variant = 'card', count = 1 }: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count });

  if (variant === 'kpi') {
    return (
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        {skeletons.map((_, index) => (
          <div key={index} className="bg-card border rounded-lg p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
              <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="h-8 bg-muted rounded animate-pulse w-32 mb-2"></div>
            <div className="h-3 bg-muted rounded animate-pulse w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {skeletons.map((_, index) => (
          <div key={index} className="bg-card border rounded-lg p-6 animate-fade-in">
            <div className="h-6 bg-muted rounded animate-pulse w-48 mb-4"></div>
            <div className="h-64 bg-muted rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="bg-card border rounded-lg p-6 animate-fade-in">
        <div className="h-6 bg-muted rounded animate-pulse w-48 mb-4"></div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex space-x-4">
              <div className="h-4 bg-muted rounded animate-pulse flex-1"></div>
              <div className="h-4 bg-muted rounded animate-pulse w-20"></div>
              <div className="h-4 bg-muted rounded animate-pulse w-16"></div>
              <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {skeletons.map((_, index) => (
        <div key={index} className="bg-card border rounded-lg p-6 animate-fade-in">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ className, size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn("animate-spin rounded-full border-2 border-primary border-t-transparent", sizeClasses[size], className)} />
  );
}

export function LoadingOverlay({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm animate-fade-in">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground animate-pulse">Loading data...</p>
        </div>
      </div>
    </div>
  );
}