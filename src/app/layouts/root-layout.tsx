import { Outlet, useLocation, Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import {
  Wrench,
  ShoppingCart,
  Settings,
  Menu,
  X,
  LogOut,
  UserRound,
  Palette,
  ChevronDown,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { cn } from "../components/ui/utils";
import { auth } from "../../firebase";
import { useAuth } from "../auth/auth-context";
import { logStaffActivity } from "../utils/staff-activity";
import { appNavigation } from "../auth/permissions";

const themeColors = [
  "#2F67EA",
  "#10B981",
  "#F97316",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#0EA5E9",
  "#111827",
  "#64748B",
];

const applyAppColor = (color: string) => {
  const root = document.documentElement;
  root.style.setProperty("--primary", color);
  root.style.setProperty("--ring", color);
  root.style.setProperty("--sidebar-primary", color);
  root.style.setProperty("--sidebar-ring", color);
};

export function RootLayout() {
  const { isAdmin, role, user } = useAuth();
  const { hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [appColor, setAppColor] = useState("#2F67EA");
  const [colorMenuOpen, setColorMenuOpen] = useState(false);

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

  useEffect(() => {
    const savedColor = localStorage.getItem("gamingtech.appColor") || "#2F67EA";
    setAppColor(savedColor);
    applyAppColor(savedColor);
  }, []);

  const changeAppColor = (color: string) => {
    setAppColor(color);
    localStorage.setItem("gamingtech.appColor", color);
    applyAppColor(color);
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    logStaffActivity(user, role, "auth.logout", "User signed out");
    if (user) sessionStorage.removeItem(`gamingtech.loginLogged.${user.uid}`);
    await signOut(auth);
    navigate("/login");
  };
  const visibleNavigation = appNavigation.filter((item) => hasPermission(item.permission));

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-foreground"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="font-bold">GamingTech.pk</p>
              <p className="text-xs text-muted-foreground">Repair Management</p>
            </div>
          </div>
          <div className="relative">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setColorMenuOpen((open) => !open)}>
              <Palette className="h-5 w-5" />
            </Button>
            {colorMenuOpen && (
              <div className="absolute right-0 top-11 z-[100] w-72 rounded-lg border bg-white p-4 text-foreground shadow-xl">
                <p className="mb-3 text-sm font-semibold">Select App Color</p>
                <div className="grid grid-cols-5 gap-2">
                  {themeColors.map((color) => (
                    <button key={color} type="button" onClick={() => { changeAppColor(color); setColorMenuOpen(false); }} className={cn("h-9 rounded-full border-2 transition hover:scale-105", appColor.toLowerCase() === color.toLowerCase() ? "border-foreground ring-2 ring-ring/30" : "border-transparent")} style={{ backgroundColor: color }} />
                  ))}
                </div>
                <input type="color" value={appColor} onChange={(event) => changeAppColor(event.target.value)} className="mt-4 h-10 w-full cursor-pointer rounded border bg-white p-1" aria-label="Custom app color" />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 border-r border-border bg-white transition-transform",
          sidebarHidden && !isMobile ? "-translate-x-full" : "lg:translate-x-0",
          sidebarOpen && isMobile ? "translate-x-0" : isMobile ? "-translate-x-full" : ""
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex h-[72px] items-center gap-3 border-b border-border px-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-lg font-bold text-foreground">GamingTech.pk</span>
              <span className="text-xs text-muted-foreground">Repair Management</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-7">
            <div className="space-y-2">
              {visibleNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => isMobile && setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] transition-colors",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
          <div className="border-t border-border p-4">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left text-foreground hover:bg-muted"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg">
                  <UserRound className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{user?.displayName || "Admin User"}</p>
                  <p className="truncate text-xs capitalize text-muted-foreground">{role || (isAdmin ? "Super Admin" : "Employee")}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
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
      <header className={cn("hidden lg:block fixed top-0 right-0 z-30 border-b border-primary bg-primary text-primary-foreground", sidebarHidden ? "left-0" : "left-64")}>
        <div className="flex h-[72px] items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarHidden(!sidebarHidden)} className="text-primary-foreground hover:bg-white/15 hover:text-primary-foreground" title={sidebarHidden ? "Show sidebar" : "Hide sidebar"}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-primary-foreground">
              {location.pathname === "/" ? "GamingTech.pk Overview" : appNavigation.find((item) => isActive(item.href))?.name || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/15 hover:text-primary-foreground" title="Change color" onClick={() => setColorMenuOpen((open) => !open)}>
                <Palette className="h-5 w-5" />
              </Button>
              {colorMenuOpen && (
                <div className="absolute right-0 top-12 z-[100] w-72 rounded-lg border bg-white p-4 text-foreground shadow-xl">
                  <p className="mb-3 text-sm font-semibold">Select App Color</p>
                  <div className="grid grid-cols-5 gap-2">
                    {themeColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => { changeAppColor(color); setColorMenuOpen(false); }}
                        className={cn(
                          "h-9 rounded-full border-2 transition hover:scale-105",
                          appColor.toLowerCase() === color.toLowerCase() ? "border-foreground ring-2 ring-ring/30" : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <input type="color" value={appColor} onChange={(event) => changeAppColor(event.target.value)} className="mt-4 h-10 w-full cursor-pointer rounded border bg-white p-1" aria-label="Custom app color" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="hidden items-center gap-3 rounded-lg px-2 py-1 text-left hover:bg-white/15 xl:flex"
              title="Open profile and change password"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-primary-foreground">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{user?.displayName || "Admin User"}</p>
                <p className="text-xs capitalize text-primary-foreground/75">{role || (isAdmin ? "Super Admin" : "Employee")}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-primary-foreground/75" />
            </button>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="text-primary-foreground hover:bg-white/15 hover:text-primary-foreground">
                <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn("min-w-0 max-w-full overflow-x-auto", sidebarHidden ? "lg:ml-0" : "lg:ml-64", isMobile ? "pt-16" : "lg:pt-[72px]")}>
        <div className="min-w-0 max-w-full overflow-x-auto p-4 lg:p-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border">
        <div className="flex items-center justify-around px-2 py-2">
          {visibleNavigation.filter((item) => ["Dashboard", "Repairs", "Inventory", "POS", "Profile"].includes(item.name)).slice(0, 5).map((item) => {
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
