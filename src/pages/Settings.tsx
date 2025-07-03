
import { Layout } from "@/components/Layout";
import { useAuthStore } from "@/store/authStore";
import { DocumentManagement } from "@/components/DocumentManagement";
import { AppearanceSettings } from "@/components/AppearanceSettings";
import { PasswordChange } from "@/components/PasswordChange";

const Settings = () => {
  const { session } = useAuthStore();

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

        <DocumentManagement />
        <AppearanceSettings />
        <PasswordChange />
      </div>
    </Layout>
  );
};

export default Settings;
