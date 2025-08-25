import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Trash2, User } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config/api";

export function ProfilePictureSettings() {
  const { session, updateProfilePicture } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/users/${session?.user.user_id}/upload-profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload profile picture');
      }

      // Convert file to base64 for immediate display
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(',')[1]; // Remove data:image/...;base64, prefix
        updateProfilePicture(base64Data);
        toast.success("Profile picture updated successfully");
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error("Failed to upload profile picture");
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleDeletePicture = async () => {
    if (!session?.user.profile_picture) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/${session?.user.user_id}/delete-profile-picture`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete profile picture');
      }

      updateProfilePicture(null);
      toast.success("Profile picture removed successfully");

    } catch (error) {
      console.error('Error deleting profile picture:', error);
      toast.error("Failed to remove profile picture");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!session) return null;

  const profilePictureUrl = session.user.profile_picture 
    ? `data:image/jpeg;base64,${session.user.profile_picture}`
    : undefined;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl text-card-foreground">Profile Picture</CardTitle>
        <p className="text-muted-foreground text-sm md:text-base">
          Upload or remove your profile picture
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profilePictureUrl} alt="Profile picture" />
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-lg font-semibold">
              {getInitials(session.user.user_name || session.user.email)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={() => document.getElementById('profile-picture-input')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload Picture'}
              </Button>
              
              {session.user.profile_picture && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isDeleting}
                  onClick={handleDeletePicture}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Removing...' : 'Remove'}
                </Button>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              Supported formats: JPG, PNG, GIF (Max 5MB)
            </p>
          </div>
        </div>

        <input
          id="profile-picture-input"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}