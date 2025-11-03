import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Search } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore"; // ✅ Added import
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

export function Header() {
  const { session, logout } = useAuthStore();

  // ✅ Enhanced logout to clear both auth + chat state
  const handleLogout = () => {
    try {
      // 1️⃣ Clear authentication/session
      logout();

      // 2️⃣ Clear chat data (messages, session, etc.)
      useChatStore.getState().logoutAndClearSession();

      // 3️⃣ Optionally redirect to login page (if logout() doesn't already do it)
      window.location.href = "/";

      console.log("✅ User logged out successfully — chat and session cleared.");
    } catch (error) {
      console.error("❌ Error during logout:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const profilePictureUrl = session?.user.profile_picture
    ? `data:image/jpeg;base64,${session.user.profile_picture}`
    : undefined;

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-4 md:px-6">
      {/* Left: Logo + Sidebar Trigger */}
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <img
          src="/Alkaram.png"
          alt="Technaptix Logo"
          style={{ height: "3.8rem" }}
          className="w-auto"
        />
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
        <div className="w-full relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Right: User Avatar + Dropdown */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 h-auto py-1"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={profilePictureUrl} alt="Profile picture" />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs font-semibold">
                  {getInitials(
                    session?.user.user_name || session?.user.email || ""
                  )}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden md:inline-block truncate max-w-32 lg:max-w-none">
                {session?.user.user_name || session?.user.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">Profile Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
