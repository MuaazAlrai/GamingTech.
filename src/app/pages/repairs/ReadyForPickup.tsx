import { Link } from "react-router";
import { CheckCircle, Phone, MessageSquare, Package } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

const readyRepairs = [
  {
    id: "RPR-2024-1231",
    customer: "Fatima Ahmed",
    phone: "+92 345 7777777",
    device: "RTX 4090 Graphics Card",
    completedDate: "2024-06-30",
    cost: "Rs. 35,000",
    notified: true,
    daysReady: 0,
  },
  {
    id: "RPR-2024-1225",
    customer: "Bilal Hussain",
    phone: "+92 333 2222222",
    device: "PlayStation 5",
    completedDate: "2024-06-29",
    cost: "Rs. 18,000",
    notified: true,
    daysReady: 1,
  },
  {
    id: "RPR-2024-1223",
    customer: "Ayesha Rahman",
    phone: "+92 321 8888888",
    device: "Gaming Laptop - MSI",
    completedDate: "2024-06-28",
    cost: "Rs. 22,000",
    notified: true,
    daysReady: 2,
  },
  {
    id: "RPR-2024-1220",
    customer: "Kamran Ali",
    phone: "+92 300 5555555",
    device: "Xbox Series S",
    completedDate: "2024-06-27",
    cost: "Rs. 9,500",
    notified: false,
    daysReady: 3,
  },
  {
    id: "RPR-2024-1217",
    customer: "Nida Khan",
    phone: "+92 312 9999999",
    device: "Nintendo Switch OLED",
    completedDate: "2024-06-26",
    cost: "Rs. 7,000",
    notified: true,
    daysReady: 4,
  },
  {
    id: "RPR-2024-1215",
    customer: "Fahad Ahmed",
    phone: "+92 333 6666666",
    device: "Custom Gaming PC",
    completedDate: "2024-06-25",
    cost: "Rs. 45,000",
    notified: true,
    daysReady: 5,
  },
  {
    id: "RPR-2024-1212",
    customer: "Hina Malik",
    phone: "+92 301 4444444",
    device: "MacBook Pro 2020",
    completedDate: "2024-06-24",
    cost: "Rs. 28,000",
    notified: false,
    daysReady: 6,
  },
  {
    id: "RPR-2024-1210",
    customer: "Arslan Sheikh",
    phone: "+92 322 3333333",
    device: "PlayStation 4 Pro",
    completedDate: "2024-06-23",
    cost: "Rs. 12,000",
    notified: true,
    daysReady: 7,
  },
];

export function ReadyForPickup() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Ready for Pickup</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Completed repairs awaiting customer collection
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Notify All
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-500/10 text-green-700 dark:text-green-400 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{readyRepairs.length}</p>
                <p className="text-sm text-muted-foreground">Total Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/10 text-blue-700 dark:text-blue-400 p-3 rounded-lg">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {readyRepairs.filter(r => r.notified).length}
                </p>
                <p className="text-sm text-muted-foreground">Notified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500/10 text-orange-700 dark:text-orange-400 p-3 rounded-lg">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {readyRepairs.filter(r => r.daysReady > 3).length}
                </p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-[#22C55E]/10 text-[#22C55E] p-3 rounded-lg">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">Rs. 186.5K</p>
                <p className="text-sm text-muted-foreground">Pending Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ready Repairs List */}
      <div className="space-y-4">
        {readyRepairs.map((repair) => (
          <Card
            key={repair.id}
            className={`hover:shadow-md transition-shadow ${
              repair.daysReady > 3 ? "border-orange-500/50" : ""
            }`}
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        to={`/repairs/${repair.id}`}
                        className="font-semibold text-lg text-primary hover:underline"
                      >
                        {repair.id}
                      </Link>
                      <p className="text-sm text-muted-foreground">{repair.customer}</p>
                    </div>
                    <div className="flex gap-2">
                      {repair.notified ? (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
                          Notified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400">
                          Not Notified
                        </Badge>
                      )}
                      {repair.daysReady > 3 && (
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-400">
                          {repair.daysReady} days
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Device</p>
                      <p className="font-medium">{repair.device}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Completed</p>
                      <p className="font-medium">{repair.completedDate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Amount Due</p>
                      <p className="font-semibold text-[#22C55E]">{repair.cost}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{repair.phone}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    SMS
                  </Button>
                  <Link to={`/repairs/${repair.id}`}>
                    <Button size="sm">
                      Mark Delivered
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
