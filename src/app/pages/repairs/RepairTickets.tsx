import { useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Filter, RefreshCw } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

const repairs = [
  {
    id: "RPR-2024-1234",
    customer: "Ahmed Khan",
    phone: "+92 300 1234567",
    device: "PlayStation 5",
    issue: "Not turning on",
    status: "Diagnosing",
    priority: "High",
    technician: "Ali Hassan",
    created: "2024-06-30 10:30 AM",
    estimated: "2024-07-02",
    cost: "Rs. 15,000",
  },
  {
    id: "RPR-2024-1233",
    customer: "Sara Malik",
    phone: "+92 321 9876543",
    device: "Gaming Laptop - Asus ROG",
    issue: "Overheating, GPU artifacts",
    status: "Repairing",
    priority: "Medium",
    technician: "Usman Tariq",
    created: "2024-06-29 02:15 PM",
    estimated: "2024-07-01",
    cost: "Rs. 25,000",
  },
  {
    id: "RPR-2024-1232",
    customer: "Ali Hassan",
    phone: "+92 333 5555555",
    device: "Xbox Series X",
    issue: "Disc drive not working",
    status: "Testing",
    priority: "Low",
    technician: "Ahmed Raza",
    created: "2024-06-29 09:00 AM",
    estimated: "2024-06-30",
    cost: "Rs. 8,000",
  },
  {
    id: "RPR-2024-1231",
    customer: "Fatima Ahmed",
    phone: "+92 345 7777777",
    device: "RTX 4090 Graphics Card",
    issue: "No display output",
    status: "Ready",
    priority: "High",
    technician: "Ali Hassan",
    created: "2024-06-28 11:45 AM",
    estimated: "2024-06-30",
    cost: "Rs. 35,000",
  },
  {
    id: "RPR-2024-1230",
    customer: "Usman Tariq",
    phone: "+92 301 2223333",
    device: "Nintendo Switch",
    issue: "Joy-Con drift",
    status: "Received",
    priority: "Medium",
    technician: "Unassigned",
    created: "2024-06-28 04:30 PM",
    estimated: "2024-07-01",
    cost: "Rs. 5,000",
  },
  {
    id: "RPR-2024-1229",
    customer: "Hassan Ali",
    phone: "+92 312 8888888",
    device: "Gaming PC - Custom Build",
    issue: "Random shutdowns, PSU issue",
    status: "Waiting Parts",
    priority: "High",
    technician: "Usman Tariq",
    created: "2024-06-27 01:00 PM",
    estimated: "2024-07-05",
    cost: "Rs. 18,000",
  },
  {
    id: "RPR-2024-1228",
    customer: "Ayesha Khan",
    phone: "+92 322 4444444",
    device: "MacBook Pro 2021",
    issue: "Liquid damage, keyboard not working",
    status: "Waiting Approval",
    priority: "High",
    technician: "Ali Hassan",
    created: "2024-06-27 10:15 AM",
    estimated: "2024-07-03",
    cost: "Rs. 45,000",
  },
  {
    id: "RPR-2024-1227",
    customer: "Bilal Ahmed",
    phone: "+92 333 9999999",
    device: "PlayStation 4 Pro",
    issue: "HDMI port repair",
    status: "Delivered",
    priority: "Low",
    technician: "Ahmed Raza",
    created: "2024-06-26 03:30 PM",
    estimated: "2024-06-28",
    cost: "Rs. 6,500",
  },
];

const statusColors: Record<string, string> = {
  "Received": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "Diagnosing": "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  "Waiting Approval": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  "Waiting Parts": "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  "Repairing": "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  "Testing": "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  "Ready": "bg-green-500/10 text-green-700 dark:text-green-400",
  "Delivered": "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  "Cancelled": "bg-red-500/10 text-red-700 dark:text-red-400",
};

const priorityColors: Record<string, string> = {
  "High": "destructive",
  "Medium": "default",
  "Low": "secondary",
};

export function RepairTickets() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredRepairs = repairs.filter(repair => {
    const matchesSearch = 
      repair.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.device.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || repair.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || repair.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusCount = (status: string) => {
    return repairs.filter(r => r.status === status).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Repair Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track all repair tickets
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/repairs/create">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Repair
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Received</p>
            <p className="text-2xl font-bold">{getStatusCount("Received")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Diagnosing</p>
            <p className="text-2xl font-bold">{getStatusCount("Diagnosing")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Repairing</p>
            <p className="text-2xl font-bold">{getStatusCount("Repairing")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Testing</p>
            <p className="text-2xl font-bold">{getStatusCount("Testing")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Ready</p>
            <p className="text-2xl font-bold">{getStatusCount("Ready")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Delivered</p>
            <p className="text-2xl font-bold">{getStatusCount("Delivered")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ticket ID, customer, or device..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Received">Received</SelectItem>
                <SelectItem value="Diagnosing">Diagnosing</SelectItem>
                <SelectItem value="Waiting Approval">Waiting Approval</SelectItem>
                <SelectItem value="Waiting Parts">Waiting Parts</SelectItem>
                <SelectItem value="Repairing">Repairing</SelectItem>
                <SelectItem value="Testing">Testing</SelectItem>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Repair Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Repair Tickets ({filteredRepairs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Est. Completion</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRepairs.map((repair) => (
                  <TableRow key={repair.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Link to={`/repairs/${repair.id}`} className="font-medium text-primary hover:underline">
                        {repair.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{repair.customer}</p>
                        <p className="text-xs text-muted-foreground">{repair.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="text-sm truncate">{repair.device}</p>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="text-sm truncate">{repair.issue}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[repair.status]}>
                        {repair.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={priorityColors[repair.priority] as any}>
                        {repair.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{repair.technician}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{repair.estimated}</p>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {repair.cost}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
