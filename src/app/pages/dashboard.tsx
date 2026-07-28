import { Link } from "react-router";
import {
  Wrench,
  Clock,
  Package,
  CheckCircle2,
  DollarSign,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  FileText,
  Boxes,
  Bell,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { usePersistentState } from "../hooks/use-persistent-state";
import type { GpuItem } from "../types/gpu-item";
import type { PosSale } from "../types/pos-sale";
import type { RepairTicket } from "../types/repair-ticket";
import { useAuth } from "../auth/auth-context";
import { getRepairDueState, labelForRepairStatus } from "../utils/repair-status";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalRepairs: number;
  totalSpent: number;
};

type Part = {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  reorderLevel: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  supplier: string;
  location: string;
};

type Activity = {
  id: string;
  type: string;
  title: string;
  description: string;
  customer: string;
  time: string;
  avatar: string;
  date: string;
};

const formatCurrency = (amount: number) =>
  `₨${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const formatRelativeTime = (date: string) => {
  const time = new Date(date).getTime();
  if (Number.isNaN(time)) return "";

  const minutes = Math.max(1, Math.round((Date.now() - time) / 60000));
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  return `${Math.round(hours / 24)} days ago`;
};

const notificationToneClasses = {
  neutral: "border-border bg-background text-foreground",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/40 bg-warning/10 text-warning",
  destructive: "border-destructive/40 bg-destructive/10 text-destructive",
  muted: "border-border bg-muted text-muted-foreground",
};

export function Dashboard() {
  const { isAdmin } = useAuth();
  const [tickets] = usePersistentState<RepairTicket[]>("gamingtech.repairTickets", []);
  const [sales] = usePersistentState<PosSale[]>("gamingtech.posSales", []);
  const [customers] = usePersistentState<Customer[]>("gamingtech.customers", []);
  const [parts] = usePersistentState<Part[]>("gamingtech.parts", []);
  const [gpus] = usePersistentState<GpuItem[]>("gamingtech.gpus", []);

  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const completedSales = sales.filter((sale) => (sale.status ?? "completed") === "completed");
  const todaysSales = completedSales.filter((sale) => sale.date.slice(0, 10) === today);
  const todaysTickets = tickets.filter((ticket) => ticket.createdAt?.slice(0, 10) === today);
  const activeTickets = tickets.filter((ticket) =>
    ["received", "diagnosing", "repairing", "testing", "pending", "waiting_approval"].includes(
      ticket.status,
    ),
  );
  const waitingParts = tickets.filter((ticket) => ticket.status === "waiting_parts");
  const readyTickets = tickets.filter((ticket) => ticket.status === "ready");
  const repairNotifications = tickets.flatMap((ticket) => {
    const due = getRepairDueState(ticket);
    const unpaid = Math.max(0, (ticket.amount ?? 0) - (ticket.paidAmount ?? 0));
    const reasons = [
      due.isDueToday && "Due today",
      due.isDueTomorrow && "Due tomorrow",
      due.isWithinThreeDays && !due.isDueToday && !due.isDueTomorrow && "Due within 3 days",
      due.isOverdue && "Overdue",
      ticket.status === "waiting_approval" && "Awaiting customer approval",
      ticket.status === "waiting_parts" && "Awaiting parts",
      ticket.status === "ready" && "Ready for pickup",
      ticket.priority === "high" && "High priority repair",
      ticket.status === "completed" && unpaid > 0 && "Completed with unpaid balance",
    ].filter(Boolean) as string[];

    return reasons.map((reason) => ({ id: `${ticket.id}-${reason}`, reason, ticket, due }));
  }).sort((a, b) => {
    const priority = (item: typeof a) => item.due.isOverdue ? 0 : item.due.isDueToday ? 1 : item.due.isDueTomorrow ? 2 : 3;
    return priority(a) - priority(b) || (a.ticket.estimatedCompletion || "").localeCompare(b.ticket.estimatedCompletion || "");
  });
  const todaysRevenue = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
  const monthlyRevenue = completedSales
    .filter((sale) => sale.date.slice(0, 7) === currentMonth)
    .reduce((sum, sale) => sum + sale.total, 0);
  const lowStockItems = parts
    .filter((part) => part.stock <= part.reorderLevel)
    .sort((a, b) => a.stock - b.stock);
  const inventoryValue = parts.reduce((sum, part) => sum + part.stock * part.costPrice, 0);

  const monthFormatter = new Intl.DateTimeFormat(undefined, { month: "short" });
  const revenueData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const monthKey = date.toISOString().slice(0, 7);

    return {
      name: monthFormatter.format(date),
      revenue: completedSales
        .filter((sale) => sale.date.slice(0, 7) === monthKey)
        .reduce((sum, sale) => sum + sale.total, 0),
      repairs: tickets.filter((ticket) => ticket.createdAt?.slice(0, 7) === monthKey).length,
    };
  });

  const repairStatusData = [
    {
      name: "Diagnosing",
      value: tickets.filter((ticket) => ticket.status === "diagnosing").length,
      color: "#E6A23A",
    },
    {
      name: "Repairing",
      value: tickets.filter((ticket) => ticket.status === "repairing").length,
      color: "#0F8B8D",
    },
    { name: "Waiting Parts", value: waitingParts.length, color: "#D94841" },
    {
      name: "Testing",
      value: tickets.filter((ticket) => ticket.status === "testing").length,
      color: "#F4A261",
    },
    { name: "Ready", value: readyTickets.length, color: "#2E9D64" },
  ];

  const recentActivities: Activity[] = [
    ...sales.map((sale) => ({
      id: sale.id,
      type: "sale",
      title: "POS sale completed",
      description: `${sale.items.length} item types sold for ${formatCurrency(sale.total)}`,
      customer: "POS",
      time: formatRelativeTime(sale.date),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${sale.id}`,
      date: sale.date,
    })),
    ...tickets.map((ticket) => ({
      id: ticket.id,
      type: "repair",
      title: ticket.issue || "Repair ticket created",
      description: `${ticket.device} - ${ticket.status}`,
      customer: ticket.customer,
      time: formatRelativeTime(ticket.createdAt),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${ticket.customer}`,
      date: ticket.createdAt,
    })),
    ...gpus.map((gpu) => ({
      id: gpu.id,
      type: "gpu",
      title: "GPU inventory updated",
      description: `${gpu.model} - ${gpu.status}`,
      customer: gpu.customer,
      time: formatRelativeTime(gpu.updatedAt ?? gpu.createdAt ?? new Date().toISOString()),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${gpu.customer}`,
      date: gpu.updatedAt ?? gpu.createdAt ?? new Date().toISOString(),
    })),
    ...parts.map((part) => ({
      id: part.id,
      type: "stock",
      title: "Stock available",
      description: `${part.name} - ${part.stock} ${part.unit}`,
      customer: part.category,
      time: "Inventory",
      avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${part.id}`,
      date: new Date(0).toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const stats = [
    {
      title: "Today's Repairs",
      value: String(todaysTickets.length),
      change: `${tickets.length} total`,
      trend: "up",
      icon: Wrench,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/repairs?view=today",
    },
    {
      title: "Active Repairs",
      value: String(activeTickets.length),
      change: `${tickets.length} total`,
      trend: "up",
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
      href: "/repairs?view=active",
    },
    {
      title: "Waiting for Parts",
      value: String(waitingParts.length),
      change: `${parts.length} stock items`,
      trend: "down",
      icon: Package,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      href: "/repairs?status=waiting_parts",
    },
    {
      title: "Ready for Pickup",
      value: String(readyTickets.length),
      change: "ready",
      trend: "up",
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
      href: "/repairs?status=ready",
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(todaysRevenue),
      change: `${todaysSales.length} sales`,
      trend: "up",
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
      href: "/pos/sales-history",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(monthlyRevenue),
      change: `Stock ${formatCurrency(inventoryValue)}`,
      trend: "up",
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10",
      href: "/finance",
    },
    {
      title: "Total Customers",
      value: String(customers.length),
      change: `${gpus.length} GPUs`,
      trend: "up",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/customers",
    },
    {
      title: "Low Stock Items",
      value: String(lowStockItems.length),
      change: `${parts.length} items`,
      trend: "alert",
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
      href: "/inventory?view=low",
    },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.filter((stat) => isAdmin || !["Today's Revenue", "Monthly Revenue"].includes(stat.title)).map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} to={stat.href} className="block rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
            <Card className="h-full shadow-sm transition-colors hover:bg-accent/40 cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === "up" && <TrendingUp className="h-4 w-4 text-success" />}
                      {stat.trend === "down" && <TrendingDown className="h-4 w-4 text-destructive" />}
                      {stat.trend === "alert" && <AlertTriangle className="h-4 w-4 text-warning" />}
                      <span
                        className={`text-sm font-medium ${
                          stat.trend === "up"
                            ? "text-success"
                            : stat.trend === "down"
                            ? "text-destructive"
                            : "text-warning"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            </Link>
          );
        })}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Repair Notifications</CardTitle>
            <CardDescription>Due dates, waiting jobs, ready devices, and unpaid completed repairs</CardDescription>
          </div>
          <Link to="/repairs"><Button variant="ghost" size="sm">View Repairs<ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </CardHeader>
        <CardContent>
          {repairNotifications.length === 0 ? (
            <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No repair notifications right now.</p>
          ) : (
            <div className="grid gap-3">
              {repairNotifications.slice(0, 12).map(({ id, reason, ticket, due }) => (
                <Link key={id} to={`/repairs/${ticket.id}`} className="grid gap-3 rounded-md border p-3 transition-colors hover:bg-accent/40 md:grid-cols-[180px_1fr_150px_150px]">
                  <div>
                    <Badge variant="outline" className={notificationToneClasses[due.tone]}>{reason}</Badge>
                    <p className="mt-2 text-sm font-semibold">{ticket.ticketNumber || ticket.id}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{ticket.customer}</p>
                    <p className="truncate text-sm text-muted-foreground">{ticket.device}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="text-sm font-medium">{labelForRepairStatus(ticket.status)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{ticket.estimatedCompletion || "No expected date"}</p>
                    <p className={`text-sm font-medium ${due.tone === "destructive" ? "text-destructive" : due.tone === "warning" ? "text-warning" : due.tone === "success" ? "text-success" : ""}`}>{due.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin && <>
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue and repair count trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0F8B8D"
                  strokeWidth={2}
                  name="Revenue (PKR)"
                />
                <Line
                  type="monotone"
                  dataKey="repairs"
                  stroke="#F4A261"
                  strokeWidth={2}
                  name="Repairs"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Repair Status Distribution */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Repair Status</CardTitle>
            <CardDescription>Current repair distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={repairStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {repairStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {repairStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest system activities</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activity.avatar} />
                    <AvatarFallback>{activity.customer[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{activity.customer}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      activity.type === "repair"
                        ? "default"
                        : activity.type === "payment" || activity.type === "sale" || activity.type === "stock"
                        ? "secondary"
                        : activity.type === "delivery" || activity.type === "gpu"
                        ? "outline"
                        : "destructive"
                    }
                  >
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Low Stock Alert</CardTitle>
              <CardDescription>Items need reordering</CardDescription>
            </div>
            <Link to="/inventory">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-destructive">
                        {item.stock} {item.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Min: {item.reorderLevel}
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={(item.stock / item.reorderLevel) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/repairs">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <Wrench className="h-8 w-8 mx-auto text-primary mb-2" />
              <h3 className="font-medium">Repairing</h3>
              <p className="text-xs text-muted-foreground mt-1">Manage tickets</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/inventory">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <Boxes className="h-8 w-8 mx-auto text-accent mb-2" />
              <h3 className="font-medium">Inventory</h3>
              <p className="text-xs text-muted-foreground mt-1">Products & stock</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/billing">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 mx-auto text-success mb-2" />
              <h3 className="font-medium">Billing</h3>
              <p className="text-xs text-muted-foreground mt-1">Invoices & payments</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/customers">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto text-warning mb-2" />
              <h3 className="font-medium">Customers</h3>
              <p className="text-xs text-muted-foreground mt-1">Customer directory</p>
            </CardContent>
          </Card>
        </Link>
      </div>
      </>}
    </div>
  );
}
