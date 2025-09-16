import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Shield, 
  Database, 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  Trash2, 
  Plus,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { 
  permissionService, 
  User as UserType, 
  SalesPermission, 
  PurchasePermission, 
  InventoryPermission,
  Employee,
  Location
} from '@/services/permissionService';

export default function PermissionManagement() {
  const { session } = useAuthStore();
  const { toast } = useToast();
  
  // State
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Permission states
  const [tablePermissions, setTablePermissions] = useState<any[]>([]);
  const [salesPermissions, setSalesPermissions] = useState<SalesPermission[]>([]);
  const [purchasePermissions, setPurchasePermissions] = useState<PurchasePermission[]>([]);
  const [inventoryPermissions, setInventoryPermissions] = useState<InventoryPermission[]>([]);
  
  // Metadata states
  const [salesEmployees, setSalesEmployees] = useState<Employee[]>([]);
  const [purchaseEmployees, setPurchaseEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [warehouses, setWarehouses] = useState<string[]>([]);
  const [locations, setLocations] = useState<Location>({ cities: [], states: [], countries: [] });
  
  // Form states
  const [newSalesPermission, setNewSalesPermission] = useState<Partial<SalesPermission>>({});
  const [newPurchasePermission, setNewPurchasePermission] = useState<Partial<PurchasePermission>>({});  
  const [newInventoryPermission, setNewInventoryPermission] = useState<Partial<InventoryPermission>>({});

  // Load users for current tenant
  useEffect(() => {
    if (session?.user?.tenant_id) {
      loadUsers();
    }
  }, [session?.user?.tenant_id]);

  // Load permissions and metadata when user is selected
  useEffect(() => {
    if (selectedUser) {
      loadUserPermissions();
      loadMetadata();
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await permissionService.getUsersForTenant(session!.user!.tenant_id!);
      setUsers(response.users);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserPermissions = async () => {
    if (!selectedUser) return;
    
    try {
      const [tableResp, salesResp, purchaseResp, inventoryResp] = await Promise.all([
        permissionService.getTablePermissions(selectedUser.user_id),
        permissionService.getSalesPermissions(selectedUser.user_id, selectedUser.tenant_id),
        permissionService.getPurchasePermissions(selectedUser.user_id, selectedUser.tenant_id),
        permissionService.getInventoryPermissions(selectedUser.user_id, selectedUser.tenant_id)
      ]);
      
      setTablePermissions(tableResp.permissions);
      setSalesPermissions(salesResp.permissions);
      setPurchasePermissions(purchaseResp.permissions);
      setInventoryPermissions(inventoryResp.permissions);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load user permissions',
        variant: 'destructive',
      });
    }
  };

  const loadMetadata = async () => {
    if (!selectedUser || !session?.user?.tenant_id) return;
    
    try {
      const tenantName = selectedUser.tenant_name;
      const userId = session.user.user_id!;
      
      const [salesEmpResp, purchaseEmpResp, productsResp, warehousesResp, locationsResp] = await Promise.all([
        permissionService.getSalesEmployees(tenantName, userId),
        permissionService.getPurchaseEmployees(tenantName, userId),
        permissionService.getProducts(tenantName, userId),
        permissionService.getWarehouses(tenantName, userId),
        permissionService.getLocations(tenantName, userId)
      ]);
      
      setSalesEmployees(salesEmpResp.employees);
      setPurchaseEmployees(purchaseEmpResp.employees);
      setProducts(productsResp.products);
      setWarehouses(warehousesResp.warehouses);
      setLocations(locationsResp.locations);
    } catch (error) {
      console.error('Failed to load metadata:', error);
    }
  };

  const handleSyncTablePermissions = async () => {
    if (!selectedUser) return;
    
    try {
      await permissionService.syncTablePermissions({
        user_id: selectedUser.user_id,
        user_name: selectedUser.user_name,
        new_role: selectedUser.role_name,
        tenant_id: selectedUser.tenant_id
      });
      
      toast({
        title: 'Success',
        description: 'Table permissions synced successfully',
      });
      
      loadUserPermissions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sync table permissions',
        variant: 'destructive',
      });
    }
  };

  const createSalesPermission = async () => {
    if (!selectedUser || !newSalesPermission) return;
    
    try {
      await permissionService.createSalesPermission({
        user_id: selectedUser.user_id,
        user_name: selectedUser.user_name,
        tenant_id: selectedUser.tenant_id,
        ...newSalesPermission
      } as SalesPermission);
      
      toast({
        title: 'Success',
        description: 'Sales permission created successfully',
      });
      
      setNewSalesPermission({});
      loadUserPermissions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create sales permission',
        variant: 'destructive',
      });
    }
  };

  const deleteSalesPermission = async (permissionId: number) => {
    if (!selectedUser) return;
    
    try {
      await permissionService.deleteSalesPermission(permissionId, selectedUser.tenant_id);
      toast({
        title: 'Success',
        description: 'Sales permission deleted successfully',
      });
      loadUserPermissions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete sales permission',
        variant: 'destructive',
      });
    }
  };

  const createPurchasePermission = async () => {
    if (!selectedUser || !newPurchasePermission) return;
    
    try {
      await permissionService.createPurchasePermission({
        user_id: selectedUser.user_id,
        user_name: selectedUser.user_name,
        tenant_id: selectedUser.tenant_id,
        ...newPurchasePermission
      } as PurchasePermission);
      
      toast({
        title: 'Success',
        description: 'Purchase permission created successfully',
      });
      
      setNewPurchasePermission({});
      loadUserPermissions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create purchase permission',
        variant: 'destructive',
      });
    }
  };

  const deletePurchasePermission = async (permissionId: number) => {
    if (!selectedUser) return;
    
    try {
      await permissionService.deletePurchasePermission(permissionId, selectedUser.tenant_id);
      toast({
        title: 'Success',
        description: 'Purchase permission deleted successfully',
      });
      loadUserPermissions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete purchase permission',
        variant: 'destructive',
      });
    }
  };

  const createInventoryPermission = async () => {
    if (!selectedUser || !newInventoryPermission) return;
    
    try {
      await permissionService.createInventoryPermission({
        user_id: selectedUser.user_id,
        user_name: selectedUser.user_name,
        tenant_id: selectedUser.tenant_id,
        ...newInventoryPermission
      } as InventoryPermission);
      
      toast({
        title: 'Success',
        description: 'Inventory permission created successfully',
      });
      
      setNewInventoryPermission({});
      loadUserPermissions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create inventory permission',
        variant: 'destructive',
      });
    }
  };

  const deleteInventoryPermission = async (permissionId: number) => {
    if (!selectedUser) return;
    
    try {
      await permissionService.deleteInventoryPermission(permissionId, selectedUser.tenant_id);
      toast({
        title: 'Success',
        description: 'Inventory permission deleted successfully',
      });
      loadUserPermissions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete inventory permission',
        variant: 'destructive',
      });
    }
  };

  const getRoleDashboardAccess = (role: string) => {
    const dashboardAccess = {
      'Sales user': ['Sales'],
      'Purchase user': ['Purchase'],
      'Inventory user': ['Inventory'],
      'Sales/Purchase user': ['Sales', 'Purchase'],
      'Sales/Inventory user': ['Sales', 'Inventory'],
      'Purchase/Inventory user': ['Purchase', 'Inventory'],
      'CEO': ['Sales', 'Purchase', 'Inventory'],
      'Finance Manager': ['Sales', 'Purchase', 'Inventory'],
      'CFO': ['Finance', 'HR'],
      'Admin': ['Executive']
    };
    return dashboardAccess[role as keyof typeof dashboardAccess] || [];
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Permission Management</h1>
          <p className="text-muted-foreground">
            Manage user access permissions and data restrictions
          </p>
        </div>

        {/* User Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Select User
            </CardTitle>
            <CardDescription>
              Choose a user to manage their permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="user-select">User</Label>
                <Select onValueChange={(value) => {
                  const user = users.find(u => u.user_id.toString() === value);
                  setSelectedUser(user || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id.toString()}>
                        {user.user_name} ({user.role_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedUser && (
                <div className="space-y-2">
                  <Label>User Information</Label>
                  <div className="space-y-1">
                    <p className="text-sm"><strong>Email:</strong> {selectedUser.email}</p>
                    <p className="text-sm"><strong>Role:</strong> {selectedUser.role_name}</p>
                    <p className="text-sm"><strong>Tenant:</strong> {selectedUser.tenant_name}</p>
                    <div className="flex gap-1 flex-wrap">
                      <strong className="text-sm">Dashboard Access:</strong>
                      {getRoleDashboardAccess(selectedUser.role_name).map(dashboard => (
                        <Badge key={dashboard} variant="secondary">{dashboard}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedUser && (
          <Tabs defaultValue="table" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="table" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Table Access
              </TabsTrigger>
              <TabsTrigger value="sales" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Sales Restrictions
              </TabsTrigger>
              <TabsTrigger value="purchase" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Purchase Restrictions
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Inventory Restrictions
              </TabsTrigger>
            </TabsList>

            {/* Table-Level Permissions */}
            <TabsContent value="table">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Table-Level Permissions
                  </CardTitle>
                  <CardDescription>
                    Control which database tables this user can access based on their role
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Table permissions are automatically managed based on user roles and dashboard access. 
                      Users with access to all dashboards (CEO, Finance Manager) have unrestricted table access.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Current Table Permissions</h4>
                      <p className="text-sm text-muted-foreground">
                        {tablePermissions.length === 0 
                          ? "No table restrictions (full access)" 
                          : `${tablePermissions.length} table restrictions active`}
                      </p>
                    </div>
                    <Button onClick={handleSyncTablePermissions}>
                      Sync with Role
                    </Button>
                  </div>
                  
                  {tablePermissions.length > 0 && (
                    <div className="space-y-2">
                      {tablePermissions.map((perm, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="font-mono text-sm">{perm.table_name}</span>
                          <Badge variant={perm.allow_bit ? "default" : "destructive"}>
                            {perm.allow_bit ? "Allowed" : "Denied"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sales Restrictions */}
            <TabsContent value="sales">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Sales Data Restrictions
                  </CardTitle>
                  <CardDescription>
                    Limit sales data access by employee, location, or product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add New Sales Permission */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h4 className="font-medium">Add Sales Restriction</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Sales Employee</Label>
                        <Select onValueChange={(value) => 
                          setNewSalesPermission(prev => ({ ...prev, sales_employee_code: value === 'all' ? null : value }))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="All employees" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Employees</SelectItem>
                            {salesEmployees.map((emp) => (
                              <SelectItem key={emp.code} value={emp.code}>
                                {emp.name} ({emp.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>City</Label>
                        <Select onValueChange={(value) => 
                          setNewSalesPermission(prev => ({ ...prev, ship_to_city: value === 'all' ? null : value }))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="All cities" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Cities</SelectItem>
                            {locations.cities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Product</Label>
                        <Select onValueChange={(value) => 
                          setNewSalesPermission(prev => ({ ...prev, product_id: value === 'all' ? null : value }))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="All products" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Products</SelectItem>
                            {products.map((product) => (
                              <SelectItem key={product} value={product}>
                                {product}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={createSalesPermission} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Restriction
                    </Button>
                  </div>

                  {/* Current Sales Permissions */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Current Sales Restrictions</h4>
                    {salesPermissions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No sales restrictions (full access)</p>
                    ) : (
                      salesPermissions.map((perm) => (
                        <div key={perm.id} className="flex justify-between items-center p-3 border rounded">
                          <div className="space-y-1">
                            <div className="flex gap-2 flex-wrap">
                              {perm.sales_employee_code && (
                                <Badge variant="outline">Employee: {perm.sales_employee_code}</Badge>
                              )}
                              {perm.ship_to_city && (
                                <Badge variant="outline">City: {perm.ship_to_city}</Badge>
                              )}
                              {perm.product_id && (
                                <Badge variant="outline">Product: {perm.product_id}</Badge>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteSalesPermission(perm.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Similar patterns for Purchase and Inventory tabs... */}
            <TabsContent value="purchase">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Purchase Data Restrictions
                  </CardTitle>
                  <CardDescription>
                    Limit purchase data access by employee or product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add New Purchase Permission */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h4 className="font-medium">Add Purchase Restriction</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Purchase Employee</Label>
                        <Select onValueChange={(value) => 
                          setNewPurchasePermission(prev => ({ ...prev, purchase_employee_code: value === 'all' ? null : value }))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="All employees" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Employees</SelectItem>
                            {purchaseEmployees.map((emp) => (
                              <SelectItem key={emp.code} value={emp.code}>
                                {emp.name} ({emp.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Product</Label>
                        <Select onValueChange={(value) => 
                          setNewPurchasePermission(prev => ({ ...prev, product_id: value === 'all' ? null : value }))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="All products" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Products</SelectItem>
                            {products.map((product) => (
                              <SelectItem key={product} value={product}>
                                {product}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={createPurchasePermission} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Restriction
                    </Button>
                  </div>

                  {/* Current Purchase Permissions */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Current Purchase Restrictions</h4>
                    {purchasePermissions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No purchase restrictions (full access)</p>
                    ) : (
                      purchasePermissions.map((perm) => (
                        <div key={perm.id} className="flex justify-between items-center p-3 border rounded">
                          <div className="space-y-1">
                            <div className="flex gap-2 flex-wrap">
                              {perm.purchase_employee_code && (
                                <Badge variant="outline">Employee: {perm.purchase_employee_code}</Badge>
                              )}
                              {perm.product_id && (
                                <Badge variant="outline">Product: {perm.product_id}</Badge>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deletePurchasePermission(perm.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Inventory Data Restrictions
                  </CardTitle>
                  <CardDescription>
                    Limit inventory data access by product or warehouse
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add New Inventory Permission */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h4 className="font-medium">Add Inventory Restriction</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Product</Label>
                        <Select onValueChange={(value) => 
                          setNewInventoryPermission(prev => ({ ...prev, product_id: value === 'all' ? null : value }))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="All products" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Products</SelectItem>
                            {products.map((product) => (
                              <SelectItem key={product} value={product}>
                                {product}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Warehouse</Label>
                        <Select onValueChange={(value) => 
                          setNewInventoryPermission(prev => ({ ...prev, warehouse_id: value === 'all' ? null : value }))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="All warehouses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Warehouses</SelectItem>
                            {warehouses.map((warehouse) => (
                              <SelectItem key={warehouse} value={warehouse}>
                                {warehouse}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={createInventoryPermission} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Restriction
                    </Button>
                  </div>

                  {/* Current Inventory Permissions */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Current Inventory Restrictions</h4>
                    {inventoryPermissions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No inventory restrictions (full access)</p>
                    ) : (
                      inventoryPermissions.map((perm) => (
                        <div key={perm.id} className="flex justify-between items-center p-3 border rounded">
                          <div className="space-y-1">
                            <div className="flex gap-2 flex-wrap">
                              {perm.product_id && (
                                <Badge variant="outline">Product: {perm.product_id}</Badge>
                              )}
                              {perm.warehouse_id && (
                                <Badge variant="outline">Warehouse: {perm.warehouse_id}</Badge>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteInventoryPermission(perm.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
}