import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload, Camera, Save, QrCode } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Checkbox } from "../../components/ui/checkbox";
import { toast } from "sonner";

const deviceCategories = [
  "Gaming PC",
  "Laptop",
  "PlayStation",
  "Xbox",
  "Nintendo Switch",
  "Graphics Card",
  "Motherboard",
  "Mobile Phone",
  "Tablet",
  "Other",
];

const commonIssues: Record<string, string[]> = {
  "Gaming PC": ["Not turning on", "Overheating", "Blue screen", "Performance issues", "Hardware upgrade"],
  "PlayStation": ["Not turning on", "Disc drive issues", "Overheating", "Controller problems", "HDMI issues"],
  "Xbox": ["Not turning on", "Disc drive issues", "Red ring", "Controller problems", "Network issues"],
  "Laptop": ["Screen issues", "Battery problems", "Overheating", "Keyboard malfunction", "Charging issues"],
  "Graphics Card": ["No display", "Artifacts", "Overheating", "Driver issues", "Fan not working"],
};

export function CreateRepairTicket() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customIssue, setCustomIssue] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Repair ticket created successfully!", {
      description: "Ticket ID: RPR-2024-1235",
    });
    setTimeout(() => {
      navigate("/repairs");
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/repairs")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Create New Repair Ticket</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in the details to create a new repair ticket
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input id="customerName" placeholder="Enter customer name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" type="tel" placeholder="+92 300 1234567" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="customer@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnic">CNIC/ID (Optional)</Label>
                <Input id="cnic" placeholder="12345-1234567-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="Enter customer address" rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Device Information */}
        <Card>
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Device Category *</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand/Manufacturer</Label>
                <Input id="brand" placeholder="e.g., Sony, Asus, MSI" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">Model Number</Label>
                <Input id="model" placeholder="e.g., PS5 CFI-1115A" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serial">Serial Number</Label>
                <Input id="serial" placeholder="Enter serial number" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accessories">Included Accessories</Label>
              <Textarea
                id="accessories"
                placeholder="e.g., Controller, Charger, Cables, Box, etc."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Issue Details */}
        <Card>
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Issue Type *</Label>
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="customIssue"
                  checked={customIssue}
                  onCheckedChange={(checked) => setCustomIssue(checked as boolean)}
                />
                <label htmlFor="customIssue" className="text-sm cursor-pointer">
                  Custom issue (not in list)
                </label>
              </div>
              {!customIssue && selectedCategory && commonIssues[selectedCategory] ? (
                <RadioGroup>
                  {commonIssues[selectedCategory].map((issue) => (
                    <div key={issue} className="flex items-center space-x-2">
                      <RadioGroupItem value={issue} id={issue} />
                      <Label htmlFor={issue} className="cursor-pointer">
                        {issue}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Input placeholder="Describe the issue" required />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of the issue, symptoms, and any relevant information..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="warranty">Warranty Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select warranty status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Warranty">In Warranty</SelectItem>
                    <SelectItem value="Out of Warranty">Out of Warranty</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technician Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Technician Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="technician">Assign Technician</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-assign or select technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-assign (Recommended)</SelectItem>
                  <SelectItem value="ali">Ali Hassan (Available)</SelectItem>
                  <SelectItem value="usman">Usman Tariq (Available)</SelectItem>
                  <SelectItem value="ahmed">Ahmed Raza (Busy - 3 tickets)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Estimates */}
        <Card>
          <CardHeader>
            <CardTitle>Estimates (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Estimated Cost (Rs.)</Label>
                <Input id="estimatedCost" type="number" placeholder="15000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedTime">Estimated Completion</Label>
                <Input id="estimatedTime" type="date" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Device Photos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Upload photos of the device and any visible damage
              </p>
              <div className="flex gap-2 justify-center">
                <Button type="button" variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
                <Button type="button" variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Agreement */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
              <Checkbox id="agreement" required />
              <div className="space-y-1">
                <label htmlFor="agreement" className="text-sm font-medium cursor-pointer">
                  Customer Agreement *
                </label>
                <p className="text-xs text-muted-foreground">
                  Customer has read and agreed to the repair terms and conditions, including diagnostic fees,
                  repair costs, and data backup responsibility.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button type="submit" size="lg" className="flex-1 sm:flex-none">
            <Save className="h-4 w-4 mr-2" />
            Create Ticket
          </Button>
          <Button type="button" variant="outline" size="lg" className="flex-1 sm:flex-none">
            <QrCode className="h-4 w-4 mr-2" />
            Generate QR
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate("/repairs")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
