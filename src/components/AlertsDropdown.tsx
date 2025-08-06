import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useRoleStore } from '@/store/roleStore';
import { DashboardAlerts } from './DashboardAlerts';

export function AlertsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { getAccessibleModules } = useRoleStore();
  const accessibleModules = getAccessibleModules();

  // Get all alerts for accessible dashboards
  const getAllAlerts = () => {
    const alertsByDashboard = {
      finance: [
        {
          id: 'overdue-payments',
          type: 'warning' as const,
          title: 'Overdue Payments',
          description: '5 invoices totaling $12,450 are overdue by more than 30 days',
          dashboard: 'Finance'
        },
        {
          id: 'budget-variance',
          type: 'error' as const,
          title: 'Budget Variance',
          description: 'Marketing department has exceeded budget by 15% this quarter',
          dashboard: 'Finance'
        }
      ],
      inventory: [
        {
          id: 'low-stock',
          type: 'warning' as const,
          title: 'Low Stock Alert',
          description: '8 items are below minimum stock levels and need reordering',
          dashboard: 'Inventory'
        },
        {
          id: 'expired-items',
          type: 'error' as const,
          title: 'Expired Inventory',
          description: '3 items have expired and need immediate attention',
          dashboard: 'Inventory'
        }
      ],
      sales: [
        {
          id: 'quota-miss',
          type: 'warning' as const,
          title: 'Sales Target',
          description: 'Q4 sales are 12% below target with 2 weeks remaining',
          dashboard: 'Sales'
        }
      ],
      hr: [
        {
          id: 'pending-reviews',
          type: 'info' as const,
          title: 'Pending Reviews',
          description: '7 performance reviews are overdue and need completion',
          dashboard: 'HR'
        }
      ],
      executive: [
        {
          id: 'cash-flow',
          type: 'warning' as const,
          title: 'Cash Flow Alert',
          description: 'Cash flow projection shows potential shortage in 45 days',
          dashboard: 'Executive'
        },
        {
          id: 'kpi-variance',
          type: 'error' as const,
          title: 'KPI Performance',
          description: '3 key metrics are trending below target ranges',
          dashboard: 'Executive'
        }
      ]
    };

    const userAlerts: any[] = [];
    accessibleModules.forEach(module => {
      const moduleAlerts = alertsByDashboard[module.id as keyof typeof alertsByDashboard] || [];
      userAlerts.push(...moduleAlerts);
    });

    return userAlerts;
  };

  const alerts = getAllAlerts();
  const unreadCount = alerts.length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return '🔴';
      case 'warning':
        return '🟡';
      case 'info':
        return '🔵';
      default:
        return '⚪';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <p className="text-sm text-gray-500">{unreadCount} new alerts</p>
          </div>
          
          {alerts.length > 0 ? (
            <div className="py-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{getAlertIcon(alert.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 text-sm">{alert.title}</p>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {alert.dashboard}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No new alerts</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}