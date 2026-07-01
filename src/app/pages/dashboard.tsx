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
  { name: "Jan", revenue: 0, repairs: 0 },
  { name: "Feb", revenue: 0, repairs: 0 },
  { name: "Mar", revenue: 0, repairs: 0 },
  { name: "Apr", revenue: 0, repairs: 0 },
  { name: "May", revenue: 0, repairs: 0 },
  { name: "Jun", revenue: 0, repairs: 0 },
];

const repairStatusData = [
  { name: "Diagnosing", value: 0, color: "#E6A23A" },
  { name: "Repairing", value: 0, color: "#0F8B8D" },
  { name: "Waiting Parts", value: 0, color: "#D94841" },
  { name: "Testing", value: 0, color: "#F4A261" },
  { name: "Ready", value: 0, color: "#2E9D64" },
];

const recentActivities: {
  id: number;
  type: string;
  title: string;
  description: string;
  customer: string;
  time: string;
  avatar: string;
}[] = [];

const lowStockItems: { name: string; stock: number; reorderLevel: number; category: string }[] = [];

export function Dashboard() {
  const stats = [
    {
      title: "Today's Repairs",
      value: "0",
      change: "0%",
      trend: "up",
      icon: Wrench,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Repairs",
      value: "0",
      change: "0%",
      trend: "up",
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Waiting for Parts",
      value: "0",
      change: "0%",
      trend: "down",
      icon: Package,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Ready for Pickup",
      value: "0",
      change: "0%",
      trend: "up",
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Today's Revenue",
      value: "₨0",
      change: "0%",
      trend: "up",
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Monthly Revenue",
      value: "₨0",
      change: "0%",
      trend: "up",
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Total Customers",
      value: "0",
      change: "0",
      trend: "up",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Low Stock Items",
      value: "0",
      change: "0",
      trend: "alert",
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="shadow-sm">
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
          );
        })}
      </div>

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
        <Card className="shadow-sm">
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
              <h3 className="font-medium">Repairing</h3>
              <p className="text-xs text-muted-foreground mt-1">Manage tickets</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/inventory">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <Boxes className="h-8 w-8 mx-auto text-accent mb-2" />
              <h3 className="font-medium">GPU Inventory</h3>
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
