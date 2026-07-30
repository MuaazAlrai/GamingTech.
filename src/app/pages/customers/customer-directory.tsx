import { useState } from "react";
import { Link } from "react-router";
import { Eye, Search, Plus, Phone, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataPagination } from "../../components/shared/data-pagination";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Textarea } from "../../components/ui/textarea";
import { usePagination } from "../../hooks/use-pagination";
import { usePersistentState } from "../../hooks/use-persistent-state";
import { CUSTOMER_PHONE_MESSAGE, isValidCustomerPhone, normalizeCustomerPhone, sanitizeCustomerPhone } from "../../utils/phone";

type Customer = {
  id: string;
  name: string;
  phone: string;
  address?: string;
  description?: string;
};

const initialCustomers: Customer[] = [];

export function CustomerDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = usePersistentState<Customer[]>("gamingtech.customers", initialCustomers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    description: "",
  });

  const openAddDialog = () => {
    setEditingCustomer(null);
    setFormData({ name: "", phone: "", address: "", description: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address ?? "",
      description: customer.description ?? "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const phone = sanitizeCustomerPhone(formData.phone);
    if (!isValidCustomerPhone(phone)) {
      toast.error(CUSTOMER_PHONE_MESSAGE);
      return;
    }
    const duplicateCustomer = customers.find((customer) => normalizeCustomerPhone(customer.phone) === normalizeCustomerPhone(phone) && customer.id !== editingCustomer?.id);
    if (duplicateCustomer) {
      toast.error("This phone number is already linked with another customer.");
      return;
    }

    if (editingCustomer) {
      setCustomers((current) => current.map((customer) => (
        customer.id === editingCustomer.id
          ? { ...customer, name: formData.name.trim(), phone, address: formData.address.trim(), description: formData.description.trim() }
          : customer
      )));
    } else {
      setCustomers((current) => [
        ...current,
        {
          id: String(Date.now()),
          name: formData.name.trim(),
          phone,
          address: formData.address.trim(),
          description: formData.description.trim(),
        },
      ]);
    }

    setDialogOpen(false);
    toast.success(editingCustomer ? "Customer updated." : "Customer added.");
  };

  const deleteCustomer = (id: string) => {
    const customer = customers.find((item) => item.id === id);
    if (!customer) return;
    if (!window.confirm(`Delete ${customer.name}? This customer will be removed immediately.`)) return;
    setCustomers((current) => current.filter((customer) => customer.id !== id));
    toast.success("Customer deleted.");
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery),
  );
  const customerPagination = usePagination(filteredCustomers, 10);

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Directory</h1>
          <p className="mt-1 text-muted-foreground">Manage all customer information</p>
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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10"
            />
          </div>

          <div className="rounded-md border">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="w-[180px]">Contact</TableHead>
                  <TableHead className="w-[140px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      No customers yet. Add your first customer.
                    </TableCell>
                  </TableRow>
                ) : customerPagination.pagedItems.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.name}`} />
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
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/customers/${customer.id}`}>
                          <Button variant="outline" size="icon" className="app-action-icon view" title="View Customer">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="outline" size="icon" className="app-action-icon edit" title="Edit Customer" onClick={() => openEditDialog(customer)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="app-action-icon delete" title="Delete Customer" onClick={() => deleteCustomer(customer.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DataPagination
            page={customerPagination.page}
            totalPages={customerPagination.totalPages}
            startItem={customerPagination.startItem}
            endItem={customerPagination.endItem}
            totalItems={customerPagination.totalItems}
            onPageChange={customerPagination.setPage}
            label="customers"
          />
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
                onChange={(event) => setFormData({ ...formData, phone: sanitizeCustomerPhone(event.target.value) })}
                type="tel"
                inputMode="tel"
                placeholder="03XXXXXXXXX or +92XXXXXXXXXX"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerAddress">Address</Label>
              <Textarea
                id="customerAddress"
                value={formData.address}
                onChange={(event) => setFormData({ ...formData, address: event.target.value })}
                rows={3}
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingCustomer ? "Save Changes" : "Add Customer"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
