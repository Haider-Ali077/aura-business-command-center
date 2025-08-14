import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, BarChart3, Trash2, Edit } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';

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
  'purple-600',
  'green-600', 
  'blue-600',
  'red-600',
  'indigo-600'
];

export default function KpiManagement() {
  const [kpiCards, setKpiCards] = useState<KpiCard[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<KpiCard | null>(null);
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
        resetForm();
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKpi) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/kpi-cards/${selectedKpi.id}`, {
        method: 'PUT',
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
        toast.success('KPI card updated successfully');
        setEditDialogOpen(false);
        setSelectedKpi(null);
        resetForm();
        if (selectedTenant) {
          fetchKpiCards(parseInt(selectedTenant));
        }
      } else {
        toast.error('Failed to update KPI card');
      }
    } catch (error) {
      toast.error('Error updating KPI card');
    }
  };

  const handleDelete = async (kpiCardId: number) => {
    if (!confirm('Are you sure you want to delete this KPI card?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/kpi-cards/${kpiCardId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('KPI card deleted successfully');
        if (selectedTenant) {
          fetchKpiCards(parseInt(selectedTenant));
        }
      } else {
        toast.error('Failed to delete KPI card');
      }
    } catch (error) {
      toast.error('Error deleting KPI card');
    }
  };

  const openEditDialog = (kpi: KpiCard) => {
    setSelectedKpi(kpi);
    setFormData({
      tenant_id: kpi.tenant_id.toString(),
      dashboard: kpi.dashboard,
      title: kpi.title,
      icon: kpi.icon,
      color: kpi.color,
      value_query: kpi.value_query,
      change_query: kpi.change_query || '',
      prefix: kpi.prefix || ''
    });
    setEditDialogOpen(true);
  };

  const resetForm = () => {
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
  };

  const getTenantName = (tenantId: number) => {
    const tenant = tenants.find(t => t.tenant_id === tenantId);
    return tenant ? tenant.name : 'Unknown';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <Layout>
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
                  <TableHead>Actions</TableHead>
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
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(kpi)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(kpi.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {kpiCards.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No KPI cards found for this tenant
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit KPI Card</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_tenant_id">Tenant</Label>
                <Select value={formData.tenant_id} onValueChange={(value) => setFormData({ ...formData, tenant_id: value })}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Label htmlFor="edit_dashboard">Dashboard</Label>
                <Select value={formData.dashboard} onValueChange={(value) => setFormData({ ...formData, dashboard: value })}>
                  <SelectTrigger>
                    <SelectValue />
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
              <Label htmlFor="edit_title">Title</Label>
              <Input
                id="edit_title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit_icon">Icon</Label>
                <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Label htmlFor="edit_color">Color</Label>
                <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Label htmlFor="edit_prefix">Prefix (Optional)</Label>
                <Input
                  id="edit_prefix"
                  value={formData.prefix}
                  onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                  placeholder="e.g., $, %"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit_value_query">Value Query</Label>
              <Textarea
                id="edit_value_query"
                value={formData.value_query}
                onChange={(e) => setFormData({ ...formData, value_query: e.target.value })}
                className="h-24"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit_change_query">Change Query (Optional)</Label>
              <Textarea
                id="edit_change_query"
                value={formData.change_query}
                onChange={(e) => setFormData({ ...formData, change_query: e.target.value })}
                className="h-24"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </Layout>
  );
}