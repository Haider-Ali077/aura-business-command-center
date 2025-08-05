
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, User, LogOut } from "lucide-react";
import { useAuthStore } from '@/store/authStore';
import { SearchDropdown } from "@/components/SearchDropdown";
import { AlertsDropdown } from "@/components/AlertsDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { session, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const profilePictureUrl = session?.user.profile_picture 
    ? `data:image/jpeg;base64,${session.user.profile_picture}`
    : undefined;

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <SidebarTrigger />
        <div className="">
          <SearchDropdown />
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <AlertsDropdown />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 min-w-0 h-auto py-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profilePictureUrl} alt="Profile picture" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {getInitials(session?.user.user_name || session?.user.email || '')}
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
            <DropdownMenuItem>
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              Preferences
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
