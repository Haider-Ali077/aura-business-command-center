
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, File, Trash2, Download, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config/api";
import { checkTenantRag } from "@/utils/tenantRagCheck";

interface Document {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  type: string;
  uploadedBy: string;
}

export function DocumentManagement() {
  const { session } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRagEnabled, setIsRagEnabled] = useState<boolean | null>(null);

  // Check tenant RAG status on mount
  useEffect(() => {
    const checkRagStatus = async () => {
      if (session?.user?.tenant_id) {
        try {
          const isRag = await checkTenantRag(session.user.tenant_id);
          setIsRagEnabled(isRag);
        } catch (error) {
          console.warn("⚠️ Could not check tenant RAG status:", error);
          setIsRagEnabled(false);
        }
      }
    };
    
    checkRagStatus();
  }, [session?.user?.tenant_id]);

  // Fetch documents on component mount
  useEffect(() => {
    if (session && isRagEnabled) {
      fetchDocuments();
    }
  }, [session, isRagEnabled]);

  const fetchDocuments = async () => {
    if (!session) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/documents?tenant_id=${session.user.tenant_id}&user_id=${session.user.user_id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const docs = await response.json();
        console.log('📄 Fetched documents:', docs);
        setDocuments(docs);
      } else {
        console.error('Failed to fetch documents:', response.status);
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    console.log('📄 File upload triggered:', files?.length || 0, 'files');
    
    if (!files || files.length === 0) {
      console.log('⚠️ No files selected');
      return;
    }

    if (!session) {
      toast.error("Please log in to upload documents");
      return;
    }

    if (!isRagEnabled) {
      toast.error("PDF inquiry feature is not activated in your package. Please contact the sales department to enable this feature.");
      return;
    }

    // Filter to only PDF files
    const pdfFiles = Array.from(files).filter(file => file.name.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      toast.error("Please upload PDF files only");
      return;
    }

    console.log(`📊 Uploading ${pdfFiles.length} PDF file(s)...`);
    setIsLoading(true);
    
    // Upload each PDF file individually
    const uploadPromises = pdfFiles.map(async (file) => {
      try {
        console.log(`📤 Uploading: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tenant_id', session.user.tenant_id.toString());
        formData.append('user_id', session.user.user_id.toString());
        if (session.user.tenant_name) {
          formData.append('tenant_name', session.user.tenant_name);
        }

        console.log(`🌐 Sending to: ${API_BASE_URL}/api/documents/upload`);

        const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
          method: 'POST',
          body: formData, // Don't set Content-Type header - browser will set it with boundary
        });

        console.log(`📥 Response status: ${response.status}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }));
          console.error('❌ Upload error:', errorData);
          throw new Error(errorData.detail || `Upload failed with status ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Upload success:', result);
        return { success: true, filename: file.name, result };
      } catch (error) {
        console.error(`❌ Error uploading ${file.name}:`, error);
        return { 
          success: false, 
          filename: file.name, 
          error: error instanceof Error ? error.message : 'Upload failed' 
        };
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successes = results.filter(r => r.success);
      const failures = results.filter(r => !r.success);

      if (successes.length > 0) {
        toast.success(
          `Successfully uploaded ${successes.length} PDF${successes.length > 1 ? 's' : ''}. ${successes[0].result?.chunks_indexed || 0} chunks indexed.`
        );
        // Refresh document list after successful upload
        await fetchDocuments();
      }
      
      if (failures.length > 0) {
        failures.forEach(f => {
          toast.error(`Failed to upload ${f.filename}: ${f.error}`);
        });
      }

      // Reset input
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error("Error uploading documents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!session) {
      toast.error("Please log in to delete documents");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/documents/${encodeURIComponent(id)}?tenant_id=${session.user.tenant_id}&user_id=${session.user.user_id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setDocuments(documents.filter(doc => doc.id !== id));
        toast.success(result.message || "Document deleted successfully");
        // Optionally refresh the list
        await fetchDocuments();
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to delete document' }));
        toast.error(errorData.detail || "Failed to delete document");
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error("Error deleting document");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-lg md:text-xl">Document Management</CardTitle>
            <p className="text-muted-foreground text-sm md:text-base">
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
        <div className="border-2 border-dashed border-border rounded-lg p-6 md:p-8 text-center hover:border-primary transition-colors">
          <Upload className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-base md:text-lg font-medium text-foreground mb-2">Upload Documents</h3>
          {isRagEnabled === false && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                PDF inquiry feature is not activated in your package. Please contact the sales department to enable this feature.
              </p>
            </div>
          )}
          {isRagEnabled === true && (
            <>
              <p className="text-muted-foreground mb-4 text-sm md:text-base">Drag and drop PDF files here, or click to browse</p>
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={isLoading}
              />
              <label htmlFor="file-upload" className="cursor-pointer inline-block">
                <Button 
                  type="button"
                  variant="default" 
                  disabled={isLoading}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('file-upload')?.click();
                  }}
                >
                  {isLoading ? "Uploading..." : "Upload PDF Files"}
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-2">Upload PDF documents to be indexed for RAG queries</p>
            </>
          )}
          {isRagEnabled === null && (
            <p className="text-sm text-muted-foreground">Checking RAG availability...</p>
          )}
        </div>

        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border border-border rounded-lg gap-4">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <File className="h-6 w-6 md:h-8 md:w-8 text-primary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-foreground truncate">{doc.name}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {doc.size} • {doc.type} • {doc.uploadDate}
                  </p>
                  {doc.uploadedBy && (
                    <p className="text-xs text-muted-foreground">Uploaded by: {doc.uploadedBy}</p>
                  )}
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
            <div className="text-center py-8 text-muted-foreground">
              No documents available.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
