
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export function PasswordChange() {
  const { session } = useAuthStore();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          user_id: session?.user.user_id,
          tenant_name: session?.user.tenant_id,
          role_name: session?.user.role_name,
          token: session?.token
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

  return (
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
  );
}
