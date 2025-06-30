
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
  { title: "Dashboard", url: "/dashboard", icon: Home, gradient: "from-blue-500 to-blue-700" },
  { title: "Reports", url: "/reports", icon: FileText, gradient: "from-green-500 to-green-700" },
  { title: "Analytics", url: "/analytics", icon: PieChart, gradient: "from-purple-500 to-purple-700" },
  { title: "Settings", url: "/settings", icon: Settings, gradient: "from-orange-500 to-orange-700" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className={collapsed ? "w-20" : "w-72"} collapsible="icon">
      <SidebarContent className="bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-xl text-white">Intellyca</h1>
                <p className="text-slate-400 text-sm">ERP Intelligence</p>
              </div>
            )}
          </div>
        </div>
        
        <SidebarGroup className="px-4 py-6">
          <SidebarGroupLabel className="text-slate-400 uppercase tracking-wider text-xs font-semibold mb-4">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-0">
                    <NavLink
                      to={item.url}
                      className={({ isActive: linkActive }) =>
                        `flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                          linkActive || isActive(item.url)
                            ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg transform scale-[1.02]`
                            : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                        } ${collapsed ? "justify-center px-3" : ""}`
                      }
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                        isActive(item.url) ? "bg-white/20" : "bg-slate-700/50 group-hover:bg-slate-600/50"
                      } transition-colors duration-300`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      {!collapsed && (
                        <span className="font-medium text-base tracking-wide">
                          {item.title}
                        </span>
                      )}
                      {(isActive(item.url)) && !collapsed && (
                        <div className="absolute right-3 w-2 h-2 bg-white rounded-full"></div>
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
          <div className="mt-auto p-6 border-t border-slate-700">
            <div className="text-center">
              <p className="text-slate-400 text-xs">Powered by AI</p>
              <p className="text-slate-500 text-xs mt-1">v2.1.0</p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
