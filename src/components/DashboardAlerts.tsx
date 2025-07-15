import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, AlertCircle, TrendingDown, Clock } from "lucide-react";

interface AlertItem {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface DashboardAlertsProps {
  dashboardType: 'executive' | 'finance' | 'sales' | 'inventory' | 'hr';
}

const alertsByDashboard = {
  finance: [
    {
      id: 'overdue-payments',
      type: 'warning' as const,
      title: 'Overdue Payments',
      description: '5 invoices totaling $12,450 are overdue by more than 30 days',
      icon: <Clock className="h-4 w-4" />
    },
    {
      id: 'budget-variance',
      type: 'error' as const,
      title: 'Budget Variance',
      description: 'Marketing department has exceeded budget by 15% this quarter',
      icon: <TrendingDown className="h-4 w-4" />
    }
  ],
  inventory: [
    {
      id: 'low-stock',
      type: 'warning' as const,
      title: 'Low Stock Alert',
      description: '8 items are below minimum stock levels and need reordering',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      id: 'expired-items',
      type: 'error' as const,
      title: 'Expired Inventory',
      description: '3 items have expired and need immediate attention',
      icon: <AlertCircle className="h-4 w-4" />
    }
  ],
  sales: [
    {
      id: 'quota-miss',
      type: 'warning' as const,
      title: 'Sales Target',
      description: 'Q4 sales are 12% below target with 2 weeks remaining',
      icon: <TrendingDown className="h-4 w-4" />
    }
  ],
  hr: [
    {
      id: 'pending-reviews',
      type: 'info' as const,
      title: 'Pending Reviews',
      description: '7 performance reviews are overdue and need completion',
      icon: <Clock className="h-4 w-4" />
    }
  ],
  executive: [
    {
      id: 'cash-flow',
      type: 'warning' as const,
      title: 'Cash Flow Alert',
      description: 'Cash flow projection shows potential shortage in 45 days',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      id: 'kpi-variance',
      type: 'error' as const,
      title: 'KPI Performance',
      description: '3 key metrics are trending below target ranges',
      icon: <TrendingDown className="h-4 w-4" />
    }
  ]
};

export function DashboardAlerts({ dashboardType }: DashboardAlertsProps) {
  const alerts = alertsByDashboard[dashboardType] || [];

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            variant={alert.type === 'error' ? 'destructive' : 'default'}
            className="border-l-4 border-l-orange-500"
          >
            {alert.icon}
            <AlertTitle className="flex items-center gap-2">
              {alert.title}
            </AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
          </Alert>
        ))}
      </div>
    </div>
  );
}