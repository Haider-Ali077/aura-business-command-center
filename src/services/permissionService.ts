import { API_BASE_URL } from '@/config/api';

export interface User {
  user_id: number;
  user_name: string;
  email: string;
  role_name: string;
  tenant_id: number;
  tenant_name: string;
  is_active: boolean;
}

export interface TablePermission {
  user_id: number;
  user_name: string;
  table_name: string;
  allow_bit: boolean;
}

export interface SalesPermission {
  id?: number;
  user_id: number;
  user_name: string;
  sales_employee_code?: string | null;
  ship_to_city?: string | null;
  ship_to_state?: string | null;
  ship_to_country?: string | null;
  product_id?: string | null;
  tenant_id: number;
}

export interface PurchasePermission {
  id?: number;
  user_id: number;
  user_name: string;
  purchase_employee_code?: string | null;
  product_id?: string | null;
  tenant_id: number;
}

export interface InventoryPermission {
  id?: number;
  user_id: number;
  user_name: string;
  product_id?: string | null;
  warehouse_id?: string | null;
  tenant_id: number;
}

export interface Employee {
  code: string;
  name: string;
}

export interface Location {
  cities: string[];
  states: string[];
  countries: string[];
}

class PermissionService {
  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // User Management
  async getUsersForTenant(tenantId: number): Promise<{ users: User[] }> {
    return this.request(`/api/users/${tenantId}`);
  }

  // Table-Level Permissions
  async getTablePermissions(userId: number): Promise<{ permissions: TablePermission[] }> {
    return this.request(`/api/permissions/table-permissions/${userId}`);
  }

  async syncTablePermissions(data: {
    user_id: number;
    user_name: string;
    new_role: string;
    tenant_id: number;
  }): Promise<{
    success: boolean;
    message: string;
    permissions_added: { table_name: string; allow_bit: boolean }[];
    permissions_removed: { table_name: string }[];
  }> {
    return this.request('/api/permissions/sync-table-permissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Sales Permissions
  async getSalesPermissions(userId: number, tenantId?: number): Promise<{ permissions: SalesPermission[] }> {
    const params = tenantId ? `?tenant_id=${tenantId}` : '';
    return this.request(`/api/permissions/sales-permissions/${userId}${params}`);
  }

  async createSalesPermission(data: SalesPermission): Promise<{ success: boolean; permission_id: number; message: string }> {
    return this.request('/api/permissions/sales-permissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSalesPermission(permissionId: number, data: SalesPermission): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/permissions/sales-permissions/${permissionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSalesPermission(permissionId: number, tenantId?: number): Promise<{ success: boolean; message: string }> {
    const params = tenantId ? `?tenant_id=${tenantId}` : '';
    return this.request(`/api/permissions/sales-permissions/${permissionId}${params}`, {
      method: 'DELETE',
    });
  }

  // Purchase Permissions
  async getPurchasePermissions(userId: number, tenantId?: number): Promise<{ permissions: PurchasePermission[] }> {
    const params = tenantId ? `?tenant_id=${tenantId}` : '';
    return this.request(`/api/permissions/purchase-permissions/${userId}${params}`);
  }

  async createPurchasePermission(data: PurchasePermission): Promise<{ success: boolean; permission_id: number; message: string }> {
    return this.request('/api/permissions/purchase-permissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePurchasePermission(permissionId: number, data: PurchasePermission): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/permissions/purchase-permissions/${permissionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePurchasePermission(permissionId: number, tenantId?: number): Promise<{ success: boolean; message: string }> {
    const params = tenantId ? `?tenant_id=${tenantId}` : '';
    return this.request(`/api/permissions/purchase-permissions/${permissionId}${params}`, {
      method: 'DELETE',
    });
  }

  // Inventory Permissions
  async getInventoryPermissions(userId: number, tenantId?: number): Promise<{ permissions: InventoryPermission[] }> {
    const params = tenantId ? `?tenant_id=${tenantId}` : '';
    return this.request(`/api/permissions/inventory-permissions/${userId}${params}`);
  }

  async createInventoryPermission(data: InventoryPermission): Promise<{ success: boolean; permission_id: number; message: string }> {
    return this.request('/api/permissions/inventory-permissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInventoryPermission(permissionId: number, data: InventoryPermission): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/permissions/inventory-permissions/${permissionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInventoryPermission(permissionId: number, tenantId?: number): Promise<{ success: boolean; message: string }> {
    const params = tenantId ? `?tenant_id=${tenantId}` : '';
    return this.request(`/api/permissions/inventory-permissions/${permissionId}${params}`, {
      method: 'DELETE',
    });
  }

  // Metadata
  async getSalesEmployees(tenant: string, userId: number): Promise<{ employees: Employee[] }> {
    return this.request(`/api/metadata/sales-employees/${tenant}/${userId}`);
  }

  async getPurchaseEmployees(tenant: string, userId: number): Promise<{ employees: Employee[] }> {
    return this.request(`/api/metadata/purchase-employees/${tenant}/${userId}`);
  }

  async getProducts(tenant: string, userId: number): Promise<{ products: string[] }> {
    return this.request(`/api/metadata/products/${tenant}/${userId}`);
  }

  async getWarehouses(tenant: string, userId: number): Promise<{ warehouses: string[] }> {
    return this.request(`/api/metadata/warehouses/${tenant}/${userId}`);
  }

  async getLocations(tenant: string, userId: number): Promise<{ locations: Location }> {
    return this.request(`/api/metadata/locations/${tenant}/${userId}`);
  }

  // Bulk Operations
  async bulkDeletePermissions(data: {
    user_id: number;
    permission_types: string[];
    tenant_id?: number;
  }): Promise<{
    success: boolean;
    deleted_counts: Record<string, number>;
  }> {
    return this.request('/api/permissions/bulk-delete', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const permissionService = new PermissionService();