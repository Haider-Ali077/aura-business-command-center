
import { NavLink, useLocation } from "react-router-dom";
import { BarChart3, FileText, PieChart, Settings, Home } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: Home, gradient: "from-blue-500 to-blue-600" },
  { title: "Reports", url: "/reports", icon: FileText, gradient: "from-green-500 to-green-600" },
  { title: "Analytics", url: "/analytics", icon: PieChart, gradient: "from-purple-500 to-purple-600" },
  { title: "Settings", url: "/settings", icon: Settings, gradient: "from-orange-500 to-orange-600" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-white border-r border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-lg text-gray-900">Intellyca</h1>
                <p className="text-gray-500 text-sm">ERP Intelligence</p>
              </div>
            )}
          </div>
        </div>
        
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className="text-gray-600 uppercase tracking-wide text-xs font-medium mb-3">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-0">
                    <NavLink
                      to={item.url}
                      className={({ isActive: linkActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                          linkActive || isActive(item.url)
                            ? `bg-gradient-to-r ${item.gradient} text-white shadow-md`
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        } ${collapsed ? "justify-center px-2" : ""}`
                      }
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                        isActive(item.url) ? "bg-white/20" : "bg-gray-100 group-hover:bg-gray-200"
                      } transition-colors duration-200`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      {!collapsed && (
                        <span className="font-medium text-sm">
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer */}
        {!collapsed && (
          <div className="mt-auto p-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-gray-500 text-xs">Powered by AI</p>
              <p className="text-gray-400 text-xs mt-1">v2.1.0</p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
