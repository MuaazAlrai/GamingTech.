import { 
  Wrench, Package, DollarSign, Users, Clock, CheckCircle, 
  AlertTriangle, TrendingUp, Calendar, ArrowUp, ArrowDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Link } from "react-router";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const kpiData = [
  {
    title: "Today's Repairs",
    value: "24",
    change: "+12%",
    trend: "up",
    icon: Wrench,
    color: "text-[#2563EB]",
    bgColor: "bg-[#2563EB]/10",
  },
  {
    title: "Active Repairs",
    value: "47",
    change: "+8%",
    trend: "up",
    icon: Clock,
    color: "text-[#F59E0B]",
    bgColor: "bg-[#F59E0B]/10",
  },
  {
    title: "Today's Revenue",
    value: "Rs. 125,000",
    change: "+15%",
    trend: "up",
    icon: DollarSign,
    color: "text-[#22C55E]",
    bgColor: "bg-[#22C55E]/10",
  },
  {
    title: "Pending Payments",
    value: "Rs. 45,000",
    change: "-5%",
    trend: "down",
    icon: AlertTriangle,
    color: "text-[#EF4444]",
    bgColor: "bg-[#EF4444]/10",
  },
];

const revenueData = [
  { name: "Mon", revenue: 45000, repairs: 18 },
  { name: "Tue", revenue: 52000, repairs: 22 },
  { name: "Wed", revenue: 48000, repairs: 19 },
  { name: "Thu", revenue: 61000, repairs: 25 },
  { name: "Fri", revenue: 55000, repairs: 21 },
  { name: "Sat", revenue: 73000, repairs: 30 },
  { name: "Sun", revenue: 68000, repairs: 28 },
];

const repairStatusData = [
  { name: "Received", value: 12, color: "#2563EB" },
  { name: "Diagnosing", value: 8, color: "#06B6D4" },
  { name: "Repairing", value: 15, color: "#F59E0B" },
  { name: "Testing", value: 6, color: "#22C55E" },
  { name: "Ready", value: 8, color: "#8B5CF6" },
];

const categoryData = [
  { category: "Gaming PC", count: 45, revenue: "Rs. 450,000" },
  { category: "PlayStation", count: 38, revenue: "Rs. 285,000" },
  { category: "Xbox", count: 22, revenue: "Rs. 165,000" },
  { category: "Laptop", count: 31, revenue: "Rs. 310,000" },
  { category: "Graphics Card", count: 18, revenue: "Rs. 360,000" },
];

const recentRepairs = [
  { id: "RPR-2024-1234", customer: "Ahmed Khan", device: "PlayStation 5", status: "Diagnosing", priority: "High", date: "2024-06-30" },
  { id: "RPR-2024-1233", customer: "Sara Malik", device: "Gaming Laptop", status: "Repairing", priority: "Medium", date: "2024-06-29" },
  { id: "RPR-2024-1232", customer: "Ali Hassan", device: "Xbox Series X", status: "Testing", priority: "Low", date: "2024-06-29" },
  { id: "RPR-2024-1231", customer: "Fatima Ahmed", device: "RTX 4090", status: "Ready", priority: "High", date: "2024-06-28" },
  { id: "RPR-2024-1230", customer: "Usman Tariq", device: "Nintendo Switch", status: "Received", priority: "Medium", date: "2024-06-28" },
];

const lowStockItems = [
  { name: "HDMI Cables", current: 3, minimum: 10, status: "critical" },
  { name: "Thermal Paste", current: 5, minimum: 15, status: "low" },
  { name: "PS5 Controllers", current: 2, minimum: 8, status: "critical" },
  { name: "Laptop Batteries", current: 7, minimum: 12, status: "low" },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Executive Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your repair business today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 7 Days
          </Button>
          <Link to="/repairs/create">
            <Button size="sm">
              <Wrench className="h-4 w-4 mr-2" />
              New Repair
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {kpi.trend === "up" ? (
                      <ArrowUp className="h-3 w-3 text-[#22C55E]" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-[#EF4444]" />
                    )}
                    <span className={kpi.trend === "up" ? "text-[#22C55E]" : "text-[#EF4444]"}>
                      {kpi.change}
                    </span>
                    <span className="text-muted-foreground">vs last week</span>
                  </div>
                </div>
                <div className={`${kpi.bgColor} ${kpi.color} p-3 rounded-lg`}>
                  <kpi.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue & Repairs Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem"
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} name="Revenue (Rs.)" />
                <Line type="monotone" dataKey="repairs" stroke="#22C55E" strokeWidth={2} name="Repairs" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Repair Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Repair Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={repairStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {repairStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Repairs & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Repairs */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Repair Tickets</CardTitle>
            <Link to="/repairs">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRepairs.map((repair) => (
                <Link key={repair.id} to={`/repairs/${repair.id}`}>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{repair.id}</p>
                        <Badge 
                          variant={
                            repair.priority === "High" ? "destructive" : 
                            repair.priority === "Medium" ? "default" : 
                            "secondary"
                          }
                        >
                          {repair.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{repair.customer} - {repair.device}</p>
                      <p className="text-xs text-muted-foreground">{repair.date}</p>
                    </div>
                    <Badge variant="outline">{repair.status}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Low Stock Alerts</CardTitle>
            <Link to="/inventory">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{item.name}</p>
                    <Badge variant={item.status === "critical" ? "destructive" : "default"}>
                      {item.current} / {item.minimum}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        item.status === "critical" ? "bg-[#EF4444]" : "bg-[#F59E0B]"
                      }`}
                      style={{ width: `${(item.current / item.minimum) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <Link to="/inventory">
                <Button variant="outline" className="w-full mt-4" size="sm">
                  Open Inventory
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Repair Category Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryData.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex-1">
                  <p className="font-medium">{category.category}</p>
                  <p className="text-sm text-muted-foreground">{category.count} repairs this month</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#22C55E]">{category.revenue}</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/repairs/waiting-parts">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-[#F59E0B]/10 text-[#F59E0B] p-3 rounded-lg">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Waiting for Parts</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/repairs/ready-pickup">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-[#22C55E]/10 text-[#22C55E] p-3 rounded-lg">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">Ready for Pickup</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/customers">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-[#06B6D4]/10 text-[#06B6D4] p-3 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-sm text-muted-foreground">Total Customers</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/inventory">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-[#8B5CF6]/10 text-[#8B5CF6] p-3 rounded-lg">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">Rs. 2.5M</p>
                <p className="text-sm text-muted-foreground">Inventory Value</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
