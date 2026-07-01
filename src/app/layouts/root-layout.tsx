import { Outlet, useLocation, Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import {
  LayoutDashboard,
  Wrench,
  Package,
  ShoppingCart,
  Users,
  FileText,
  TrendingUp,
  Settings,
  Menu,
  X,
  LogOut,
  Boxes,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { cn } from "../components/ui/utils";
import { auth } from "../../firebase";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Repairing", href: "/repairs", icon: Wrench },
  { name: "Parts", href: "/parts", icon: Package },
  { name: "GPU Inventory", href: "/inventory", icon: Boxes },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "POS", href: "/pos", icon: ShoppingCart },
  { name: "Billing", href: "/billing", icon: FileText },
  { name: "Finance", href: "/finance", icon: TrendingUp },
];

export function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-secondary border-b border-sidebar-border">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-secondary-foreground"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="flex items-center gap-2">
            <img src="/gamingtech-logo.svg" alt="GamingTech.pk" className="h-9 w-28 rounded object-cover" />
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-transform bg-sidebar border-r border-sidebar-border",
          isMobile ? "w-64" : sidebarCollapsed ? "w-20 lg:translate-x-0" : "w-64 lg:translate-x-0",
          sidebarOpen && isMobile ? "translate-x-0" : isMobile ? "-translate-x-full" : ""
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn("flex items-center gap-3 h-16 border-b border-sidebar-border", sidebarCollapsed ? "justify-center px-3" : "px-6")}>
            {!sidebarCollapsed && (
            <div className="flex min-w-0 flex-col">
              <img src="/gamingtech-logo.svg" alt="GamingTech.pk" className="h-10 w-36 rounded-md object-cover" />
              <span className="mt-1 text-xs text-sidebar-foreground/70">Admin Panel</span>
            </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => isMobile && setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                      sidebarCollapsed && "justify-center",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <Icon className="h-5 w-5" />
                    {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Header */}
      <header className={cn("hidden lg:block fixed top-0 right-0 z-30 bg-card border-b border-border", sidebarCollapsed ? "left-20" : "left-64")}>
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-4">
            <img src="/gamingtech-logo.svg" alt="GamingTech.pk" className="h-9 w-24 rounded object-cover" />
            <h1 className="text-xl font-semibold text-foreground">
              {location.pathname === "/" ? "GamingTech.pk Overview" : navigation.find((item) => isActive(item.href))?.name || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn(sidebarCollapsed ? "lg:ml-20" : "lg:ml-64", isMobile ? "pt-16" : "lg:pt-16")}>
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border">
        <div className="flex items-center justify-around px-2 py-2">
          {[
            { name: "Dashboard", href: "/", icon: LayoutDashboard },
            { name: "Repairing", href: "/repairs", icon: Wrench },
            { name: "GPU", href: "/inventory", icon: Boxes },
            { name: "POS", href: "/pos", icon: ShoppingCart },
            { name: "More", href: "/settings", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
