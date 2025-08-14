import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, BarChart3 } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';

interface KpiCard {
  id: number;
  tenant_id: number;
  dashboard: string;
  title: string;
  icon: string;
  color: string;
  value_query: string;
  change_query: string | null;
  prefix: string | null;
}

interface Tenant {
  tenant_id: number;
  name: string;
}

const dashboardOptions = [
  'executive',
  'finance',
  'sales',
  'hr',
  'inventory',
  'purchase'
];

const iconOptions = [
  'DollarSign',
  'TrendingUp',
  'Users',
  'ShoppingCart',
  'Package',
  'FileText',
  'BarChart3',
  'Target'
];

const colorOptions = [
  'blue',
  'green',
  'red',
  'yellow',
  'purple',
  'pink',
  'indigo',
  'orange'
];

export default function KpiManagement() {
  const [kpiCards, setKpiCards] = useState<KpiCard[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [formData, setFormData] = useState({
    tenant_id: '',
    dashboard: '',
    title: '',
    icon: '',
    color: '',
    value_query: '',
    change_query: '',
    prefix: ''
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      fetchKpiCards(parseInt(selectedTenant));
    }
  }, [selectedTenant]);

  const fetchTenants = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/tenants`);
      if (response.ok) {
        const data = await response.json();
        setTenants(data.filter((t: any) => t.is_active));
      } else {
        toast.error('Failed to fetch tenants');
      }
    } catch (error) {
      toast.error('Error fetching tenants');
    } finally {
      setLoading(false);
    }
  };

  const fetchKpiCards = async (tenantId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/kpi-cards/${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setKpiCards(data);
      } else {
        toast.error('Failed to fetch KPI cards');
      }
    } catch (error) {
      toast.error('Error fetching KPI cards');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/kpi-cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tenant_id: parseInt(formData.tenant_id),
          change_query: formData.change_query || null,
          prefix: formData.prefix || null
        }),
      });

      if (response.ok) {
        toast.success('KPI card created successfully');
        setCreateDialogOpen(false);
        setFormData({
          tenant_id: '',
          dashboard: '',
          title: '',
          icon: '',
          color: '',
          value_query: '',
          change_query: '',
          prefix: ''
        });
        if (selectedTenant) {
          fetchKpiCards(parseInt(selectedTenant));
        }
      } else {
        toast.error('Failed to create KPI card');
      }
    } catch (error) {
      toast.error('Error creating KPI card');
    }
  };

  const getTenantName = (tenantId: number) => {
    const tenant = tenants.find(t => t.tenant_id === tenantId);
    return tenant ? tenant.name : 'Unknown';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">KPI Management</h1>
          <p className="text-muted-foreground">Configure KPI cards for tenant dashboards</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create KPI Card
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New KPI Card</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tenant_id">Tenant</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, tenant_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.tenant_id} value={tenant.tenant_id.toString()}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dashboard">Dashboard</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, dashboard: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select dashboard" />
                    </SelectTrigger>
                    <SelectContent>
                      {dashboardOptions.map((dashboard) => (
                        <SelectItem key={dashboard} value={dashboard}>
                          {dashboard.charAt(0).toUpperCase() + dashboard.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Total Revenue"
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, color: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded bg-${color}-500`}></div>
                            {color}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="prefix">Prefix (Optional)</Label>
                  <Input
                    id="prefix"
                    value={formData.prefix}
                    onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                    placeholder="e.g., $, %"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="value_query">Value Query</Label>
                <Textarea
                  id="value_query"
                  value={formData.value_query}
                  onChange={(e) => setFormData({ ...formData, value_query: e.target.value })}
                  placeholder="SQL query to get the main value"
                  className="h-24"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="change_query">Change Query (Optional)</Label>
                <Textarea
                  id="change_query"
                  value={formData.change_query}
                  onChange={(e) => setFormData({ ...formData, change_query: e.target.value })}
                  placeholder="SQL query to calculate percentage change"
                  className="h-24"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center">
        <Label htmlFor="tenant-filter">Select Tenant to View KPIs:</Label>
        <Select value={selectedTenant} onValueChange={setSelectedTenant}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select tenant" />
          </SelectTrigger>
          <SelectContent>
            {tenants.map((tenant) => (
              <SelectItem key={tenant.tenant_id} value={tenant.tenant_id.toString()}>
                {tenant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTenant && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              KPI Cards for {getTenantName(parseInt(selectedTenant))}
            </CardTitle>
            <CardDescription>Manage KPI cards for this tenant</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Dashboard</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Prefix</TableHead>
                  <TableHead>Value Query</TableHead>
                  <TableHead>Change Query</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kpiCards.map((kpi) => (
                  <TableRow key={kpi.id}>
                    <TableCell className="font-medium">{kpi.title}</TableCell>
                    <TableCell>{kpi.dashboard}</TableCell>
                    <TableCell>{kpi.icon}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded bg-${kpi.color}-500`}></div>
                        {kpi.color}
                      </div>
                    </TableCell>
                    <TableCell>{kpi.prefix || 'None'}</TableCell>
                    <TableCell className="max-w-xs truncate" title={kpi.value_query}>
                      {kpi.value_query}
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={kpi.change_query || ''}>
                      {kpi.change_query || 'None'}
                    </TableCell>
                  </TableRow>
                ))}
                {kpiCards.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No KPI cards found for this tenant
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}