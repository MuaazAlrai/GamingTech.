import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Edit, QrCode, MessageSquare, FileText, Image, Clock, CheckCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Separator } from "../../components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";

const timelineEvents = [
  {
    status: "Received",
    description: "Ticket created and device received",
    timestamp: "2024-06-30 10:30 AM",
    user: "Receptionist - Sara Khan",
    notes: "Device received in original box with controller and cables",
  },
  {
    status: "Assigned",
    description: "Assigned to technician",
    timestamp: "2024-06-30 10:45 AM",
    user: "Manager - Ahmed Ali",
    notes: "Assigned to Ali Hassan based on workload",
  },
  {
    status: "Diagnosing",
    description: "Diagnosis in progress",
    timestamp: "2024-06-30 11:00 AM",
    user: "Technician - Ali Hassan",
    notes: "Initial diagnosis shows PSU failure. Running comprehensive tests.",
  },
  {
    status: "Waiting Approval",
    description: "Customer approval required",
    timestamp: "2024-06-30 02:15 PM",
    user: "Technician - Ali Hassan",
    notes: "Confirmed PSU failure. Estimated cost: Rs. 15,000. Awaiting customer approval.",
  },
];

export function RepairDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentStatus, setCurrentStatus] = useState("Diagnosing");

  const handleStatusUpdate = (newStatus: string) => {
    setCurrentStatus(newStatus);
    toast.success(`Status updated to ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/repairs")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Repair Ticket Details</h1>
            <p className="text-sm text-muted-foreground mt-1">RPR-2024-1234</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </Button>
          <Button size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Status</Label>
                <Select value={currentStatus} onValueChange={handleStatusUpdate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Received">Received</SelectItem>
                    <SelectItem value="Diagnosing">Diagnosing</SelectItem>
                    <SelectItem value="Waiting Approval">Waiting Approval</SelectItem>
                    <SelectItem value="Waiting Parts">Waiting Parts</SelectItem>
                    <SelectItem value="Repairing">Repairing</SelectItem>
                    <SelectItem value="Testing">Testing</SelectItem>
                    <SelectItem value="Ready">Ready for Pickup</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Add Note</Label>
                <Textarea placeholder="Add status update note..." rows={3} />
              </div>
              <Button className="w-full">Save Update</Button>
            </CardContent>
          </Card>

          {/* Tabs for Details */}
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="parts">Parts</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Repair Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {timelineEvents.map((event, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                          {index < timelineEvents.length - 1 && (
                            <div className="w-0.5 flex-1 bg-border mt-2" style={{ minHeight: "40px" }} />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold text-sm">{event.status}</h4>
                            <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{event.description}</p>
                          <p className="text-xs text-muted-foreground mb-2">{event.user}</p>
                          {event.notes && (
                            <div className="bg-muted rounded-lg p-3 text-sm">
                              {event.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Device Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Device</p>
                      <p className="font-medium">PlayStation 5</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Model</p>
                      <p className="font-medium">CFI-1115A</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Serial Number</p>
                      <p className="font-medium">PS5123456789</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Warranty</p>
                      <p className="font-medium">Out of Warranty</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground text-sm mb-2">Issue Description</p>
                    <p className="text-sm">
                      Device not turning on. Customer reported it suddenly shut down during gameplay and won't power back on.
                      All LEDs are off, no response to power button. Device was not exposed to liquid or physical damage.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground text-sm mb-2">Included Accessories</p>
                    <p className="text-sm">Controller (x1), HDMI Cable, Power Cable, Original Box</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Diagnosis & Solution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-muted-foreground text-sm mb-2">Diagnosis</p>
                    <p className="text-sm">
                      Comprehensive testing revealed PSU (Power Supply Unit) failure. Unit tested with multimeter shows
                      no output voltage. Mainboard appears to be functional based on visual inspection.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground text-sm mb-2">Recommended Solution</p>
                    <p className="text-sm">
                      Replace PSU with genuine Sony replacement part. Testing required post-installation to ensure
                      mainboard functionality.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="parts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Parts Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">PlayStation 5 PSU Replacement</p>
                        <p className="text-xs text-muted-foreground">Part #: PS5-PSU-CFI</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">Rs. 12,000</p>
                        <Badge variant="outline" className="mt-1">In Stock</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium text-sm">Labor Charges</p>
                        <p className="text-xs text-muted-foreground">Diagnosis + Installation</p>
                      </div>
                      <p className="font-semibold">Rs. 3,000</p>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">Total Estimated Cost</p>
                      <p className="text-lg font-bold text-[#22C55E]">Rs. 15,000</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Device Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <Image className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <Image className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <Image className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <Button variant="outline">
                        <Image className="h-4 w-4 mr-2" />
                        Add Photo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">AK</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Ahmed Khan</p>
                  <p className="text-sm text-muted-foreground">Customer ID: CUS-2024-456</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">+92 300 1234567</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Repairs</span>
                  <span className="font-medium">12</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Customer
              </Button>
            </CardContent>
          </Card>

          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-400">
                  {currentStatus}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority</span>
                <Badge variant="destructive">High</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">2024-06-30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Completion</span>
                <span className="font-medium">2024-07-02</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assigned To</span>
                <span className="font-medium">Ali Hassan</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Cost</span>
                <span className="text-lg font-bold text-[#22C55E]">Rs. 15,000</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Generate Invoice
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send SMS Update
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                View History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
