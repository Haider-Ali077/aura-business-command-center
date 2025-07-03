
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, File, Trash2, Download, RefreshCw } from "lucide-react";
import { useTenantStore } from "@/store/tenantStore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

interface Document {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  type: string;
  uploadedBy: string;
  tenantId: string;
}

interface UserRole {
  canUpload: boolean;
  canDelete: boolean;
  canView: boolean;
}

const Settings = () => {
  const { currentSession } = useTenantStore();
  const { session } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [userRole, setUserRole] = useState<UserRole>({
    canUpload: false,
    canDelete: false,
    canView: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const [settings, setSettings] = useState({
    aiEnabled: true,
    notificationsEnabled: true,
    autoReports: false,
    dataRetention: '12',
    companyName: currentSession?.tenantInfo.name || 'Your Company Name',
    email: session?.user.email || 'admin@company.com'
  });

  // Fetch user role and documents on component mount
  useEffect(() => {
    if (currentSession) {
      fetchUserRole();
      fetchTenantDocuments();
    }
  }, [currentSession]);

  const fetchUserRole = async () => {
    try {
      // Dummy API call - replace with actual endpoint
      const response = await fetch(`/api/admin/users/${session?.user.user_id}/role`, {
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'X-Tenant-ID': currentSession?.tenantId.toString() || '',
        },
      });
      
      if (response.ok) {
        const role = await response.json();
        setUserRole(role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      // Set default permissions for demo
      setUserRole({
        canUpload: true,
        canDelete: true,
        canView: true,
      });
    }
  };

  const fetchTenantDocuments = async () => {
    if (!currentSession || !userRole.canView) return;
    
    setIsLoading(true);
    try {
      // Dummy API call - replace with actual endpoint
      const response = await fetch(`/api/tenants/${currentSession.tenantId.toString()}/documents`, {
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'X-Tenant-ID': currentSession.tenantId.toString(),
        },
      });
      
      if (response.ok) {
        const docs = await response.json();
        setDocuments(docs);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      // Set dummy documents for demo
      setDocuments([
        {
          id: '1',
          name: 'Business_Plan_2024.pdf',
          size: '2.4 MB',
          uploadDate: '2024-01-15',
          type: 'Business Document',
          uploadedBy: 'admin@company.com',
          tenantId: currentSession?.tenantId.toString() || '',
        },
        {
          id: '2',
          name: 'Financial_Report_Q1.xlsx',
          size: '1.8 MB',
          uploadDate: '2024-01-14',
          type: 'Financial Report',
          uploadedBy: 'user@company.com',
          tenantId: currentSession?.tenantId.toString() || '',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!userRole.canUpload) {
      toast.error("You don't have permission to upload documents");
      return;
    }

    const files = event.target.files;
    if (files && currentSession) {
      setIsLoading(true);
      try {
        const formData = new FormData();
        Array.from(files).forEach(file => {
          formData.append('files', file);
        });
        formData.append('tenantId', currentSession.tenantId.toString());
        formData.append('uploadedBy', session?.user.email || '');

        // Dummy API call - replace with actual endpoint
        const response = await fetch(`/api/tenants/${currentSession.tenantId.toString()}/documents/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.token}`,
            'X-Tenant-ID': currentSession.tenantId.toString(),
          },
          body: formData,
        });

        if (response.ok) {
          toast.success("Documents uploaded successfully");
          fetchTenantDocuments();
        } else {
          toast.error("Failed to upload documents");
        }
      } catch (error) {
        console.error('Error uploading files:', error);
        toast.error("Error uploading documents");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!userRole.canDelete) {
      toast.error("You don't have permission to delete documents");
      return;
    }

    try {
      // Dummy API call - replace with actual endpoint
      const response = await fetch(`/api/tenants/${currentSession?.tenantId.toString()}/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'X-Tenant-ID': currentSession?.tenantId.toString() || '',
        },
      });

      if (response.ok) {
        setDocuments(documents.filter(doc => doc.id !== id));
        toast.success("Document deleted successfully");
      } else {
        toast.error("Failed to delete document");
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error("Error deleting document");
    }
  };

  const handleRefreshDocuments = () => {
    fetchTenantDocuments();
  };

  if (!currentSession) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Please select a tenant to access settings.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            Manage your application settings and AI knowledge base for {currentSession.tenantInfo.name}
          </p>
        </div>

        <Tabs defaultValue="documents" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-3 text-xs md:text-sm">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="ai">AI Config</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-4 md:space-y-6">
            {userRole.canUpload && (
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg md:text-xl">Upload Business Documents</CardTitle>
                      <p className="text-gray-600 text-sm md:text-base">
                        Upload documents for {currentSession.tenantInfo.name}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshDocuments}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center hover:border-blue-400 transition-colors">
                    <Upload className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">Upload Documents</h3>
                    <p className="text-gray-600 mb-4 text-sm md:text-base">Drag and drop your files here, or click to browse</p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      disabled={isLoading}
                    />
                    <label htmlFor="file-upload">
                      <Button className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                        {isLoading ? "Uploading..." : "Choose Files"}
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Supports PDF, DOC, DOCX, XLS, XLSX, TXT files</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {userRole.canView && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Tenant Documents</CardTitle>
                  <p className="text-gray-600 text-sm md:text-base">
                    Documents available for {currentSession.tenantInfo.name}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border border-gray-200 rounded-lg gap-4">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <File className="h-6 w-6 md:h-8 md:w-8 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                            <p className="text-xs md:text-sm text-gray-600">
                              {doc.size} • {doc.type} • {doc.uploadDate}
                            </p>
                            <p className="text-xs text-gray-500">Uploaded by: {doc.uploadedBy}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                            <span className="hidden md:inline ml-1">Download</span>
                          </Button>
                          {userRole.canDelete && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden md:inline ml-1">Delete</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {documents.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No documents available for this tenant.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {!userRole.canView && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">You don't have permission to view documents.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">AI Assistant Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable AI Assistant</h4>
                    <p className="text-sm text-gray-600">Allow AI to provide insights and recommendations</p>
                  </div>
                  <Switch
                    checked={settings.aiEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, aiEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-generate Reports</h4>
                    <p className="text-sm text-gray-600">Automatically generate weekly summary reports</p>
                  </div>
                  <Switch
                    checked={settings.autoReports}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoReports: checked })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Data Retention (months)</label>
                  <Input
                    value={settings.dataRetention}
                    onChange={(e) => setSettings({ ...settings, dataRetention: e.target.value })}
                    type="number"
                    className="w-32"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name</label>
                  <Input
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Admin Email</label>
                  <Input
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    type="email"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications for important updates</p>
                  </div>
                  <Switch
                    checked={settings.notificationsEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, notificationsEnabled: checked })}
                  />
                </div>

                <div className="pt-4">
                  <Button className="bg-blue-600 hover:bg-blue-700">Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
