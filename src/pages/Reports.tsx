
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Eye, Calendar } from "lucide-react";

const reports = [
  {
    id: '1',
    name: 'Monthly Sales Report',
    type: 'Sales',
    status: 'Generated',
    createdAt: '2024-01-15',
    size: '2.4 MB'
  },
  {
    id: '2',
    name: 'Customer Analytics Q1',
    type: 'Analytics',
    status: 'Processing',
    createdAt: '2024-01-14',
    size: '1.8 MB'
  },
  {
    id: '3',
    name: 'Inventory Summary',
    type: 'Inventory',
    status: 'Generated',
    createdAt: '2024-01-13',
    size: '3.2 MB'
  },
  {
    id: '4',
    name: 'Financial Overview',
    type: 'Finance',
    status: 'Generated',
    createdAt: '2024-01-12',
    size: '4.1 MB'
  },
];

const Reports = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('');

  const handleCreateReport = () => {
    if (reportName && reportType) {
      console.log('Creating report:', { name: reportName, type: reportType });
      setReportName('');
      setReportType('');
      setShowCreateForm(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'Generated': 'bg-green-100 text-green-800',
      'Processing': 'bg-yellow-100 text-yellow-800',
      'Failed': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-2">Create and manage your business reports</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>

        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Report Name</label>
                  <Input
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="Enter report name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Report Type</label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales Report</SelectItem>
                      <SelectItem value="analytics">Analytics Report</SelectItem>
                      <SelectItem value="inventory">Inventory Report</SelectItem>
                      <SelectItem value="finance">Financial Report</SelectItem>
                      <SelectItem value="customer">Customer Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateReport} className="bg-blue-600 hover:bg-blue-700">
                  Generate Report
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{report.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {report.createdAt}
                      </span>
                      <span>{report.size}</span>
                      <Badge className={getStatusBadge(report.status)}>
                        {report.status}
                      </Badge>
                      <Badge variant="outline">{report.type}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;
