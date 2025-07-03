
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Upload, File, Trash2, Download, RefreshCw, Moon, Sun } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { useTheme } from "next-themes";

interface Document {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  type: string;
  uploadedBy: string;
}

const Settings = () => {
  const { session } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch documents on component mount
  useEffect(() => {
    if (session) {
      fetchDocuments();
    }
  }, [session]);

  const fetchDocuments = async () => {
    if (!session) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/documents`, {
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'X-User-ID': session.user.user_id.toString(),
          'X-Tenant-ID': session.user.tenant_id.toString(),
          'X-Role-ID': session.user.role_id.toString(),
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
        },
        {
          id: '2',
          name: 'Financial_Report_Q1.xlsx',
          size: '1.8 MB',
          uploadDate: '2024-01-14',
          type: 'Financial Report',
          uploadedBy: 'user@company.com',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && session) {
      setIsLoading(true);
      try {
        const formData = new FormData();
        Array.from(files).forEach(file => {
          formData.append('files', file);
        });
        formData.append('tenantId', session.user.tenant_id.toString());
        formData.append('uploadedBy', session.user.email);

        const response = await fetch(`http://localhost:8000/api/documents/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.token}`,
            'X-User-ID': session.user.user_id.toString(),
            'X-Tenant-ID': session.user.tenant_id.toString(),
            'X-Role-ID': session.user.role_id.toString(),
          },
          body: formData,
        });

        if (response.ok) {
          toast.success("Documents uploaded successfully");
          fetchDocuments();
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
    try {
      const response = await fetch(`http://localhost:8000/api/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'X-User-ID': session?.user.user_id.toString() || '',
          'X-Tenant-ID': session?.user.tenant_id.toString() || '',
          'X-Role-ID': session?.user.role_id.toString() || '',
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

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.token}`,
          'X-User-ID': session?.user.user_id.toString() || '',
          'X-Tenant-ID': session?.user.tenant_id.toString() || '',
          'X-Role-ID': session?.user.role_id.toString() || '',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        toast.success("Password changed successfully");
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error("Failed to change password");
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error("Error changing password");
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!session) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Please log in to access settings.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            Manage your documents, appearance, and account settings
          </p>
        </div>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-lg md:text-xl">Document Management</CardTitle>
                <p className="text-gray-600 text-sm md:text-base">
                  Upload and manage your business documents
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDocuments}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden md:inline ml-1">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
              {documents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No documents available.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Appearance</CardTitle>
            <p className="text-gray-600 text-sm md:text-base">Customize how the app looks</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <div>
                  <h4 className="font-medium">Dark Mode</h4>
                  <p className="text-sm text-gray-600">Switch between light and dark themes</p>
                </div>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Change Password</CardTitle>
            <p className="text-gray-600 text-sm md:text-base">Update your account password</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                placeholder="Confirm new password"
              />
            </div>
            <Button 
              onClick={handlePasswordChange}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            >
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
