
// import { NavLink, useLocation } from "react-router-dom";
// import { BarChart3, FileText, PieChart, Settings, Home } from "lucide-react";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   useSidebar,
// } from "@/components/ui/sidebar";

// const items = [
//   { title: "Dashboard", url: "/dashboard", icon: Home, gradient: "from-blue-500 to-blue-600" },
//   { title: "Reports", url: "/reports", icon: FileText, gradient: "from-green-500 to-green-600" },
//   { title: "Analytics", url: "/analytics", icon: PieChart, gradient: "from-purple-500 to-purple-600" },
//   { title: "Settings", url: "/settings", icon: Settings, gradient: "from-orange-500 to-orange-600" },
// ];

// export function AppSidebar() {
//   const { state } = useSidebar();
//   const location = useLocation();
//   const currentPath = location.pathname;
//   const collapsed = state === "collapsed";

//   const isActive = (path: string) => currentPath === path;

//   return (
//     <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
//       <SidebarContent className="bg-white border-r border-gray-200">
//         {/* Header */}
//         <div className="p-4 border-b border-gray-100">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
//               <BarChart3 className="h-6 w-6 text-white" />
//             </div>
//             {!collapsed && (
//               <div>
//                 <h1 className="font-bold text-lg text-gray-900">Intellyca</h1>
//                 <p className="text-gray-500 text-sm">ERP Intelligence</p>
//               </div>
//             )}
//           </div>
//         </div>

//         <SidebarGroup className="px-3 py-4">
//           <SidebarGroupLabel className="text-gray-600 uppercase tracking-wide text-xs font-medium mb-3">
//             {!collapsed && "Navigation"}
//           </SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu className="space-y-2">
//               {items.map((item) => (
//                 <SidebarMenuItem key={item.title}>
//                   <SidebarMenuButton asChild className="p-0">
//                     {/* <NavLink
//                       to={item.url}
//                       className={({ isActive: linkActive }) =>
//                         `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
//                           linkActive || isActive(item.url)
//                             ? `bg-gradient-to-r ${item.gradient} text-white shadow-md`
//                             : "text-gray-700 bg-gray-50 hover:bg-gradient-to-r hover:" + item.gradient + " hover:text-white"
//                         } ${collapsed ? "justify-center px-2" : ""}`
//                       }
//                     > */}
//                     <NavLink
//                       to={item.url}
//                       className={({ isActive: linkActive }) => {
//                         const active = linkActive || isActive(item.url);
//                         const baseClasses =
//                           "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group";
//                         const collapsedClasses = collapsed ? "justify-center px-2" : "";
//                         if (active) {
//                           return `${baseClasses} ${collapsedClasses} bg-gradient-to-r ${item.gradient} text-white shadow-md`;
//                         } else {
//                           return `${baseClasses} ${collapsedClasses} text-gray-700 bg-gray-50 hover:bg-gradient-to-r hover:${item.gradient.split(" ").join(" hover:")} hover:text-white`;
//                         }
//                       }}
//                     >
//                       <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${isActive(item.url) ? "bg-white/20" : "bg-white/50"
//                         } transition-colors duration-200`}>
//                         <item.icon className="h-5 w-5" />
//                       </div>
//                       {!collapsed && (
//                         <span className="font-medium text-sm">
//                           {item.title}
//                         </span>
//                       )}
//                     </NavLink>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>

//         {/* Footer */}
//         {!collapsed && (
//           <div className="mt-auto p-4 border-t border-gray-100">
//             <div className="text-center">
//               <p className="text-gray-500 text-xs">Powered by AI</p>
//               <p className="text-gray-400 text-xs mt-1">v2.1.0</p>
//             </div>
//           </div>
//         )}
//       </SidebarContent>
//     </Sidebar>
//   );
// }


// import { NavLink, useLocation } from "react-router-dom";
// import { BarChart3, FileText, PieChart, Settings, Home, Layout } from "lucide-react";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   useSidebar,
// } from "@/components/ui/sidebar";

// const navItems = [
//   {
//     title: "Dashboard",
//     url: "/dashboard",
//     icon: Home,
//     gradient: "from-blue-500 to-blue-600",
//   },
//   {
//     title: "Role Dashboards",
//     url: "/dashboards",
//     icon: Layout,
//     gradient: "from-indigo-500 to-indigo-600",
//   },
//   {
//     title: "Reports",
//     url: "/reports",
//     icon: FileText,
//     gradient: "from-green-500 to-green-600",
//   },
//   {
//     title: "Analytics",
//     url: "/analytics",
//     icon: PieChart,
//     gradient: "from-purple-500 to-purple-600",
//   },
//   {
//     title: "Settings",
//     url: "/settings",
//     icon: Settings,
//     gradient: "from-orange-500 to-orange-600",
//   },
// ];

// export function AppSidebar() {
//   const { state } = useSidebar();
//   const location = useLocation();
//   const collapsed = state === "collapsed";
//   const currentPath = location.pathname;

//   const isActive = (path: string) =>
//     currentPath === path || currentPath.startsWith(path + "/");

//   return (
//     <Sidebar
//       className={`transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
//       collapsible="icon"
//     >
//       <SidebarContent className="bg-white border-r border-gray-200 transition-all duration-300">
//         {/* Header */}
//         <div className="p-4 border-b border-gray-100">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
//               <BarChart3 className="h-6 w-6 text-white" />
//             </div>
//             {!collapsed && (
//               <div>
//                 <h1 className="font-bold text-lg text-gray-900">Intellyca</h1>
//                 <p className="text-gray-500 text-sm">ERP Intelligence</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Navigation Group */}
//         <SidebarGroup className="px-3 py-4">
//           <SidebarGroupLabel className="text-gray-600 uppercase tracking-wide text-xs font-medium mb-3">
//             {!collapsed && "Navigation"}
//           </SidebarGroupLabel>

