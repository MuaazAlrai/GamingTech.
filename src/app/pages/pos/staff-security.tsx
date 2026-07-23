import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Clock3, LockKeyhole, LogIn, LogOut, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../auth/auth-context";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { PosSale } from "../../types/pos-sale";
import type { CashShift, StaffActivity } from "../../types/staff";
import type { CustomerPayment } from "../../types/customer";

const money = (value: number) => `Rs ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export function StaffSecurity() {
  const { user, role, isAdmin } = useAuth();
  const [sales] = usePersistentState<PosSale[]>("gamingtech.posSales", []);
  const [payments] = usePersistentState<CustomerPayment[]>("gamingtech.customerPayments", []);
  const [shifts, setShifts] = usePersistentState<CashShift[]>("gamingtech.cashShifts", []);
  const [activities, setActivities] = usePersistentState<StaffActivity[]>("gamingtech.staffActivities", []);
  const [openingCash, setOpeningCash] = useState("0");
  const [closeOpen, setCloseOpen] = useState(false);
  const [closingForm, setClosingForm] = useState({ countedCash: "", note: "" });
  const activeShift = shifts.find((shift) => shift.userId === user?.uid && shift.status === "open");
  const shiftSales = activeShift ? sales.filter((sale) => sale.shiftId === activeShift.id && (sale.status ?? "completed") === "completed") : [];
  const cashSales = shiftSales.filter((sale) => sale.paymentMethod === "Cash").reduce((sum, sale) => sum + (sale.paidAmount ?? sale.total), 0);
  const cashKhataPayments = activeShift ? payments.filter((payment) => payment.shiftId === activeShift.id && payment.method === "Cash").reduce((sum, payment) => sum + payment.amount, 0) : 0;
  const expectedCash = (activeShift?.openingCash ?? 0) + cashSales + cashKhataPayments;

  const addActivity = (action: string, details: string, reference?: string) => {
    if (!user || !role) return;
    setActivities((current) => [{ id: `ACT-${Date.now()}`, date: new Date().toISOString(), userId: user.uid, userName: user.displayName || user.email || "Staff", role, action, details, reference }, ...current]);
  };

  const openShift = () => {
    if (!user || !role || activeShift) return;
    const amount = Number(openingCash);
    if (!Number.isFinite(amount) || amount < 0) return toast.error("Enter a valid opening cash amount.");
    const shift: CashShift = { id: `SHIFT-${Date.now()}`, userId: user.uid, cashierName: user.displayName || user.email || "Staff", role, openedAt: new Date().toISOString(), openingCash: amount, status: "open" };
    setShifts((current) => [shift, ...current]);
    addActivity("shift.opened", `Opening cash ${money(amount)}`, shift.id);
    toast.success("Shift opened successfully.");
  };

  const closeShift = (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeShift) return;
    const countedCash = Number(closingForm.countedCash);
    if (!Number.isFinite(countedCash) || countedCash < 0) return toast.error("Enter valid counted cash.");
    const now = new Date().toISOString();
    const difference = countedCash - expectedCash;
    setShifts((current) => current.map((shift) => shift.id === activeShift.id ? { ...shift, status: "closed", closedAt: now, expectedCash, countedCash, difference, note: closingForm.note.trim() } : shift));
    addActivity("shift.closed", `Expected ${money(expectedCash)}, counted ${money(countedCash)}, difference ${money(difference)}`, activeShift.id);
    setCloseOpen(false);
    setClosingForm({ countedCash: "", note: "" });
    toast.success("Shift closed and cash drawer recorded.");
  };

  const visibleShifts = isAdmin ? shifts : shifts.filter((shift) => shift.userId === user?.uid);
  const visibleActivities = (isAdmin ? activities : activities.filter((activity) => activity.userId === user?.uid)).slice(0, 100);

  return <div className="space-y-6 pb-20 lg:pb-6">
    <div className="flex items-center gap-4"><Link to="/pos"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link><div><h1 className="text-3xl font-bold">Staff & Security</h1><p className="mt-1 text-muted-foreground">Roles, shifts, cash drawer and activity history</p></div></div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><Card><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Logged-in User</p><p className="mt-1 font-bold">{user?.displayName || user?.email}</p><Badge className="mt-2 capitalize">{role}</Badge></div><ShieldCheck className="h-7 w-7 text-primary" /></div></CardContent></Card><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Shift Status</p><p className="mt-1 text-2xl font-bold">{activeShift ? "Open" : "Closed"}</p><p className="text-xs text-muted-foreground">{activeShift ? new Date(activeShift.openedAt).toLocaleString() : "Open a shift to track drawer cash"}</p></CardContent></Card><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Cash Sales</p><p className="mt-1 text-2xl font-bold">{money(cashSales)}</p><p className="text-xs text-muted-foreground">Current shift only</p></CardContent></Card><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Expected Drawer</p><p className="mt-1 text-2xl font-bold">{money(expectedCash)}</p><p className="text-xs text-muted-foreground">Opening cash + cash receipts</p></CardContent></Card></div>
    <Card><CardHeader><CardTitle>Shift Opening / Closing</CardTitle></CardHeader><CardContent>{activeShift ? <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{activeShift.id}</p><p className="text-sm text-muted-foreground">Opened by {activeShift.cashierName} with {money(activeShift.openingCash)}</p></div><Button variant="destructive" onClick={() => { setClosingForm({ countedCash: String(expectedCash), note: "" }); setCloseOpen(true); }}><LogOut className="mr-2 h-4 w-4" />Close Shift</Button></div> : <div className="flex flex-col gap-3 sm:flex-row sm:items-end"><div className="flex-1"><Label htmlFor="openingCash">Opening Cash</Label><Input id="openingCash" type="number" min="0" value={openingCash} onChange={(event) => setOpeningCash(event.target.value)} /></div><Button onClick={openShift}><LogIn className="mr-2 h-4 w-4" />Open Shift</Button></div>}</CardContent></Card>
    <Card><CardHeader><CardTitle>Cash Drawer History</CardTitle></CardHeader><CardContent><div className="overflow-x-auto rounded-md border"><Table><TableHeader><TableRow><TableHead>Cashier</TableHead><TableHead>Opened</TableHead><TableHead>Closed</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Opening</TableHead><TableHead className="text-right">Expected</TableHead><TableHead className="text-right">Counted</TableHead><TableHead className="text-right">Difference</TableHead></TableRow></TableHeader><TableBody>{visibleShifts.length === 0 ? <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">No shifts recorded.</TableCell></TableRow> : visibleShifts.map((shift) => <TableRow key={shift.id}><TableCell className="font-medium">{shift.cashierName}</TableCell><TableCell>{new Date(shift.openedAt).toLocaleString()}</TableCell><TableCell>{shift.closedAt ? new Date(shift.closedAt).toLocaleString() : "—"}</TableCell><TableCell><Badge variant={shift.status === "open" ? "default" : "secondary"}>{shift.status}</Badge></TableCell><TableCell className="text-right">{money(shift.openingCash)}</TableCell><TableCell className="text-right">{shift.expectedCash === undefined ? "—" : money(shift.expectedCash)}</TableCell><TableCell className="text-right">{shift.countedCash === undefined ? "—" : money(shift.countedCash)}</TableCell><TableCell className="text-right">{shift.difference === undefined ? "—" : money(shift.difference)}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>
    <Card><CardHeader><CardTitle><span className="flex items-center gap-2"><Clock3 className="h-5 w-5" />Activity History {isAdmin && <Badge variant="outline">All Staff</Badge>}</span></CardTitle></CardHeader><CardContent><div className="overflow-x-auto rounded-md border"><Table><TableHeader><TableRow><TableHead>Date & Time</TableHead><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Action</TableHead><TableHead>Details</TableHead></TableRow></TableHeader><TableBody>{visibleActivities.length === 0 ? <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground"><LockKeyhole className="mx-auto mb-2 h-6 w-6" />No activity recorded yet.</TableCell></TableRow> : visibleActivities.map((activity) => <TableRow key={activity.id}><TableCell>{new Date(activity.date).toLocaleString()}</TableCell><TableCell className="font-medium">{activity.userName}</TableCell><TableCell><Badge variant="outline" className="capitalize">{activity.role}</Badge></TableCell><TableCell>{activity.action}</TableCell><TableCell>{activity.details}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>
    <Dialog open={closeOpen} onOpenChange={setCloseOpen}><DialogContent><DialogHeader><DialogTitle>Close Cash Shift</DialogTitle></DialogHeader><form onSubmit={closeShift} className="space-y-4"><div className="rounded-lg bg-muted p-3"><p className="text-sm text-muted-foreground">Expected Cash</p><p className="text-2xl font-bold">{money(expectedCash)}</p></div><div><Label htmlFor="countedCash">Counted Cash</Label><Input id="countedCash" type="number" min="0" value={closingForm.countedCash} onChange={(event) => setClosingForm({ ...closingForm, countedCash: event.target.value })} required /></div><div><Label htmlFor="shiftNote">Closing Note</Label><Input id="shiftNote" value={closingForm.note} onChange={(event) => setClosingForm({ ...closingForm, note: event.target.value })} /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setCloseOpen(false)}>Cancel</Button><Button type="submit">Confirm Closing</Button></DialogFooter></form></DialogContent></Dialog>
  </div>;
}
