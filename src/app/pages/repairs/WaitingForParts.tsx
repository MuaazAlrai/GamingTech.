import { Link } from "react-router";
import { Package, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

const waitingRepairs = [
  {
    id: "RPR-2024-1229",
    customer: "Hassan Ali",
    device: "Gaming PC - Custom Build",
    partNeeded: "750W PSU - Corsair RM750x",
    supplier: "Parts Direct Ltd",
    orderDate: "2024-06-27",
    eta: "2024-07-02",
    status: "In Transit",
    cost: "Rs. 18,000",
  },
  {
    id: "RPR-2024-1226",
    customer: "Zainab Ahmed",
    device: "RTX 3080 Graphics Card",
    partNeeded: "GPU Cooler Fan",
    supplier: "Tech Supplies PK",
    orderDate: "2024-06-25",
    eta: "2024-07-01",
    status: "Ordered",
    cost: "Rs. 8,500",
  },
  {
    id: "RPR-2024-1224",
    customer: "Omar Farooq",
    device: "Xbox Series X",
    partNeeded: "Optical Drive Assembly",
    supplier: "Gaming Parts Hub",
    orderDate: "2024-06-24",
    eta: "2024-06-30",
    status: "Arrived",
    cost: "Rs. 12,000",
  },
  {
    id: "RPR-2024-1221",
    customer: "Sana Malik",
    device: "MacBook Air M1",
    partNeeded: "Replacement Battery",
    supplier: "Apple Authorized",
    orderDate: "2024-06-22",
    eta: "2024-07-05",
    status: "Ordered",
    cost: "Rs. 25,000",
  },
  {
    id: "RPR-2024-1218",
    customer: "Imran Khan",
    device: "PlayStation 4",
    partNeeded: "HDMI Port Assembly",
    supplier: "Console Parts Pro",
    orderDate: "2024-06-20",
    eta: "2024-06-29",
    status: "In Transit",
    cost: "Rs. 4,500",
  },
];

const statusColors: Record<string, string> = {
  "Ordered": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "In Transit": "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  "Arrived": "bg-green-500/10 text-green-700 dark:text-green-400",
};

export function WaitingForParts() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Waiting for Parts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Repairs on hold pending part arrival
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/10 text-blue-700 dark:text-blue-400 p-3 rounded-lg">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Parts Ordered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500/10 text-orange-700 dark:text-orange-400 p-3 rounded-lg">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">In Transit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-500/10 text-green-700 dark:text-green-400 p-3 rounded-lg">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Arrived</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Waiting Repairs List */}
      <div className="space-y-4">
        {waitingRepairs.map((repair) => (
          <Card key={repair.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link to={`/repairs/${repair.id}`} className="font-semibold text-lg text-primary hover:underline">
                        {repair.id}
                      </Link>
                      <p className="text-sm text-muted-foreground">{repair.customer}</p>
                    </div>
                    <Badge variant="outline" className={statusColors[repair.status]}>
                      {repair.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Device</p>
                      <p className="font-medium">{repair.device}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Part Needed</p>
                      <p className="font-medium">{repair.partNeeded}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Supplier</p>
                      <p className="font-medium">{repair.supplier}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Order Date</p>
                      <p className="font-medium">{repair.orderDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">ETA:</span>
                      <span className="font-medium">{repair.eta}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="font-semibold text-[#22C55E] ml-2">{repair.cost}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link to={`/repairs/${repair.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  {repair.status === "Arrived" && (
                    <Button size="sm">
                      Mark as Repairing
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