//           <SidebarGroupContent>
//             <SidebarMenu className="space-y-2">
//               {navItems.map((item) => {
//                 const active = isActive(item.url);
//                 const hoverGradient = item.gradient
//                   .split(" ")
//                   .map((c) => `hover:${c}`)
//                   .join(" ");

//                 return (
//                   <SidebarMenuItem key={item.title}>
//                     <SidebarMenuButton asChild className="p-0">
//                       <NavLink
//                         to={item.url}
//                         className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group focus:outline-none ${
//                           collapsed ? "justify-center px-2" : ""
//                         } ${
//                           active
//                             ? `bg-gradient-to-r ${item.gradient} text-white shadow-md`
//                             : `text-gray-800 bg-white hover:bg-gradient-to-r ${hoverGradient} hover:text-white`
//                         }`}
//                       >
//                         <div
//                           className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200 ${
//                             active ? "bg-white/20" : "bg-white/50"
//                           }`}
//                         >
//                           <item.icon className="h-5 w-5" />
//                         </div>
//                         {!collapsed && (
//                           <span className="font-medium text-sm">{item.title}</span>
//                         )}
//                       </NavLink>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 );
//               })}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>

//         {/* Footer */}
//         {!collapsed && (
//           <div className="mt-auto p-4 border-t border-gray-100 text-center">
//             <p className="text-gray-500 text-xs">Powered by AI</p>
//             <p className="text-gray-400 text-xs mt-1">v2.1.0</p>
//           </div>
//         )}
//       </SidebarContent>
//     </Sidebar>
//   );
// }

import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  FileText,
  PieChart,
  Settings,
  Home,
  Layout,
  DollarSign,
  TrendingUp,
  Package,
  Users,
} from "lucide-react";
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
import { useRoleStore } from "@/store/roleStore";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    gradient: "from-blue-500 to-blue-600",
  },
  // {
  //   title: "Reports",
  //   url: "/reports",
  //   icon: FileText,
  //   gradient: "from-green-500 to-green-600",
  // },
  // {
  //   title: "Analytics",
  //   url: "/analytics",
  //   icon: PieChart,
  //   gradient: "from-purple-500 to-purple-600",
  // },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    gradient: "from-orange-500 to-orange-600",
  },
];

const iconMap = {
  BarChart3,
  DollarSign,
  TrendingUp,
  Package,
  Users,
};

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";
  const currentPath = location.pathname;

  const { session } = useAuthStore();
  const { getAccessibleModules } = useRoleStore();
  const [accessibleModules, setAccessibleModules] = useState(
    getAccessibleModules()
  );

  useEffect(() => {
    setAccessibleModules(getAccessibleModules());
  }, [session]);

  const isActive = (path: string) =>
    currentPath === path || currentPath.startsWith(path + "/");

  return (
    <Sidebar
      className={`transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
      collapsible="icon"
    >
      <SidebarContent className="bg-white border-r border-gray-200 transition-all duration-300">
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

        {/* Navigation Group */}
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className="text-gray-600 uppercase tracking-wide text-xs font-medium mb-3">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navItems.map((item) => {
                const active = isActive(item.url);
                const hoverGradient = item.gradient
                  .split(" ")
                  .map((c) => `hover:${c}`)
                  .join(" ");

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="p-0">
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group focus:outline-none ${
                          collapsed ? "justify-center px-2" : ""
                        } ${
                          active
                            ? `bg-gradient-to-r ${item.gradient} text-white shadow-md`
                            : `text-gray-800 bg-white hover:bg-gradient-to-r ${hoverGradient} hover:text-white`
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200 ${
                            active ? "bg-white/20" : "bg-white/50"
                          }`}
                        >
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
                );
              })}

              {/* Role-Based Modules */}
              {accessibleModules.length > 0 && (
                <>
                  <SidebarGroupLabel className="text-gray-600 uppercase tracking-wide text-xs font-medium mt-4 mb-2">
                    {!collapsed && "Modules"}
                  </SidebarGroupLabel>
                  {accessibleModules.map((module) => {
                    const moduleUrl = `/dashboards/${module.id}`;
                    const active = isActive(moduleUrl);
                    const IconComponent =
                      iconMap[module.icon as keyof typeof iconMap] || Layout;

                    return (
                      <SidebarMenuItem key={module.id}>
                        <SidebarMenuButton asChild className="p-0">
                          <NavLink
                            to={moduleUrl}
                            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group focus:outline-none ${
                              collapsed ? "justify-center px-2" : ""
                            } ${
                              active
                                ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md"
                                : "text-gray-800 bg-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-indigo-600 hover:text-white"
                            }`}
                          >
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200 ${
                                active ? "bg-white/20" : "bg-white/50"
                              }`}
                            >
                              <IconComponent className="h-5 w-5" />
                            </div>
                            {!collapsed && (
                              <span className="font-medium text-sm">
                                {module.name}
                              </span>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer */}
        {!collapsed && (
          <div className="mt-auto p-4 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-xs">Powered by AI</p>
            <p className="text-gray-400 text-xs mt-1">v2.1.0</p>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

