import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UserPlus, UserMinus, Clock, Target, TrendingUp, RefreshCw } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useWidgetStore } from "@/store/widgetStore";
import { useAuthStore } from "@/store/authStore";
import { ConfigurableWidget } from "@/components/ConfigurableWidget";

interface HRMetric {
  title: string;
  value: string;
  change: number;
  icon: any;
  color: string;
}

interface ChartData {
  name?: string;
  [key: string]: any;
}

export function HRDashboard() {
  const [metrics, setMetrics] = useState<HRMetric[]>([]);
  const [headcountData, setHeadcountData] = useState<ChartData[]>([]);
  const [attritionData, setAttritionData] = useState<ChartData[]>([]);
  const [hiringData, setHiringData] = useState<ChartData[]>([]);
  const [departmentData, setDepartmentData] = useState<ChartData[]>([]);
  const [performanceData, setPerformanceData] = useState<ChartData[]>([]);
  const [diversityData, setDiversityData] = useState<ChartData[]>([]);
  
  const { widgets, fetchWidgets, loading, refreshData } = useWidgetStore();
  const { session } = useAuthStore();

  useEffect(() => {
    if (session?.user.tenant_id) {
      fetchWidgets(session.user.tenant_id, 'hr');
    }
  }, [session]);

  useEffect(() => {
    setMetrics([
      { title: 'Total Employees', value: '1,247', change: 8.2, icon: Users, color: 'text-blue-600' },
      { title: 'New Hires (MTD)', value: '23', change: 15.0, icon: UserPlus, color: 'text-green-600' },
      { title: 'Attrition Rate', value: '12.4%', change: -18.3, icon: UserMinus, color: 'text-red-600' },
      { title: 'Avg Time to Hire', value: '28 days', change: -12.5, icon: Clock, color: 'text-purple-600' },
      { title: 'Employee Satisfaction', value: '4.2/5', change: 5.8, icon: Target, color: 'text-cyan-600' },
      { title: 'Training Completion', value: '89.3%', change: 6.7, icon: TrendingUp, color: 'text-orange-600' }
    ]);

    setHeadcountData([
      { month: 'Jan', total: 1150, hires: 25, departures: 18, netGrowth: 7 },
      { month: 'Feb', total: 1165, hires: 22, departures: 15, netGrowth: 7 },
      { month: 'Mar', total: 1180, hires: 28, departures: 13, netGrowth: 15 },
      { month: 'Apr', total: 1205, hires: 32, departures: 7, netGrowth: 25 },
      { month: 'May', total: 1225, hires: 35, departures: 15, netGrowth: 20 },
      { month: 'Jun', total: 1247, hires: 38, departures: 16, netGrowth: 22 }
    ]);

    setAttritionData([
      { department: 'Sales', attrition: 18.5, voluntary: 15.2, involuntary: 3.3 },
      { department: 'Engineering', attrition: 8.2, voluntary: 6.8, involuntary: 1.4 },
      { department: 'Marketing', attrition: 14.7, voluntary: 12.1, involuntary: 2.6 },
      { department: 'Operations', attrition: 11.3, voluntary: 9.5, involuntary: 1.8 },
      { department: 'HR', attrition: 9.1, voluntary: 7.8, involuntary: 1.3 },
      { department: 'Finance', attrition: 6.4, voluntary: 5.2, involuntary: 1.2 }
    ]);

    setHiringData([
      { position: 'Software Engineer', timeToHire: 32, applications: 245, hired: 12 },
      { position: 'Sales Rep', timeToHire: 18, applications: 189, hired: 8 },
      { position: 'Product Manager', timeToHire: 45, applications: 156, hired: 3 },
      { position: 'Data Analyst', timeToHire: 28, applications: 198, hired: 6 },
      { position: 'UX Designer', timeToHire: 38, applications: 167, hired: 4 },
      { position: 'Marketing Specialist', timeToHire: 22, applications: 134, hired: 5 }
    ]);

    setDepartmentData([
      { department: 'Engineering', count: 385, percentage: 30.9 },
      { department: 'Sales', count: 298, percentage: 23.9 },
      { department: 'Operations', count: 187, percentage: 15.0 },
      { department: 'Marketing', count: 156, percentage: 12.5 },
      { department: 'Finance', count: 98, percentage: 7.9 },
      { department: 'HR', count: 67, percentage: 5.4 },
      { department: 'Legal', count: 34, percentage: 2.7 },
      { department: 'Other', count: 22, percentage: 1.8 }
    ]);

    setPerformanceData([
      { quarter: 'Q1', avgRating: 3.8, topPerformers: 15.2, needsImprovement: 8.7 },
      { quarter: 'Q2', avgRating: 4.0, topPerformers: 18.5, needsImprovement: 6.3 },
      { quarter: 'Q3', avgRating: 4.1, topPerformers: 20.1, needsImprovement: 5.8 },
      { quarter: 'Q4', avgRating: 4.2, topPerformers: 22.3, needsImprovement: 4.9 }
    ]);

    setDiversityData([
      { category: 'Gender', male: 58.3, female: 41.7, other: 0.0 },
      { category: 'Age Groups', '18-29': 32.1, '30-39': 41.5, '40-49': 18.7, '50+': 7.7 },
      { category: 'Education', 'Bachelor': 45.2, 'Master': 38.9, 'PhD': 12.4, 'Other': 3.5 }
    ]);
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Human Resources Analytics</h1>
            <p className="text-muted-foreground mt-2">Employee metrics, hiring, and performance insights</p>
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

      {/* HR Metrics */}
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
              <p className={`text-xs mt-1 ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change > 0 ? '+' : ''}{metric.change}% from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dynamic Widgets */}
      {widgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Default Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Headcount Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Headcount Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={headcountData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={3} name="Total Employees" />
                <Line type="monotone" dataKey="netGrowth" stroke="#10B981" strokeWidth={2} name="Net Growth" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attrition by Department */}
        <Card>
          <CardHeader>
            <CardTitle>Attrition Rate by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attritionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, '']} />
                <Bar dataKey="voluntary" fill="#3B82F6" name="Voluntary" />
                <Bar dataKey="involuntary" fill="#EF4444" name="Involuntary" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Distribution by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="percentage"
                  label={({ department, percentage }) => `${department}: ${percentage}%`}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Rating Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'avgRating' ? value : `${value}%`,
                  name === 'avgRating' ? 'Average Rating' : 'Percentage'
                ]} />
                <Area type="monotone" dataKey="topPerformers" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.8} name="Top Performers %" />
                <Line type="monotone" dataKey="avgRating" stroke="#3B82F6" strokeWidth={3} name="Average Rating" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Hiring Pipeline Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Hiring Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Position</th>
                  <th className="text-right p-2">Applications</th>
                  <th className="text-right p-2">Hired</th>
                  <th className="text-right p-2">Avg Time to Hire</th>
                  <th className="text-right p-2">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {hiringData.map((position, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{position.position}</td>
                    <td className="p-2 text-right">{position.applications}</td>
                    <td className="p-2 text-right">{position.hired}</td>
                    <td className="p-2 text-right">{position.timeToHire} days</td>
                    <td className="p-2 text-right">
                      {((position.hired / position.applications) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
}