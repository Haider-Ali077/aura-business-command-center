import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users, Clock, AlertTriangle, CheckCircle, Calculator, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAuthStore } from '@/store/authStore';
import { useWidgetStore } from '@/store/widgetStore';
import { API_BASE_URL } from '@/config/api';
import { ConfigurableWidget } from '@/components/ConfigurableWidget';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

interface PurchaseMetric {
  title: string;
  value: string;
  change?: string;
  icon: any;
  color: string;
}

interface ChartData {
  [key: string]: any;
}

const PurchaseDashboard = () => {
  const [metrics, setMetrics] = useState<PurchaseMetric[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);
  const [spendingData, setSpendingData] = useState<ChartData[]>([]);
  const [supplierData, setSupplierData] = useState<ChartData[]>([]);
  const [categoryData, setCategoryData] = useState<ChartData[]>([]);
  const [performanceData, setPerformanceData] = useState<ChartData[]>([]);
  const [topSuppliers, setTopSuppliers] = useState<ChartData[]>([]);
  const { session } = useAuthStore();
  const { widgets, loading, fetchWidgets } = useWidgetStore();

  const getIconByName = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'DollarSign': DollarSign,
      'TrendingUp': TrendingUp,
      'TrendingDown': TrendingDown,
      'ShoppingCart': ShoppingCart,
      'Package': Package,
      'Users': Users,
      'Clock': Clock,
      'AlertTriangle': AlertTriangle,
      'CheckCircle': CheckCircle,
      'Calculator': Calculator,
      'Target': Target,
      // Add case variations for better matching
      'dollarsign': DollarSign,
      'trendingup': TrendingUp,
      'trendingdown': TrendingDown,
      'shoppingcart': ShoppingCart,
      'package': Package,
      'users': Users,
      'clock': Clock,
      'alerttriangle': AlertTriangle,
      'checkcircle': CheckCircle,
      'calculator': Calculator,
      'target': Target,
      'DOLLARSIGN': DollarSign,
      'TRENDINGUP': TrendingUp,
      'TRENDINGDOWN': TrendingDown,
      'SHOPPINGCART': ShoppingCart,
      'PACKAGE': Package,
      'USERS': Users,
      'CLOCK': Clock,
      'ALERTTRIANGLE': AlertTriangle,
      'CHECKCIRCLE': CheckCircle,
      'CALCULATOR': Calculator,
      'TARGET': Target,
    };
    
    return iconMap[iconName] || iconMap[iconName?.toLowerCase()] || iconMap[iconName?.toUpperCase()] || DollarSign;
  };

  const defaultMetrics: PurchaseMetric[] = [
    {
      title: 'Total Spend',
      value: '$2.4M',
      change: '+12%',
      icon: DollarSign,
      color: 'text-blue-600'
    },
    {
      title: 'Purchase Orders',
      value: '1,847',
      change: '+8%',
      icon: ShoppingCart,
      color: 'text-green-600'
    },
    {
      title: 'Active Suppliers',
      value: '342',
      change: '+5%',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Avg. Order Time',
      value: '3.2 days',
      change: '-15%',
      icon: Clock,
      color: 'text-orange-600'
    }
  ];

  const fetchKPIData = async () => {
    if (!session?.user.tenant_id) return;
    
    setIsLoadingMetrics(true);
    try {
      const response = await fetch(`${API_BASE_URL}/kpis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: session.user.tenant_id,
          dashboard: 'purchase'
        })
      });
      if (response.ok) {
        const kpiData = await response.json();
        
        // Simulate loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
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
          setMetrics(defaultMetrics);
        }
      } else {
        setMetrics(defaultMetrics);
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      setMetrics(defaultMetrics);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchWidgets(session.user.tenant_id, 'purchase');
      fetchKPIData();
    }
  }, [session, fetchWidgets]);


  useEffect(() => {
    // Simulate loading and set chart data
    const timer = setTimeout(() => {
      setSpendingData([
        { month: 'Jan', amount: 180000 },
        { month: 'Feb', amount: 220000 },
        { month: 'Mar', amount: 195000 },
        { month: 'Apr', amount: 240000 },
        { month: 'May', amount: 210000 },
        { month: 'Jun', amount: 260000 }
      ]);

      setSupplierData([
        { name: 'Office Supplies', value: 35, amount: 840000 },
        { name: 'Technology', value: 28, amount: 672000 },
        { name: 'Manufacturing', value: 22, amount: 528000 },
        { name: 'Services', value: 15, amount: 360000 }
      ]);

      setCategoryData([
        { category: 'IT Equipment', budget: 500000, actual: 420000 },
        { category: 'Office Supplies', budget: 200000, actual: 180000 },
        { category: 'Marketing', budget: 150000, actual: 165000 },
        { category: 'Travel', budget: 100000, actual: 85000 },
        { category: 'Facilities', budget: 300000, actual: 280000 }
      ]);

      setPerformanceData([
        { month: 'Jan', onTime: 85, delayed: 15 },
        { month: 'Feb', onTime: 88, delayed: 12 },
        { month: 'Mar', onTime: 82, delayed: 18 },
        { month: 'Apr', onTime: 90, delayed: 10 },
        { month: 'May', onTime: 87, delayed: 13 },
        { month: 'Jun', onTime: 92, delayed: 8 }
      ]);

      setTopSuppliers([
        { name: 'TechCorp Solutions', amount: '$450,000', orders: 145, rating: 4.8 },
        { name: 'Office Plus Inc.', amount: '$320,000', orders: 89, rating: 4.6 },
        { name: 'Global Manufacturing', amount: '$280,000', orders: 67, rating: 4.7 },
        { name: 'Service Partners LLC', amount: '$195,000', orders: 43, rating: 4.5 },
        { name: 'Supply Chain Co.', amount: '$150,000', orders: 38, rating: 4.4 }
      ]);

      setIsLoadingCharts(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  const handleRefresh = () => {
    setIsLoadingMetrics(true);
    setIsLoadingCharts(true);
    // Simulate refresh
    setTimeout(() => {
      setIsLoadingMetrics(false);
      setIsLoadingCharts(false);
    }, 1000);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Purchase Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Purchase orders, supplier management, and procurement analytics</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoadingMetrics ? (
            Array.from({ length: 4 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-32" />
            ))
          ) : (
            metrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.title}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                        {metric.change && (
                          <p className={`text-sm ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {metric.change}
                          </p>
                        )}
                      </div>
                      <IconComponent className={`h-8 w-8 ${metric.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Dynamic Widgets */}
        {!loading && widgets.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {widgets.map((widget) => (
              <ConfigurableWidget
                key={widget.id}
                widget={widget}
                data={[]}
                onRemove={() => {}}
                onUpdate={() => {}}
                onMove={() => {}}
                onResize={() => {}}
              />
            ))}
          </div>
        )}

        {/* Default Charts - only show if no dynamic widgets */}
        {(!loading && widgets.length === 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Spending Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spending Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCharts ? (
                  <LoadingSkeleton className="h-80" />
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={spendingData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                        <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Spending by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCharts ? (
                  <LoadingSkeleton className="h-80" />
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={supplierData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {supplierData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Budget vs Actual */}
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual Spending</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCharts ? (
                  <LoadingSkeleton className="h-80" />
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Bar dataKey="budget" fill="#8884d8" name="Budget" />
                        <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCharts ? (
                  <LoadingSkeleton className="h-80" />
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="onTime" stackId="a" fill="#82ca9d" name="On Time %" />
                        <Bar dataKey="delayed" stackId="a" fill="#ff7300" name="Delayed %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Top Suppliers Table - only show if no dynamic widgets */}
        {(!loading && widgets.length === 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Top Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingCharts ? (
                <LoadingSkeleton className="h-64" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3">Supplier</th>
                        <th className="px-6 py-3">Total Amount</th>
                        <th className="px-6 py-3">Orders</th>
                        <th className="px-6 py-3">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topSuppliers.map((supplier, index) => (
                        <tr key={index} className="bg-white dark:bg-gray-900 border-b dark:border-gray-700">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                            {supplier.name}
                          </td>
                          <td className="px-6 py-4">{supplier.amount}</td>
                          <td className="px-6 py-4">{supplier.orders}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className="text-yellow-400 mr-1">★</span>
                              {supplier.rating}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default PurchaseDashboard;