import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Clock,
  User,
  Smartphone,
  DollarSign,
  MessageSquare,
  Printer,
  Download,
  CheckCircle,
  Edit,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Separator } from "../../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Progress } from "../../components/ui/progress";

const repairData = {
  id: "RPR-2024-001",
  status: "repairing",
  priority: "high",
  createdAt: "2024-06-29 10:30 AM",
  estimatedCompletion: "2024-07-02",
  customer: {
    name: "Ahmed Khan",
    phone: "+92 300 1234567",
    email: "ahmed.khan@email.com",
    address: "123 Main Street, Lahore",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed",
  },
  device: {
    type: "PlayStation 5",
    brand: "Sony",
    model: "CFI-1216A",
    serial: "PS5-123456789",
    accessories: "Controller, Power Cable, HDMI Cable",
  },
  issue: {
    title: "HDMI Port Not Working",
    description:
      "Customer reported that the HDMI output is not working. Device powers on but no display output. Tested with multiple HDMI cables and displays - same issue persists.",
    condition: ["Scratches", "Previous Repairs"],
  },
  technician: {
    name: "Ali Hassan",
    role: "PlayStation Expert",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ali",
  },
  timeline: [
    { date: "2024-06-29 10:30 AM", status: "Received", note: "Device received and logged" },
    {
      date: "2024-06-29 11:15 AM",
      status: "Diagnosing",
      note: "Initial diagnosis started - HDMI port inspection",
    },
    {
      date: "2024-06-29 02:30 PM",
      status: "Waiting Approval",
      note: "Customer approval required for HDMI port replacement - ₨8,500",
    },
    {
      date: "2024-06-29 04:00 PM",
      status: "Repairing",
      note: "Approval received. HDMI port replacement in progress",
    },
  ],
  costs: {
    parts: 6000,
    labor: 2500,
    total: 8500,
    paid: 0,
    due: 8500,
  },
  parts: [
    { name: "HDMI Port (PS5)", quantity: 1, cost: 6000 },
    { name: "Thermal Paste", quantity: 1, cost: 0 },
  ],
};

export function RepairDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const progress = 60;

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/repairs")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{repairData.id}</h1>
              <Badge variant="default">Repairing</Badge>
              <Badge variant="destructive">High Priority</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Created on {repairData.createdAt}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Mark Complete
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Repair Progress</span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Received</span>
              <span>Diagnosing</span>
              <span>Repairing</span>
              <span>Testing</span>
              <span>Ready</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="parts">Parts Used</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              {/* Device Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Device Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Device Type</p>
                      <p className="font-medium">{repairData.device.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Brand</p>
                      <p className="font-medium">{repairData.device.brand}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Model</p>
                      <p className="font-medium">{repairData.device.model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Serial Number</p>
                      <p className="font-medium">{repairData.device.serial}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Accessories Included</p>
                    <p className="font-medium">{repairData.device.accessories}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Problem Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Problem Description</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Issue Title</p>
                    <p className="font-medium text-lg">{repairData.issue.title}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Detailed Description</p>
                    <p className="text-sm">{repairData.issue.description}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Device Condition</p>
                    <div className="flex gap-2">
                      {repairData.issue.condition.map((cond) => (
                        <Badge key={cond} variant="outline">
                          {cond}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Repair Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {repairData.timeline.map((event, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-primary" />
                          {index !== repairData.timeline.length - 1 && (
                            <div className="w-0.5 h-full bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">{event.status}</p>
                            <p className="text-sm text-muted-foreground">{event.date}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{event.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="parts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Parts & Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {repairData.parts.map((part, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{part.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {part.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          {part.cost === 0 ? "Included" : `₨${part.cost.toLocaleString()}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={repairData.customer.avatar} />
                  <AvatarFallback>{repairData.customer.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{repairData.customer.name}</p>
                  <p className="text-sm text-muted-foreground">Regular Customer</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{repairData.customer.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{repairData.customer.email}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                View Customer Profile
              </Button>
            </CardContent>
          </Card>

          {/* Technician */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Technician</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={repairData.technician.avatar} />
                  <AvatarFallback>{repairData.technician.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{repairData.technician.name}</p>
                  <p className="text-sm text-muted-foreground">{repairData.technician.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Parts</span>
                <span className="font-medium">₨{repairData.costs.parts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Labor</span>
                <span className="font-medium">₨{repairData.costs.labor.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-medium">Total</span>
                <span className="font-bold">₨{repairData.costs.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid</span>
                <span className="text-success">₨{repairData.costs.paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Due</span>
                <span className="text-destructive">₨{repairData.costs.due.toLocaleString()}</span>
              </div>
              <Button className="w-full mt-4">Record Payment</Button>
            </CardContent>
          </Card>

          {/* Estimated Completion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{repairData.createdAt.split(" ")[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Completion</span>
                <span className="font-medium">{repairData.estimatedCompletion}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
