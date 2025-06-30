
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Download, Eye, Calendar, Search, Filter, FileText, TrendingUp, BarChart3, PieChart } from "lucide-react";

const reports = [
  {
    id: '1',
    name: 'Monthly Sales Report',
    type: 'Sales',
    status: 'Generated',
    createdAt: '2024-01-15',
    size: '2.4 MB',
    description: 'Comprehensive monthly sales analysis with trends and forecasts',
    category: 'Financial'
  },
  {
    id: '2',
    name: 'Customer Analytics Q1',
    type: 'Analytics',
    status: 'Processing',
    createdAt: '2024-01-14',
    size: '1.8 MB',
    description: 'Quarterly customer behavior and satisfaction analysis',
    category: 'Customer'
  },
  {
    id: '3',
    name: 'Inventory Summary',
    type: 'Inventory',
    status: 'Generated',
    createdAt: '2024-01-13',
    size: '3.2 MB',
    description: 'Real-time inventory levels and reorder recommendations',
    category: 'Operations'
  },
  {
    id: '4',
    name: 'Financial Overview',
    type: 'Finance',
    status: 'Generated',
    createdAt: '2024-01-12',
    size: '4.1 MB',
    description: 'Complete financial performance dashboard with KPIs',
    category: 'Financial'
  },
  {
    id: '5',
    name: 'Performance Dashboard',
    type: 'Analytics',
    status: 'Generated',
    createdAt: '2024-01-11',
    size: '2.9 MB',
    description: 'Employee and department performance metrics',
    category: 'HR'
  },
  {
    id: '6',
    name: 'Market Analysis',
    type: 'Market',
    status: 'Scheduled',
    createdAt: '2024-01-10',
    size: '5.1 MB',
    description: 'Market trends and competitive analysis report',
    category: 'Strategic'
  }
];

const reportTemplates = [
  { id: 1, name: 'Sales Performance', icon: TrendingUp, color: 'from-green-500 to-green-600' },
  { id: 2, name: 'Financial Analysis', icon: BarChart3, color: 'from-blue-500 to-blue-600' },
  { id: 3, name: 'Customer Insights', icon: PieChart, color: 'from-purple-500 to-purple-600' },
  { id: 4, name: 'Operational Report', icon: FileText, color: 'from-orange-500 to-orange-600' },
];

const Reports = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const handleCreateReport = () => {
    if (reportName && reportType) {
      console.log('Creating report:', { name: reportName, type: reportType });
      setReportName('');
      setReportType('');
      setShowCreateForm(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'Generated': 'bg-green-100 text-green-800 border border-green-200',
      'Processing': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'Scheduled': 'bg-blue-100 text-blue-800 border border-blue-200',
      'Failed': 'bg-red-100 text-red-800 border border-red-200'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || report.status.toLowerCase() === filterStatus;
    const matchesCategory = filterCategory === 'all' || report.category.toLowerCase() === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Reports</h1>
            <p className="text-gray-600 text-lg">Create, manage and analyze your business intelligence reports</p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 text-base font-medium shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Report
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <p className="text-3xl font-bold text-gray-900">{reports.length}</p>
                </div>
                <FileText className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Generated</p>
                  <p className="text-3xl font-bold text-gray-900">{reports.filter(r => r.status === 'Generated').length}</p>
                </div>
                <BarChart3 className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Processing</p>
                  <p className="text-3xl font-bold text-gray-900">{reports.filter(r => r.status === 'Processing').length}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Scheduled</p>
                  <p className="text-3xl font-bold text-gray-900">{reports.filter(r => r.status === 'Scheduled').length}</p>
                </div>
                <PieChart className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all-reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:inline-flex">
            <TabsTrigger value="all-reports" className="px-6 py-3">All Reports</TabsTrigger>
            <TabsTrigger value="create-report" className="px-6 py-3">Create New</TabsTrigger>
            <TabsTrigger value="templates" className="px-6 py-3">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="all-reports" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-36">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="generated">Generated</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="strategic">Strategic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-1">{report.name}</h3>
                          <p className="text-gray-600 text-sm">{report.description}</p>
                        </div>
                        <Badge className={getStatusBadge(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {report.createdAt}
                        </span>
                        <span>{report.size}</span>
                        <Badge variant="outline" className="text-xs">
                          {report.category}
                        </Badge>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create-report" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Create New Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700">Report Name</label>
                    <Input
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      placeholder="Enter report name"
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700">Report Type</label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales Report</SelectItem>
                        <SelectItem value="analytics">Analytics Report</SelectItem>
                        <SelectItem value="inventory">Inventory Report</SelectItem>
                        <SelectItem value="finance">Financial Report</SelectItem>
                        <SelectItem value="customer">Customer Report</SelectItem>
                        <SelectItem value="performance">Performance Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button 
                    onClick={handleCreateReport} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3"
                  >
                    Generate Report
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)} className="px-8 py-3">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {reportTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${template.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <template.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{template.name}</h3>
                    <Button variant="outline" size="sm" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;
