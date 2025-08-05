import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Package, UserCheck, AlertTriangle, RefreshCw } from "lucide-react";
import { ConfigurableWidget } from "@/components/ConfigurableWidget";
import { useWidgetStore } from "@/store/widgetStore";
import { useAuthStore } from "@/store/authStore";
import { Layout } from "@/components/Layout";
import { API_BASE_URL } from "@/config/api";

interface ExecutiveKPI {
  title: string;
  value: string;
  change: number | null;
  icon: any;
  color: string;
}

interface ChartData {
  name?: string;
  value?: number;
  [key: string]: any;
}

export function ExecutiveDashboard() {
  const [kpis, setKpis] = useState<ExecutiveKPI[]>([]);
  const [revenueData, setRevenueData] = useState<ChartData[]>([]);
  const [departmentData, setDepartmentData] = useState<ChartData[]>([]);
  const [trendData, setTrendData] = useState<ChartData[]>([]);
  
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
          dashboard: 'executive'
        })
      });
      if (response.ok) {
        const kpiData = await response.json();
        
        if (kpiData.length > 0) {
          // Map API data to component format
          const mappedKpis = kpiData.map((kpi: any) => ({
            title: kpi.title,
            value: kpi.value,
            change: kpi.change,
            icon: getIconByName(kpi.icon),
            color: kpi.color
          }));
          setKpis(mappedKpis);
        } else {
          // Fallback to dummy data
          setKpis([
            { title: 'Total Revenue', value: '$2.4M', change: 12.5, icon: DollarSign, color: 'text-green-600' },
            { title: 'Total Orders', value: '3,247', change: -2.1, icon: ShoppingCart, color: 'text-purple-600' },
            { title: 'Inventory Value', value: '$847K', change: 5.7, icon: Package, color: 'text-orange-600' },
            { title: 'Employee Count', value: '156', change: 3.2, icon: UserCheck, color: 'text-cyan-600' },
          ]);
        }
      } else {
        // Fallback to dummy data on error
        setKpis([
          { title: 'Total Revenue', value: '$2.4M', change: 12.5, icon: DollarSign, color: 'text-green-600' },
          { title: 'Total Orders', value: '3,247', change: -2.1, icon: ShoppingCart, color: 'text-purple-600' },
          { title: 'Inventory Value', value: '$847K', change: 5.7, icon: Package, color: 'text-orange-600' },
          { title: 'Employee Count', value: '156', change: 3.2, icon: UserCheck, color: 'text-cyan-600' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      // Fallback to dummy data
      setKpis([
        { title: 'Total Revenue', value: '$2.4M', change: 12.5, icon: DollarSign, color: 'text-green-600' },
        { title: 'Total Orders', value: '3,247', change: -2.1, icon: ShoppingCart, color: 'text-purple-600' },
        { title: 'Inventory Value', value: '$847K', change: 5.7, icon: Package, color: 'text-orange-600' },
        { title: 'Employee Count', value: '156', change: 3.2, icon: UserCheck, color: 'text-cyan-600' },
      ]);
    }
  };

  const getIconByName = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'DollarSign': DollarSign,
      'Users': Users,
      'ShoppingCart': ShoppingCart,
      'Package': Package,
      'UserCheck': UserCheck,
      'AlertTriangle': AlertTriangle,
    };
    return iconMap[iconName] || DollarSign;
  };

  useEffect(() => {
    if (session?.user.tenant_id) {
      console.log('Session user data:', session.user);
      console.log('Tenant ID:', session.user.tenant_id, 'Type:', typeof session.user.tenant_id);
      fetchWidgets(session.user.tenant_id, 'executive');
      fetchKPIData();
    }
  }, [session]);

  useEffect(() => {
    // Chart data - keep as mock data

    setRevenueData([
      { name: 'Jan', revenue: 65000, expenses: 45000, profit: 20000 },
      { name: 'Feb', revenue: 72000, expenses: 48000, profit: 24000 },
      { name: 'Mar', revenue: 68000, expenses: 46000, profit: 22000 },
      { name: 'Apr', revenue: 78000, expenses: 52000, profit: 26000 },
      { name: 'May', revenue: 85000, expenses: 55000, profit: 30000 },
      { name: 'Jun', revenue: 92000, expenses: 58000, profit: 34000 }
    ]);

    setDepartmentData([
      { name: 'Sales', value: 35, color: '#3B82F6' },
      { name: 'Marketing', value: 25, color: '#10B981' },
      { name: 'Operations', value: 20, color: '#F59E0B' },
      { name: 'HR', value: 12, color: '#EF4444' },
      { name: 'IT', value: 8, color: '#8B5CF6' }
    ]);

    setTrendData([
      { name: 'Q1', sales: 245000, orders: 850, customers: 320 },
      { name: 'Q2', sales: 285000, orders: 920, customers: 380 },
      { name: 'Q3', sales: 320000, orders: 1100, customers: 450 },
      { name: 'Q4', sales: 375000, orders: 1280, customers: 520 }
    ]);
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Executive Dashboard</h1>
          <p className="text-muted-foreground mt-2">High-level overview of company performance</p>
        </div>
        <Button 
          onClick={refreshData} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* KPI Cards Grid */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"> */}
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        {kpis.map((kpi, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              {kpi.change !== null && kpi.change !== 0 && (
                <div className="flex items-center mt-1">
                  {kpi.change > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <span className={`text-xs ${kpi.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(kpi.change)}% from last month
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dynamic Widgets */}
      {widgets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {widgets.map((widget) => (
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
      {widgets.length === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                <Bar dataKey="profit" fill="#10B981" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Budget Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Department Budget Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Budget']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quarterly Performance Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quarterly Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={3} name="Sales ($)" />
                <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={3} name="Orders" />
                <Line type="monotone" dataKey="customers" stroke="#F59E0B" strokeWidth={3} name="Customers" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </div>
      )}
      </div>
    </Layout>
  );
}