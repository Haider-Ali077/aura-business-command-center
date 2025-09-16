import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserX, Plus, Edit } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';

interface User {
  user_id: number;
  email: string;
  tenant_id: number;
  role_id: number;
  is_active: boolean;
  created_at: string;
  user_name: string | null;
}

interface Tenant {
  tenant_id: number;
  name: string;
}

interface Role {
  role_id: number;
  name: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    email: '',
    password_hash: '',
    tenant_id: null as number | null,
    role_id: 2, // Default to regular user role
    is_active: true,
    user_name: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchTenants();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedTenantFilter === 'all') {
      fetchUsers();
    } else {
      fetchUsersByTenant(parseInt(selectedTenantFilter));
    }
  }, [selectedTenantFilter]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      toast.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersByTenant = async (tenantId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users?tenant_id=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      toast.error('Error fetching users');
    }
  };

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
    }
  };

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
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('User created successfully');
        setCreateDialogOpen(false);
        setFormData({
          email: '',
          password_hash: '',
          tenant_id: null,
          role_id: 2,
          is_active: true,
          user_name: ''
        });
        fetchUsers();
      } else {
        toast.error('Failed to create user');
      }
    } catch (error) {
      toast.error('Error creating user');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    // Create clean payload with proper validation
    const cleanPayload: any = {};
    
    // Handle email - include if it's a non-empty string
    if (formData.email && formData.email.trim()) {
      cleanPayload.email = formData.email.trim();
    }
    
    // Handle user_name - include even if empty string (backend might expect it)
    if (formData.user_name !== null && formData.user_name !== undefined) {
      cleanPayload.user_name = formData.user_name.trim();
    }
    
    // Handle role_id - include if it's a valid number
    if (formData.role_id !== null && formData.role_id !== undefined) {
      cleanPayload.role_id = formData.role_id;
    }
    
    // Always include is_active
    cleanPayload.is_active = formData.is_active;
    
    // Debug logging
    console.log('Update payload for user', selectedUser.user_id, ':', cleanPayload);
    console.log('Original formData:', formData);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${selectedUser.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanPayload),
      });

      if (response.ok) {
        toast.success('User updated successfully');
        setEditDialogOpen(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        // Get detailed error information
        const errorData = await response.text();
        console.error('Update failed with status:', response.status);
        console.error('Error response:', errorData);
        toast.error(`Failed to update user: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Network error during update:', error);
      toast.error('Error updating user');
    }
  };

  const handleDeactivate = async (userId: number) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('User deactivated successfully');
        fetchUsers();
      } else {
        toast.error('Failed to deactivate user');
      }
    } catch (error) {
      toast.error('Error deactivating user');
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password_hash: '', // Don't populate password
      tenant_id: user.tenant_id,
      role_id: user.role_id,
      is_active: user.is_active,
      user_name: user.user_name || ''
    });
    setEditDialogOpen(true);
  };

  const getTenantName = (tenantId: number) => {
    const tenant = tenants.find(t => t.tenant_id === tenantId);
    return tenant ? tenant.name : 'Unknown';
  };

  const getRoleName = (roleId: number) => {
    const role = roles.find(r => r.role_id === roleId);
    return role ? role.name : 'Unknown';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <Layout>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage tenant users and their permissions</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="user_name">Full Name</Label>
                <Input
                  id="user_name"
                  value={formData.user_name}
                  onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password_hash">Password Hash</Label>
                <Input
                  id="password_hash"
                  type="password"
                  value={formData.password_hash}
                  onChange={(e) => setFormData({ ...formData, password_hash: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="tenant_id">Tenant</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, tenant_id: parseInt(value) })}>
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
                <Label htmlFor="role_id">Role</Label>
                <Select value={formData.role_id?.toString()} onValueChange={(value) => setFormData({ ...formData, role_id: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.role_id} value={role.role_id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
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
        <Label htmlFor="tenant-filter">Filter by Tenant:</Label>
        <Select value={selectedTenantFilter} onValueChange={setSelectedTenantFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tenants</SelectItem>
            {tenants.map((tenant) => (
              <SelectItem key={tenant.tenant_id} value={tenant.tenant_id.toString()}>
                {tenant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage all users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>{user.user_id}</TableCell>
                  <TableCell className="font-medium">{user.user_name || 'N/A'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getTenantName(user.tenant_id)}</TableCell>
                  <TableCell>{getRoleName(user.role_id)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeactivate(user.user_id)}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="edit_user_name">Full Name</Label>
              <Input
                id="edit_user_name"
                value={formData.user_name}
                onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_role_id">Role</Label>
              <Select value={formData.role_id?.toString()} onValueChange={(value) => setFormData({ ...formData, role_id: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.role_id} value={role.role_id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit_is_active">Active</Label>
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