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
  ShoppingCart,
  FileText,
  Boxes,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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

const revenueData = [
  { name: "Jan", revenue: 45000, repairs: 120 },
  { name: "Feb", revenue: 52000, repairs: 145 },
  { name: "Mar", revenue: 48000, repairs: 132 },
  { name: "Apr", revenue: 61000, repairs: 168 },
  { name: "May", revenue: 55000, repairs: 152 },
  { name: "Jun", revenue: 67000, repairs: 185 },
];

const repairStatusData = [
  { name: "Diagnosing", value: 18, color: "#F59E0B" },
  { name: "Repairing", value: 35, color: "#2563EB" },
  { name: "Waiting Parts", value: 12, color: "#EF4444" },
  { name: "Testing", value: 22, color: "#06B6D4" },
  { name: "Ready", value: 28, color: "#22C55E" },
];

const recentActivities = [
  {
    id: 1,
    type: "repair",
    title: "New repair ticket created",
    description: "PlayStation 5 - HDMI Port Issue",
    customer: "Ahmed Khan",
    time: "5 minutes ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed",
  },
  {
    id: 2,
    type: "payment",
    title: "Payment received",
    description: "Laptop Repair - Screen Replacement",
    customer: "Sara Ali",
    time: "15 minutes ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sara",
  },
  {
    id: 3,
    type: "delivery",
    title: "Device delivered",
    description: "Gaming PC - GPU Upgrade",
    customer: "Usman Tariq",
    time: "1 hour ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=usman",
  },
  {
    id: 4,
    type: "part",
    title: "Low stock alert",
    description: "iPhone 13 Screen - Only 5 units left",
    customer: "System",
    time: "2 hours ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=system",
  },
];

const lowStockItems = [
  { name: "iPhone 13 Screen", stock: 5, reorderLevel: 10, category: "Mobile Parts" },
  { name: "PS5 HDMI Port", stock: 3, reorderLevel: 8, category: "Gaming Parts" },
  { name: "Laptop Keyboard (Dell)", stock: 7, reorderLevel: 12, category: "Laptop Parts" },
  { name: "GPU Thermal Paste", stock: 4, reorderLevel: 15, category: "Accessories" },
];

export function Dashboard() {
  const stats = [
    {
      title: "Today's Repairs",
      value: "24",
      change: "+12%",
      trend: "up",
      icon: Wrench,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Repairs",
      value: "115",
      change: "+8%",
      trend: "up",
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Waiting for Parts",
      value: "12",
      change: "-5%",
      trend: "down",
      icon: Package,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Ready for Pickup",
      value: "28",
      change: "+15%",
      trend: "up",
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Today's Revenue",
      value: "₨245,000",
      change: "+18%",
      trend: "up",
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Monthly Revenue",
      value: "₨6,740,000",
      change: "+22%",
      trend: "up",
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Total Customers",
      value: "1,832",
      change: "+45",
      trend: "up",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Low Stock Items",
      value: "8",
      change: "Alert",
      trend: "alert",
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome Back, Admin! 👋</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/repairs/create">
            <Button className="gap-2">
              <Wrench className="h-4 w-4" />
              New Repair
            </Button>
          </Link>
          <Link to="/pos/new-sale">
            <Button variant="outline" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              New Sale
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
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
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
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
                  stroke="#2563EB"
                  strokeWidth={2}
                  name="Revenue (PKR)"
                />
                <Line
                  type="monotone"
                  dataKey="repairs"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  name="Repairs"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Repair Status Distribution */}
        <Card>
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
        <Card>
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
                        : activity.type === "payment"
                        ? "secondary"
                        : activity.type === "delivery"
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Low Stock Alert</CardTitle>
              <CardDescription>Items need reordering</CardDescription>
            </div>
            <Link to="/parts">
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
                        {item.stock} units
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
            <Button className="w-full mt-4" variant="outline">
              <Package className="mr-2 h-4 w-4" />
              Create Purchase Order
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/repairs">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <Wrench className="h-8 w-8 mx-auto text-primary mb-2" />
              <h3 className="font-medium">Repairs</h3>
              <p className="text-xs text-muted-foreground mt-1">Manage tickets</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/inventory">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <Boxes className="h-8 w-8 mx-auto text-accent mb-2" />
              <h3 className="font-medium">Inventory</h3>
              <p className="text-xs text-muted-foreground mt-1">Stock management</p>
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
    </div>
  );
}
