
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl text-card-foreground">Appearance</CardTitle>
        <p className="text-muted-foreground text-sm md:text-base">Customize how the app looks</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? 
              <Moon className="h-5 w-5 text-foreground" /> : 
              <Sun className="h-5 w-5 text-foreground" />
            }
            <div>
              <h4 className="font-medium text-card-foreground">Dark Mode</h4>
              <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
            </div>
          </div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
          />
        </div>
      </CardContent>
    </Card>
  );
}
