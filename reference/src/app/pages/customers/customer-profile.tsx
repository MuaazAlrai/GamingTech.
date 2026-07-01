import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";

export function CustomerProfile() {
  const navigate = useNavigate();
  const { id } = useParams();

  const customer = {
    name: "Ahmed Khan",
    phone: "+92 300 1234567",
    email: "ahmed.khan@email.com",
    address: "123 Main Street, Lahore",
    joinedDate: "2023-01-15",
    totalRepairs: 12,
    totalSpent: 145000,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed",
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/customers")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Customer Profile</h1>
          <p className="text-muted-foreground mt-1">Complete customer information</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={customer.avatar} />
                  <AvatarFallback className="text-2xl">{customer.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{customer.name}</h2>
                  <Badge variant="secondary" className="mt-2">Regular Customer</Badge>
                </div>
                <div className="w-full space-y-3 pt-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{customer.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {customer.joinedDate}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Repairs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{customer.totalRepairs}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">₨{customer.totalSpent.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Repair History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No recent repairs</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
