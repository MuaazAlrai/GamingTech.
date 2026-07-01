import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { 
  Home, Wrench, Package, ShoppingCart, Users, FileText, 
  Settings as SettingsIcon, User, Menu, X, Bell, Moon, Sun,
  Clock, CheckCircle, Package2, Search
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Wrench, label: "Repairs", path: "/repairs", badge: 12 },
  { icon: Package, label: "Inventory", path: "/inventory" },
  { icon: ShoppingCart, label: "POS", path: "/pos" },
  { icon: Users, label: "Customers", path: "/customers" },
];

const mobileNavItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Wrench, label: "Repairs", path: "/repairs" },
  { icon: Package, label: "Inventory", path: "/inventory" },
  { icon: ShoppingCart, label: "POS", path: "/pos" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r border-border bg-card">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wrench className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">GamingTech.pk</span>
            <span className="text-xs text-muted-foreground">Repair Management</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all
                ${isActive(item.path)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge variant={isActive(item.path) ? "secondary" : "default"} className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}

          <div className="pt-4 mt-4 border-t border-border space-y-1">
            <Link
              to="/repairs/waiting-parts"
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all
                ${isActive("/repairs/waiting-parts")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }
              `}
            >
              <Clock className="h-5 w-5" />
              <span className="flex-1">Waiting Parts</span>
              <Badge variant="outline">5</Badge>
            </Link>

            <Link
              to="/repairs/ready-pickup"
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all
                ${isActive("/repairs/ready-pickup")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }
              `}
            >
              <CheckCircle className="h-5 w-5" />
              <span className="flex-1">Ready for Pickup</span>
              <Badge variant="outline">8</Badge>
            </Link>

            <Link
              to="/parts"
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all
                ${isActive("/parts")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }
              `}
            >
              <Package2 className="h-5 w-5" />
              <span className="flex-1">Parts</span>
            </Link>

            <Link
              to="/billing"
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all
                ${isActive("/billing")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }
              `}
            >
              <FileText className="h-5 w-5" />
              <span className="flex-1">Billing</span>
            </Link>

            <Link
              to="/reports"
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all
                ${isActive("/reports")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }
              `}
            >
              <FileText className="h-5 w-5" />
              <span className="flex-1">Reports</span>
            </Link>

            <Link
              to="/settings"
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all
                ${isActive("/settings")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }
              `}
            >
              <SettingsIcon className="h-5 w-5" />
              <span className="flex-1">Settings</span>
            </Link>
          </div>
        </nav>

        <div className="border-t border-border p-4">
          <Link to="/profile">
            <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted transition-colors">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">SA</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-foreground">Super Admin</p>
                <p className="text-xs text-muted-foreground truncate">admin@gamingtech.pk</p>
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Wrench className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">GamingTech.pk</span>
                  <span className="text-xs text-muted-foreground">Repair Management</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="space-y-1 px-3 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all
                    ${isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge variant={isActive(item.path) ? "secondary" : "default"}>
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex-1 flex items-center gap-4">
            <div className="relative w-full max-w-md hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search repairs, customers, parts..."
                className="pl-9 bg-muted/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">New repair ticket #1234</p>
                    <p className="text-xs text-muted-foreground">Customer: Ahmed Khan - PlayStation 5</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Low stock alert</p>
                    <p className="text-xs text-muted-foreground">HDMI cables - Only 3 remaining</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Payment received</p>
                    <p className="text-xs text-muted-foreground">Invoice #INV-2024-567 - Rs. 15,000</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">SA</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">Super Admin</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/login">Logout</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-card px-4 py-3 safe-area-inset-bottom">
          {mobileNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors
                ${isActive(item.path)
                  ? "text-primary"
                  : "text-muted-foreground"
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
