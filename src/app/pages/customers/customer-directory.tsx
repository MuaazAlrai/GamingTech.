import { useState } from "react";
import { Link } from "react-router";
import { Search, Plus, Mail, Phone, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { usePersistentState } from "../../hooks/use-persistent-state";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  description?: string;
  totalRepairs: number;
  totalSpent: number;
};

const initialCustomers: Customer[] = [];

export function CustomerDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = usePersistentState<Customer[]>(
    "gamingtech.customers",
    initialCustomers,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    description: "",
    totalRepairs: "0",
    totalSpent: "0",
  });

  const openAddDialog = () => {
    setEditingCustomer(null);
    setFormData({ name: "", phone: "", email: "", address: "", description: "", totalRepairs: "0", totalSpent: "0" });
    setDialogOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address ?? "",
      description: customer.description ?? "",
      totalRepairs: String(customer.totalRepairs),
      totalSpent: String(customer.totalSpent),
    });
    setDialogOpen(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (editingCustomer) {
      setCustomers((current) =>
        current.map((customer) =>
          customer.id === editingCustomer.id
            ? {
                ...customer,
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                address: formData.address,
                description: formData.description,
                totalRepairs: Number(formData.totalRepairs),
                totalSpent: Number(formData.totalSpent),
              }
            : customer,
        ),
      );
    } else {
      setCustomers((current) => [
        ...current,
        {
          id: String(Date.now()),
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          description: formData.description,
          totalRepairs: Number(formData.totalRepairs),
          totalSpent: Number(formData.totalSpent),
        },
      ]);
    }

    setDialogOpen(false);
  };

  const deleteCustomer = (id: string) => {
    setCustomers((current) => current.filter((customer) => customer.id !== id));
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Customer Directory</h1>
          <p className="text-muted-foreground mt-1">Manage all customer information</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2" onClick={openAddDialog}>
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total Repairs</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No customers yet. Add your first customer.
                    </TableCell>
                  </TableRow>
                ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.name}`}
                          />
                          <AvatarFallback>{customer.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {customer.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{customer.totalRepairs}</TableCell>
                    <TableCell className="font-medium">
                      ₨{customer.totalSpent.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/customers/${customer.id}`}>
                          <Button variant="ghost" size="sm">
                          View Profile
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(customer)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteCustomer(customer.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCustomer ? "Edit Customer" : "Add Customer"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone</Label>
              <Input
                id="customerPhone"
                value={formData.phone}
                onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerAddress">Address</Label>
              <Input
                id="customerAddress"
                value={formData.address}
                onChange={(event) => setFormData({ ...formData, address: event.target.value })}
                placeholder="Customer address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerDescription">Description</Label>
              <Textarea
                id="customerDescription"
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                placeholder="Customer note, preference, or special instruction"
                rows={3}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="totalRepairs">Total Repairs</Label>
                <Input
                  id="totalRepairs"
                  type="number"
                  min="0"
                  value={formData.totalRepairs}
                  onChange={(event) => setFormData({ ...formData, totalRepairs: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalSpent">Total Spent</Label>
                <Input
                  id="totalSpent"
                  type="number"
                  min="0"
                  value={formData.totalSpent}
                  onChange={(event) => setFormData({ ...formData, totalSpent: event.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingCustomer ? "Save Changes" : "Add Customer"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
