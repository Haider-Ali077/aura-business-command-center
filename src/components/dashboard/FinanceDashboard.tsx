import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, CreditCard, PiggyBank, Calculator, Calendar, RefreshCw } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useWidgetStore } from "@/store/widgetStore";
import { useAuthStore } from "@/store/authStore";
import { ConfigurableWidget } from "@/components/ConfigurableWidget";
import { API_BASE_URL } from "@/config/api";

interface FinanceMetric {
  title: string;
  value: string;
  change: number | null;
  icon: any;
  color: string;
}

interface ChartData {
  name?: string;
  [key: string]: any;
}

export function FinanceDashboard() {
  const [metrics, setMetrics] = useState<FinanceMetric[]>([]);
  const [cashFlowData, setCashFlowData] = useState<ChartData[]>([]);
  const [budgetData, setBudgetData] = useState<ChartData[]>([]);
  const [revenueData, setRevenueData] = useState<ChartData[]>([]);
  const [arAgingData, setArAgingData] = useState<ChartData[]>([]);
  
  const { widgets, fetchWidgets, loading, refreshData } = useWidgetStore();
  const { session } = useAuthStore();

  const fetchKPIData = async () => {
    if (!session?.user.tenant_id) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/kpis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: session.user.tenant_id,
          dashboard: 'finance'
        })
      });
      if (response.ok) {
        const kpiData = await response.json();
        
        if (kpiData.length > 0) {
          const mappedKpis = kpiData.map((kpi: any) => ({
            title: kpi.title,
            value: kpi.value,
            change: kpi.change,
            icon: getIconByName(kpi.icon),
            color: kpi.color
          }));
          setMetrics(mappedKpis);
        } else {
          setMetrics([
            { title: 'Total Revenue', value: '$2,847,392', change: 15.2, icon: DollarSign, color: 'text-green-600' },
            { title: 'Net Profit', value: '$892,450', change: 8.7, icon: TrendingUp, color: 'text-blue-600' },
            { title: 'Cash Flow', value: '$445,223', change: -3.2, icon: PiggyBank, color: 'text-purple-600' },
            { title: 'Accounts Receivable', value: '$234,567', change: 12.1, icon: CreditCard, color: 'text-orange-600' },
            { title: 'Operating Margin', value: '31.4%', change: 4.5, icon: Calculator, color: 'text-cyan-600' },
            { title: 'Days Sales Outstanding', value: '28 days', change: -8.3, icon: Calendar, color: 'text-red-600' }
          ]);
        }
      } else {
        setMetrics([
          { title: 'Total Revenue', value: '$2,847,392', change: 15.2, icon: DollarSign, color: 'text-green-600' },
          { title: 'Net Profit', value: '$892,450', change: 8.7, icon: TrendingUp, color: 'text-blue-600' },
          { title: 'Cash Flow', value: '$445,223', change: -3.2, icon: PiggyBank, color: 'text-purple-600' },
          { title: 'Accounts Receivable', value: '$234,567', change: 12.1, icon: CreditCard, color: 'text-orange-600' },
          { title: 'Operating Margin', value: '31.4%', change: 4.5, icon: Calculator, color: 'text-cyan-600' },
          { title: 'Days Sales Outstanding', value: '28 days', change: -8.3, icon: Calendar, color: 'text-red-600' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      setMetrics([
        { title: 'Total Revenue', value: '$2,847,392', change: 15.2, icon: DollarSign, color: 'text-green-600' },
        { title: 'Net Profit', value: '$892,450', change: 8.7, icon: TrendingUp, color: 'text-blue-600' },
        { title: 'Cash Flow', value: '$445,223', change: -3.2, icon: PiggyBank, color: 'text-purple-600' },
        { title: 'Accounts Receivable', value: '$234,567', change: 12.1, icon: CreditCard, color: 'text-orange-600' },
        { title: 'Operating Margin', value: '31.4%', change: 4.5, icon: Calculator, color: 'text-cyan-600' },
        { title: 'Days Sales Outstanding', value: '28 days', change: -8.3, icon: Calendar, color: 'text-red-600' }
      ]);
    }
  };

  const getIconByName = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'DollarSign': DollarSign,
      'TrendingUp': TrendingUp,
      'CreditCard': CreditCard,
      'PiggyBank': PiggyBank,
      'Calculator': Calculator,
      'Calendar': Calendar,
    };
    return iconMap[iconName] || DollarSign;
  };

  useEffect(() => {
    if (session?.user.tenant_id) {
      fetchWidgets(session.user.tenant_id, 'finance');
      fetchKPIData();
    }
  }, [session]);

  useEffect(() => {

    setCashFlowData([
      { month: 'Jan', inflow: 320000, outflow: 245000, net: 75000 },
      { month: 'Feb', inflow: 285000, outflow: 220000, net: 65000 },
      { month: 'Mar', inflow: 398000, outflow: 280000, net: 118000 },
      { month: 'Apr', inflow: 445000, outflow: 325000, net: 120000 },
      { month: 'May', inflow: 512000, outflow: 378000, net: 134000 },
      { month: 'Jun', inflow: 580000, outflow: 415000, net: 165000 }
    ]);

    setBudgetData([
      { department: 'Sales', budget: 450000, actual: 420000, variance: -30000 },
      { department: 'Marketing', budget: 280000, actual: 295000, variance: 15000 },
      { department: 'Operations', budget: 650000, actual: 635000, variance: -15000 },
      { department: 'R&D', budget: 320000, actual: 340000, variance: 20000 },
      { department: 'HR', budget: 180000, actual: 175000, variance: -5000 },
      { department: 'IT', budget: 220000, actual: 235000, variance: 15000 }
    ]);

    setRevenueData([
      { month: 'Jan', product: 180000, service: 95000, subscription: 45000 },
      { month: 'Feb', product: 165000, service: 105000, subscription: 48000 },
      { month: 'Mar', product: 195000, service: 115000, subscription: 52000 },
      { month: 'Apr', product: 220000, service: 125000, subscription: 55000 },
      { month: 'May', product: 245000, service: 135000, subscription: 58000 },
      { month: 'Jun', product: 265000, service: 145000, subscription: 62000 }
    ]);

    setArAgingData([
      { range: '0-30 days', amount: 125000, percentage: 53.2 },
      { range: '31-60 days', amount: 65000, percentage: 27.7 },
      { range: '61-90 days', amount: 28000, percentage: 11.9 },
      { range: '90+ days', amount: 17000, percentage: 7.2 }
    ]);
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Finance Analytics</h1>
            <p className="text-muted-foreground mt-2">Financial performance and cash flow analysis</p>
          </div>
          <Button 
            onClick={() => {
              refreshData();
              fetchKPIData();
            }} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

      {/* Finance Metrics */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"> */}
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              {metric.change !== null && metric.change !== 0 && (
                <p className={`text-xs mt-1 ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}% from last month
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dynamic Widgets */}
      {widgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {widgets
            .sort((a, b) => {
              // Sort so tables come last
              if (a.type === 'table' && b.type !== 'table') return 1;
              if (a.type !== 'table' && b.type === 'table') return -1;
              return 0;
            })
            .map((widget) => (
            <ConfigurableWidget 
              key={widget.id} 
              widget={widget}
              data={widget.config?.chartData || []}
              onRemove={() => {}}
              onUpdate={() => {}}
              onMove={() => {}}
              onResize={() => {}}
            />
          ))}
        </div>
      )}

      {/* Default Charts Grid - Only show if no dynamic widgets */}
      {!loading && widgets.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Cash Flow Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Area type="monotone" dataKey="inflow" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.8} name="Cash Inflow" />
                <Area type="monotone" dataKey="outflow" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.8} name="Cash Outflow" />
                <Line type="monotone" dataKey="net" stroke="#3B82F6" strokeWidth={3} name="Net Cash Flow" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget vs Actual */}
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Bar dataKey="budget" fill="#94A3B8" name="Budget" />
                <Bar dataKey="actual" fill="#3B82F6" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Stream</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Area type="monotone" dataKey="product" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Product Sales" />
                <Area type="monotone" dataKey="service" stackId="1" stroke="#10B981" fill="#10B981" name="Services" />
                <Area type="monotone" dataKey="subscription" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Subscriptions" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Accounts Receivable Aging */}
        <Card>
          <CardHeader>
            <CardTitle>Accounts Receivable Aging</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={arAgingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'amount' ? `$${value.toLocaleString()}` : `${value}%`,
                    name === 'amount' ? 'Amount' : 'Percentage'
                  ]}
                />
                <Bar dataKey="amount" fill="#3B82F6" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </div>
      )}
      </div>
    </Layout>
  );
}