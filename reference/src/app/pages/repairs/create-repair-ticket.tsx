import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload, Camera, QrCode } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { toast } from "sonner";

export function CreateRepairTicket() {
  const navigate = useNavigate();
  const [customerType, setCustomerType] = useState("existing");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Repair ticket created successfully!");
    navigate("/repairs");
  };

  return (
    <div className="space-y-6 max-w-4xl pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/repairs")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Repair Ticket</h1>
          <p className="text-muted-foreground mt-1">Add a new repair request to the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Select existing customer or add new one</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                type="button"
                variant={customerType === "existing" ? "default" : "outline"}
                onClick={() => setCustomerType("existing")}
                className="flex-1"
              >
                Existing Customer
              </Button>
              <Button
                type="button"
                variant={customerType === "new" ? "default" : "outline"}
                onClick={() => setCustomerType("new")}
                className="flex-1"
              >
                New Customer
              </Button>
            </div>

            {customerType === "existing" ? (
              <div className="space-y-2">
                <Label htmlFor="customer">Select Customer</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Search customer by name or phone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Ahmed Khan - +92 300 1234567</SelectItem>
                    <SelectItem value="2">Sara Ali - +92 301 9876543</SelectItem>
                    <SelectItem value="3">Bilal Ahmed - +92 333 4567890</SelectItem>
                    <SelectItem value="4">Fatima Noor - +92 321 1112233</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name</Label>
                  <Input id="customerName" placeholder="Enter customer name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input id="customerPhone" type="tel" placeholder="+92 300 1234567" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email (Optional)</Label>
                  <Input id="customerEmail" type="email" placeholder="customer@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerAddress">Address</Label>
                  <Input id="customerAddress" placeholder="Customer address" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Information */}
        <Card>
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
            <CardDescription>Enter details about the device</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deviceType">Device Type</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gaming_pc">Gaming PC</SelectItem>
                    <SelectItem value="laptop">Laptop</SelectItem>
                    <SelectItem value="computer">Desktop Computer</SelectItem>
                    <SelectItem value="playstation">PlayStation</SelectItem>
                    <SelectItem value="xbox">Xbox</SelectItem>
                    <SelectItem value="nintendo">Nintendo Switch</SelectItem>
                    <SelectItem value="gpu">Graphics Card</SelectItem>
                    <SelectItem value="motherboard">Motherboard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand/Manufacturer</Label>
                <Input id="brand" placeholder="e.g., Sony, Microsoft, ASUS" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input id="model" placeholder="e.g., PlayStation 5, Xbox Series X" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number (Optional)</Label>
                <div className="flex gap-2">
                  <Input id="serialNumber" placeholder="Enter serial number" />
                  <Button type="button" variant="outline" size="icon">
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessories">Accessories/Items Included</Label>
              <Input
                id="accessories"
                placeholder="e.g., Controller, Power Cable, HDMI Cable"
              />
            </div>
          </CardContent>
        </Card>

        {/* Problem Description */}
        <Card>
          <CardHeader>
            <CardTitle>Problem Description</CardTitle>
            <CardDescription>Describe the issue and diagnostic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="issueTitle">Issue Title</Label>
              <Input id="issueTitle" placeholder="e.g., HDMI Port Not Working" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueDescription">Detailed Description</Label>
              <Textarea
                id="issueDescription"
                placeholder="Provide detailed description of the problem, what the customer reported, and any initial observations..."
                rows={4}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Estimated Cost (PKR)</Label>
                <Input id="estimatedCost" type="number" placeholder="8500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Device Condition</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Scratches", "Dents", "Water Damage", "Previous Repairs"].map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox id={condition} />
                    <label htmlFor={condition} className="text-sm cursor-pointer">
                      {condition}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Device Photos (Optional)</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button type="button" variant="outline" className="h-32 flex flex-col gap-2">
                  <Camera className="h-6 w-6" />
                  <span className="text-sm">Take Photo</span>
                </Button>
                <Button type="button" variant="outline" className="h-32 flex flex-col gap-2">
                  <Upload className="h-6 w-6" />
                  <span className="text-sm">Upload Photo</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment & Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment & Timeline</CardTitle>
            <CardDescription>Assign technician and set timeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="technician">Assign Technician</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto Assign</SelectItem>
                    <SelectItem value="1">Ali Hassan - PlayStation Expert</SelectItem>
                    <SelectItem value="2">Usman Tariq - Laptop Specialist</SelectItem>
                    <SelectItem value="3">Hassan Raza - PC Hardware</SelectItem>
                    <SelectItem value="4">Zain Abbas - Gaming Consoles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedCompletion">Estimated Completion</Label>
                <Input id="estimatedCompletion" type="date" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any internal notes for technicians..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            Create Repair Ticket
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/repairs")}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
