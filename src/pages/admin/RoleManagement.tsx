import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Shield } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';

interface Role {
  role_id: number;
  name: string;
}

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/roles`);
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      } else {
        toast.error('Failed to fetch roles');
      }
    } catch (error) {
      toast.error('Error fetching roles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Role created successfully');
        setCreateDialogOpen(false);
        setFormData({ name: '' });
        fetchRoles();
      } else {
        toast.error('Failed to create role');
      }
    } catch (error) {
      toast.error('Error creating role');
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
            <h1 className="text-3xl font-bold">Role Management</h1>
            <p className="text-muted-foreground">Manage user roles and permissions</p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Manager, Viewer, Editor"
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roles
            </CardTitle>
            <CardDescription>Manage all roles in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.role_id}>
                    <TableCell>{role.role_id}</TableCell>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>
                      {role.name === 'Admin' && 'Full system access and administration privileges'}
                      {role.name === 'User' && 'Standard user access to assigned modules'}
                      {role.name === 'Manager' && 'Management access with additional permissions'}
                      {!['Admin', 'User', 'Manager'].includes(role.name) && 'Custom role with specific permissions'}
                    </TableCell>
                  </TableRow>
                ))}
                {roles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No roles found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>Current role permission structure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-primary mb-2">Admin</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Full system access</li>
                    <li>• User management</li>
                    <li>• Tenant management</li>
                    <li>• KPI configuration</li>
                    <li>• Widget management</li>
                    <li>• Role management</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-primary mb-2">Manager</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Dashboard access</li>
                    <li>• Report generation</li>
                    <li>• Analytics viewing</li>
                    <li>• Team management</li>
                    <li>• Limited configuration</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-primary mb-2">User</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Dashboard viewing</li>
                    <li>• Report access</li>
                    <li>• Personal settings</li>
                    <li>• Basic analytics</li>
                    <li>• Read-only access</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}