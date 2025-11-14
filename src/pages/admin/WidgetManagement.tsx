import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Grid3x3 } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';

interface Widget {
  id: number;
  tenant_id: number;
  dashboard: string;
  title: string;
  type: string;
  span: number;
  position_x: number;
  position_y: number;
  size_width: number;
  size_height: number;
  sql_query: string;
  created_at: string;
  updated_at?: string;
}

interface Tenant {
  tenant_id: number;
  name: string;
}

const widgetTypes = [
  'line',
  'bar',
  'area',
  'doughnut',
  'table'
];

const dashboardTypes = [
  'executive',
  'sales',
  'finance',
  'hr',
  'inventory',
  'purchase'
];

export default function WidgetManagement() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [formData, setFormData] = useState({
    tenant_id: '',
    dashboard: '',
    title: '',
    type: '',
    span: '1',
    position_x: '0',
    position_y: '0',
    size_width: '4',
    size_height: '4',
    sql_query: ''
  });

  useEffect(() => {
    fetchTenants();
  }, []);

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

  const fetchWidgets = async (tenantId?: number) => {
    try {
      const url = tenantId 
        ? `${API_BASE_URL}/api/admin/widgets?tenant_id=${tenantId}`
        : `${API_BASE_URL}/api/admin/widgets`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setWidgets(data);
      } else {
        toast.error('Failed to fetch widgets');
      }
    } catch (error) {
      toast.error('Error fetching widgets');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/widgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tenant_id: parseInt(formData.tenant_id),
          span: parseInt(formData.span),
          position_x: parseInt(formData.position_x),
          position_y: parseInt(formData.position_y),
          size_width: parseInt(formData.size_width),
          size_height: parseInt(formData.size_height)
        }),
      });

      if (response.ok) {
        toast.success('Widget created successfully');
        setCreateDialogOpen(false);
        resetForm();
        if (selectedTenant) {
          fetchWidgets(parseInt(selectedTenant));
        }
      } else {
        toast.error('Failed to create widget');
      }
    } catch (error) {
      toast.error('Error creating widget');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWidget) return;

    try {
      const { tenant_id, ...updateData } = formData;
      const response = await fetch(`${API_BASE_URL}/api/admin/widgets/${selectedWidget.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updateData,
          span: parseInt(updateData.span),
          position_x: parseInt(updateData.position_x),
          position_y: parseInt(updateData.position_y),
          size_width: parseInt(updateData.size_width),
          size_height: parseInt(updateData.size_height)
        }),
      });

      if (response.ok) {
        toast.success('Widget updated successfully');
        setEditDialogOpen(false);
        setSelectedWidget(null);
        if (selectedTenant) {
          fetchWidgets(parseInt(selectedTenant));
        }
      } else {
        toast.error('Failed to update widget');
      }
    } catch (error) {
      toast.error('Error updating widget');
    }
  };

  const handleDelete = async (widgetId: number) => {
    if (!confirm('Are you sure you want to delete this widget?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/widgets/${widgetId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Widget deleted successfully');
        if (selectedTenant) {
          fetchWidgets(parseInt(selectedTenant));
        }
      } else {
        toast.error('Failed to delete widget');
      }
    } catch (error) {
      toast.error('Error deleting widget');
    }
  };

  const openEditDialog = (widget: Widget) => {
    setSelectedWidget(widget);
    setFormData({
      tenant_id: widget.tenant_id.toString(),
      dashboard: widget.dashboard,
      title: widget.title,
      type: widget.type,
      span: widget.span.toString(),
      position_x: widget.position_x.toString(),
      position_y: widget.position_y.toString(),
      size_width: widget.size_width.toString(),
      size_height: widget.size_height.toString(),
      sql_query: widget.sql_query
    });
    setEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      tenant_id: '',
      dashboard: '',
      title: '',
      type: '',
      span: '1',
      position_x: '0',
      position_y: '0',
      size_width: '4',
      size_height: '4',
      sql_query: ''
    });
  };

  const getTenantName = (tenantId: number) => {
    const tenant = tenants.find(t => t.tenant_id === tenantId);
    return tenant ? tenant.name : 'Unknown';
  };

  const handleTenantFilter = (tenantId: string) => {
    setSelectedTenant(tenantId);
    if (tenantId) {
      fetchWidgets(parseInt(tenantId));
    } else {
      setWidgets([]);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Widget Management</h1>
            <p className="text-muted-foreground">Manage widgets for tenant dashboards</p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Widget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Widget</DialogTitle>
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
                        {dashboardTypes.map((dashboard) => (
                          <SelectItem key={dashboard} value={dashboard}>
                            {dashboard.charAt(0).toUpperCase() + dashboard.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Widget Type</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {widgetTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Sales Chart"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="span">Span</Label>
                    <Input
                      id="span"
                      type="number"
                      value={formData.span}
                      onChange={(e) => setFormData({ ...formData, span: e.target.value })}
                      min="1"
                      max="12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="position_x">Position X</Label>
                    <Input
                      id="position_x"
                      type="number"
                      value={formData.position_x}
                      onChange={(e) => setFormData({ ...formData, position_x: e.target.value })}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="position_y">Position Y</Label>
                    <Input
                      id="position_y"
                      type="number"
                      value={formData.position_y}
                      onChange={(e) => setFormData({ ...formData, position_y: e.target.value })}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="size_width">Width</Label>
                    <Input
                      id="size_width"
                      type="number"
                      value={formData.size_width}
                      onChange={(e) => setFormData({ ...formData, size_width: e.target.value })}
                      min="1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="size_height">Height</Label>
                  <Input
                    id="size_height"
                    type="number"
                    value={formData.size_height}
                    onChange={(e) => setFormData({ ...formData, size_height: e.target.value })}
                    min="1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="sql_query">SQL Query</Label>
                  <Textarea
                    id="sql_query"
                    value={formData.sql_query}
                    onChange={(e) => setFormData({ ...formData, sql_query: e.target.value })}
                    placeholder="SELECT * FROM table WHERE condition"
                    className="h-32"
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="gradient">Create</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 items-center">
          <Label htmlFor="tenant-filter">Select Tenant to View Widgets:</Label>
          <Select value={selectedTenant} onValueChange={handleTenantFilter}>
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
                <Grid3x3 className="h-5 w-5" />
                Widgets for {getTenantName(parseInt(selectedTenant))}
              </CardTitle>
              <CardDescription>Manage widgets for this tenant</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Dashboard</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Span</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>SQL Query</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {widgets.map((widget) => (
                    <TableRow key={widget.id}>
                      <TableCell className="font-medium">{widget.title}</TableCell>
                      <TableCell className="capitalize">{widget.dashboard}</TableCell>
                      <TableCell className="capitalize">{widget.type}</TableCell>
                      <TableCell>{widget.span}</TableCell>
                      <TableCell>{widget.position_x}, {widget.position_y}</TableCell>
                      <TableCell>{widget.size_width} x {widget.size_height}</TableCell>
                      <TableCell className="max-w-xs truncate" title={widget.sql_query}>
                        {widget.sql_query}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(widget)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(widget.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {widgets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No widgets found for this tenant
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Widget</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="edit_title">Title</Label>
                <Input
                  id="edit_title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit_type">Widget Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {widgetTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="edit_span">Span</Label>
                  <Input
                    id="edit_span"
                    type="number"
                    value={formData.span}
                    onChange={(e) => setFormData({ ...formData, span: e.target.value })}
                    min="1"
                    max="12"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_position_x">Position X</Label>
                  <Input
                    id="edit_position_x"
                    type="number"
                    value={formData.position_x}
                    onChange={(e) => setFormData({ ...formData, position_x: e.target.value })}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_position_y">Position Y</Label>
                  <Input
                    id="edit_position_y"
                    type="number"
                    value={formData.position_y}
                    onChange={(e) => setFormData({ ...formData, position_y: e.target.value })}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_size_width">Width</Label>
                  <Input
                    id="edit_size_width"
                    type="number"
                    value={formData.size_width}
                    onChange={(e) => setFormData({ ...formData, size_width: e.target.value })}
                    min="1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit_size_height">Height</Label>
                <Input
                  id="edit_size_height"
                  type="number"
                  value={formData.size_height}
                  onChange={(e) => setFormData({ ...formData, size_height: e.target.value })}
                  min="1"
                />
              </div>
              
              <div>
                <Label htmlFor="edit_sql_query">SQL Query</Label>
                <Textarea
                  id="edit_sql_query"
                  value={formData.sql_query}
                  onChange={(e) => setFormData({ ...formData, sql_query: e.target.value })}
                  className="h-32"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gradient">Update</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}