
import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { FloatingChatbot } from "@/components/FloatingChatbot";
import { useUserChangeDetection } from "@/hooks/useUserChangeDetection";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // Initialize user change detection for automatic cleanup
  useUserChangeDetection();
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <Header />
          <div className="flex-1 p-4 md:p-6 overflow-hidden bg-background">
            <div className="h-full overflow-y-auto">
              {children}
            </div>
          </div>
        </main>
        <FloatingChatbot />
      </div>
    </SidebarProvider>
  );
}
