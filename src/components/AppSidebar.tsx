
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

"use client"

import { NavLink, useLocation } from "react-router-dom"
import {
  PieChart,
  Settings,
  Layout,
  DollarSign,
  TrendingUp,
  Package,
  Users,
  Building2,
  Shield,
  LogOut,
  ChevronDown,
} from "lucide-react"

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
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useRoleStore } from "@/store/roleStore"
import { useAuthStore } from "@/store/authStore"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link } from "react-router-dom"

const navItems = [
  // {
  //   title: "Dashboard",
  //   url: "/dashboard",
  //   icon: Home,
  //   gradient: "from-blue-500 to-blue-600",
  // },
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
]

const settingsItem = {
  title: "Settings",
  url: "/settings",
  icon: Settings,
  gradient: "from-orange-500 to-orange-600",
}

const iconMap = {
  DollarSign,
  TrendingUp,
  Package,
  Users,
}

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const collapsed = state === "collapsed"
  const currentPath = location.pathname

  const { session } = useAuthStore()
  const { getAccessibleModules, hasModuleAccess } = useRoleStore()
  const [accessibleModules, setAccessibleModules] = useState(getAccessibleModules())

  useEffect(() => {
    setAccessibleModules(getAccessibleModules())
  }, [session])

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + "/")
  const { logout } = useAuthStore()

  const handleLogout = () => {
    logout()
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const profilePictureUrl = session?.user.profile_picture
    ? `data:image/jpeg;base64,${session.user.profile_picture}`
    : undefined

  return (
    <Sidebar
      className={`
        ${collapsed ? "w-14" : "w-64"} 
        transition-all duration-300 ease-in-out
        bg-sidebar-background border-r border-sidebar-border
        shadow-sm
      `}
    >
      <SidebarContent className="bg-sidebar-background border-r border-sidebar-border transition-all duration-300 flex flex-col h-full">
        <div className="px-3 py-4 border-b border-sidebar-border/50">
          <div className="flex items-center gap-3">
            {/* <div className="flex items-center justify-center w-8 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex-shrink-0"> */}
             <img src="/logo.png" alt="Intellyca Logo" className="w-6 h-11 flex-shrink-0" />
            
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="font-bold text-base text-sidebar-foreground truncate">Intellyca</h1>
                <p className="text-sidebar-foreground/60 text-xs truncate">ERP Intelligence</p>
              </div>
            )}
          </div>
        </div>

        {/* <div className="px-3 py-4 border-b border-sidebar-border/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-auto py-2 px-2 hover:bg-sidebar-accent/50 rounded-lg transition-colors duration-200"
              >
                <Avatar className="h-9 w-9 flex-shrink-0">
                  <AvatarImage src={profilePictureUrl || "/placeholder.svg"} alt="Profile picture" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
                    {getInitials(session?.user.user_name || session?.user.email || "")}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-sidebar-foreground truncate">
                      {session?.user.user_name || session?.user.email}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">{session?.user.role_name}</p>
                  </div>
                )}
                {!collapsed && <ChevronDown className="h-4 w-4 text-sidebar-foreground/60 flex-shrink-0" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings">Profile Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div> */}

        {/* Navigation Sections - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Role-Based Dashboards */}
          {accessibleModules.length > 0 && (
            <SidebarGroup className="px-3 py-4">
              <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase tracking-wider text-xs font-semibold mb-3 px-2">
                {!collapsed && "Dashboards"}
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {accessibleModules.map((module) => {
                    const moduleUrl = `/dashboard/${module.id}`
                    const active = isActive(moduleUrl)
                    const IconComponent = iconMap[module.icon as keyof typeof iconMap] || Layout

                    return (
                      <SidebarMenuItem key={module.id}>
                        <SidebarMenuButton asChild className="p-0">
                          <NavLink
                            to={moduleUrl}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group focus:outline-none min-w-0 ${
                              collapsed ? "justify-center px-2" : ""
                            } ${
                              active
                                ? "bg-sidebar-primary/10 text-sidebar-primary font-medium shadow-sm"
                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                            }`}
                          >
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 flex-shrink-0 ${
                                active
                                  ? "bg-sidebar-primary/20 text-sidebar-primary"
                                  : "bg-sidebar-foreground/5 text-sidebar-foreground/60 group-hover:bg-sidebar-foreground/10"
                              }`}
                            >
                              <IconComponent className="h-4 w-4" />
                            </div>
                            {!collapsed && <span className="font-medium text-sm truncate">{module.name}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Admin Section */}
          {session?.user?.role_name === "Admin" && (
            <SidebarGroup className="px-3 py-4">
              <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase tracking-wider text-xs font-semibold mb-3 px-2">
                {!collapsed && "Administration"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="p-0">
                      <NavLink
                        to="/admin/tenants"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group focus:outline-none min-w-0 ${
                          collapsed ? "justify-center px-2" : ""
                        } ${
                          isActive("/admin/tenants")
                            ? "bg-sidebar-primary/10 text-sidebar-primary font-medium shadow-sm"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 flex-shrink-0 ${
                            isActive("/admin/tenants")
                              ? "bg-sidebar-primary/20 text-sidebar-primary"
                              : "bg-sidebar-foreground/5 text-sidebar-foreground/60 group-hover:bg-sidebar-foreground/10"
                          }`}
                        >
                          <Building2 className="h-4 w-4" />
                        </div>
                        {!collapsed && <span className="font-medium text-sm truncate">Tenants</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="p-0">
                      <NavLink
                        to="/admin/users"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group focus:outline-none min-w-0 ${
                          collapsed ? "justify-center px-2" : ""
                        } ${
                          isActive("/admin/users")
                            ? "bg-sidebar-primary/10 text-sidebar-primary font-medium shadow-sm"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 flex-shrink-0 ${
                            isActive("/admin/users")
                              ? "bg-sidebar-primary/20 text-sidebar-primary"
                              : "bg-sidebar-foreground/5 text-sidebar-foreground/60 group-hover:bg-sidebar-foreground/10"
                          }`}
                        >
                          <Users className="h-4 w-4" />
                        </div>
                        {!collapsed && <span className="font-medium text-sm truncate">Users</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="p-0">
                      <NavLink
                        to="/admin/kpis"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group focus:outline-none min-w-0 ${
                          collapsed ? "justify-center px-2" : ""
                        } ${
                          isActive("/admin/kpis")
                            ? "bg-sidebar-primary/10 text-sidebar-primary font-medium shadow-sm"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 flex-shrink-0 ${
                            isActive("/admin/kpis")
                              ? "bg-sidebar-primary/20 text-sidebar-primary"
                              : "bg-sidebar-foreground/5 text-sidebar-foreground/60 group-hover:bg-sidebar-foreground/10"
                          }`}
                        >
                          <PieChart className="h-4 w-4" />
                        </div>
                        {!collapsed && <span className="font-medium text-sm truncate">KPI Cards</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="p-0">
                      <NavLink
                        to="/admin/widgets"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group focus:outline-none min-w-0 ${
                          collapsed ? "justify-center px-2" : ""
                        } ${
                          isActive("/admin/widgets")
                            ? "bg-sidebar-primary/10 text-sidebar-primary font-medium shadow-sm"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 flex-shrink-0 ${
                            isActive("/admin/widgets")
                              ? "bg-sidebar-primary/20 text-sidebar-primary"
                              : "bg-sidebar-foreground/5 text-sidebar-foreground/60 group-hover:bg-sidebar-foreground/10"
                          }`}
                        >
                          <Layout className="h-4 w-4" />
                        </div>
                        {!collapsed && <span className="font-medium text-sm truncate">Widgets</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="p-0">
                      <NavLink
                        to="/admin/roles"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group focus:outline-none min-w-0 ${
                          collapsed ? "justify-center px-2" : ""
                        } ${
                          isActive("/admin/roles")
                            ? "bg-sidebar-primary/10 text-sidebar-primary font-medium shadow-sm"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 flex-shrink-0 ${
                            isActive("/admin/roles")
                              ? "bg-sidebar-primary/20 text-sidebar-primary"
                              : "bg-sidebar-foreground/5 text-sidebar-foreground/60 group-hover:bg-sidebar-foreground/10"
                          }`}
                        >
                          <Users className="h-4 w-4" />
                        </div>
                        {!collapsed && <span className="font-medium text-sm truncate">Roles</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Permission Management for CEO and Finance Manager */}
          {session?.user?.role_name && ["CEO", "Finance Manager"].includes(session.user.role_name) && (
            <SidebarGroup className="px-3 py-4">
              <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase tracking-wider text-xs font-semibold mb-3 px-2">
                {!collapsed && "Management"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="p-0">
                      <NavLink
                        to="/permissions"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group focus:outline-none min-w-0 ${
                          collapsed ? "justify-center px-2" : ""
                        } ${
                          isActive("/permissions")
                            ? "bg-sidebar-primary/10 text-sidebar-primary font-medium shadow-sm"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 flex-shrink-0 ${
                            isActive("/permissions")
                              ? "bg-sidebar-primary/20 text-sidebar-primary"
                              : "bg-sidebar-foreground/5 text-sidebar-foreground/60 group-hover:bg-sidebar-foreground/10"
                          }`}
                        >
                          <Shield className="h-4 w-4" />
                        </div>
                        {!collapsed && <span className="font-medium text-sm truncate">Permissions</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </div>

        {/* Settings - Sticky at Bottom */}
        <div className="border-t border-sidebar-border/50 px-3 py-3">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="p-0">
                    <NavLink
                      to={settingsItem.url}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group focus:outline-none min-w-0 ${
                        collapsed ? "justify-center px-2" : ""
                      } ${
                        isActive(settingsItem.url)
                          ? "bg-sidebar-primary/10 text-sidebar-primary font-medium shadow-sm"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 flex-shrink-0 ${
                          isActive(settingsItem.url)
                            ? "bg-sidebar-primary/20 text-sidebar-primary"
                            : "bg-sidebar-foreground/5 text-sidebar-foreground/60 group-hover:bg-sidebar-foreground/10"
                        }`}
                      >
                        <settingsItem.icon className="h-4 w-4" />
                      </div>
                      {!collapsed && <span className="font-medium text-sm truncate">{settingsItem.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Footer */}
       {!collapsed && (
  <div className="px-3 py-3 border-t border-sidebar-border/50 text-center">
    <div className="flex items-center justify-center gap-2"> 
  <img 
  src="/Technaptix.png" 
  alt="Technaptix Logo" 
  className="h-7 w-auto translate-y-[-2px]" 
/>

      <div className="text-left">
        <p className="text-sidebar-foreground/50 text-xs">Powered by Technaptix</p>
        <p className="text-sidebar-foreground/40 text-xs mt-0.5 text-center w-full">v2.1.0</p>

      </div>
    </div>
  </div>
)}

      </SidebarContent>
    </Sidebar>
  )
}
