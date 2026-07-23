import { useMemo, useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { Edit, KeyRound, Plus, ShieldCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { auth } from "../../../firebase";
import { useAuth } from "../../auth/auth-context";
import { permissionModules } from "../../auth/permissions";
import type { PermissionKey } from "../../auth/permissions";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { AppUser } from "../../types/app-user";

const emptyForm = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  phone: "",
  designation: "",
  photoUrl: "",
  status: "active" as const,
  permissions: [] as PermissionKey[],
};

export function UserManagement() {
  const { user, isAdmin, hasPermission } = useAuth();
  const [users, setUsers] = usePersistentState<AppUser[]>("gamingtech.users", []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [form, setForm] = useState(emptyForm);
  const canCreate = hasPermission("users.create");
  const canEdit = hasPermission("users.edit");
  const canAssign = hasPermission("users.assignPermissions");
  const canReset = hasPermission("users.resetPassword");
  const sortedUsers = useMemo(() => [...users].sort((a, b) => Number(Boolean(b.isSuperAdmin)) - Number(Boolean(a.isSuperAdmin)) || a.fullName.localeCompare(b.fullName)), [users]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (target: AppUser) => {
    setEditing(target);
    setForm({
      fullName: target.fullName,
      username: target.username,
      email: target.email,
      password: "",
      phone: target.phone,
      designation: target.designation,
      photoUrl: target.photoUrl ?? "",
      status: target.status,
      permissions: target.permissions,
    });
    setOpen(true);
  };

  const togglePermission = (permission: PermissionKey, checked: boolean) => {
    if (!canAssign) return;
    setForm((current) => ({
      ...current,
      permissions: checked ? Array.from(new Set([...current.permissions, permission])) : current.permissions.filter((item) => item !== permission),
    }));
  };

  const toggleModule = (permissions: PermissionKey[], checked: boolean) => {
    if (!canAssign) return;
    setForm((current) => ({
      ...current,
      permissions: checked ? Array.from(new Set([...current.permissions, ...permissions])) : current.permissions.filter((item) => !permissions.includes(item)),
    }));
  };

  const saveUser = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing && !canCreate) return toast.error("You do not have permission to create users.");
    if (editing && !canEdit) return toast.error("You do not have permission to edit users.");
    const email = form.email.trim().toLowerCase();
    const duplicate = users.some((item) => item.email.toLowerCase() === email && item.id !== editing?.id);
    if (duplicate) return toast.error("This email already exists.");
    if (editing?.isSuperAdmin && editing.email.toLowerCase() === user?.email?.toLowerCase() && form.status !== "active") {
      return toast.error("Super Admin cannot deactivate their own account.");
    }
    const nextUser: AppUser = {
      id: editing?.id ?? `USR-${Date.now()}`,
      uid: editing?.uid,
      fullName: form.fullName.trim(),
      username: form.username.trim(),
      email,
      phone: form.phone.trim(),
      designation: form.designation.trim(),
      status: editing?.isSuperAdmin ? "active" : form.status,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
      lastLogin: editing?.lastLogin,
      photoUrl: form.photoUrl.trim(),
      permissions: editing?.isSuperAdmin ? editing.permissions : form.permissions,
      isSuperAdmin: editing?.isSuperAdmin,
    };
    setUsers((current) => editing ? current.map((item) => item.id === editing.id ? nextUser : item) : [nextUser, ...current]);
    setOpen(false);
    toast.success(editing ? "User updated." : "User profile created. Create the Firebase login account from Authentication if needed.");
  };

  const setStatus = (target: AppUser, active: boolean) => {
    if (!canEdit) return;
    if (target.isSuperAdmin && target.email.toLowerCase() === user?.email?.toLowerCase()) return toast.error("Super Admin cannot deactivate their own account.");
    setUsers((current) => current.map((item) => item.id === target.id ? { ...item, status: active ? "active" : "inactive" } : item));
  };

  const resetPassword = async (target: AppUser) => {
    if (!canReset) return;
    await sendPasswordResetEmail(auth, target.email);
    toast.success(`Password reset email sent to ${target.email}.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Create users, control status, and assign exact permissions.</p>
        </div>
        {canCreate && <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Create User</Button>}
      </div>

      <Card>
        <CardHeader><CardTitle>Users</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.map((target) => (
                  <TableRow key={target.id}>
                    <TableCell><div className="font-medium">{target.fullName}{target.isSuperAdmin && <Badge className="ml-2">Super Admin</Badge>}<p className="text-xs text-muted-foreground">{target.email}</p></div></TableCell>
                    <TableCell>{target.username}</TableCell>
                    <TableCell>{target.phone || "-"}</TableCell>
                    <TableCell>{target.designation || "-"}</TableCell>
                    <TableCell><Badge variant={target.status === "active" ? "default" : "secondary"}>{target.status}</Badge></TableCell>
                    <TableCell>{target.lastLogin ? new Date(target.lastLogin).toLocaleString() : "Never"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canEdit && <Button variant="outline" size="icon" onClick={() => openEdit(target)}><Edit className="h-4 w-4" /></Button>}
                        {canReset && <Button variant="outline" size="icon" onClick={() => resetPassword(target)}><KeyRound className="h-4 w-4" /></Button>}
                        {canEdit && <Button variant="outline" size="icon" onClick={() => setStatus(target, target.status !== "active")} disabled={target.isSuperAdmin && target.email.toLowerCase() === user?.email?.toLowerCase()}><UserX className="h-4 w-4" /></Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader><DialogTitle>{editing ? "Edit User" : "Create User"}</DialogTitle></DialogHeader>
          <form onSubmit={saveUser} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div><Label>Full Name</Label><Input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required /></div>
              <div><Label>Username</Label><Input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required disabled={Boolean(editing)} /></div>
              <div><Label>Password</Label><Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={editing ? "Use reset password" : "For admin record"} /></div>
              <div><Label>Phone Number</Label><Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></div>
              <div><Label>Designation</Label><Input value={form.designation} onChange={(event) => setForm({ ...form, designation: event.target.value })} /></div>
              <div className="md:col-span-2"><Label>Profile Photo URL</Label><Input value={form.photoUrl} onChange={(event) => setForm({ ...form, photoUrl: event.target.value })} /></div>
              <div className="flex items-center justify-between rounded-lg border p-3"><div><Label>Status</Label><p className="text-xs text-muted-foreground">Inactive users are signed out.</p></div><Switch checked={form.status === "active"} disabled={editing?.isSuperAdmin} onCheckedChange={(checked) => setForm({ ...form, status: checked ? "active" : "inactive" })} /></div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Permissions</h2>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {permissionModules.map((module) => {
                  const keys = module.permissions.map((permission) => permission.key);
                  const allChecked = keys.every((key) => form.permissions.includes(key));
                  return (
                    <Card key={module.id} className="shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div><CardTitle className="text-base">{module.label}</CardTitle><p className="text-xs text-muted-foreground">{module.description}</p></div>
                          <label className="flex items-center gap-2 text-sm"><Checkbox checked={allChecked} disabled={!canAssign || editing?.isSuperAdmin} onCheckedChange={(checked) => toggleModule(keys, Boolean(checked))} />Select All</label>
                        </div>
                      </CardHeader>
                      <CardContent className="grid gap-2 sm:grid-cols-2">
                        {module.permissions.map((permission) => (
                          <label key={permission.key} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                            <Checkbox checked={form.permissions.includes(permission.key)} disabled={!canAssign || editing?.isSuperAdmin} onCheckedChange={(checked) => togglePermission(permission.key, Boolean(checked))} />
                            {permission.label}
                          </label>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              {(isAdmin || canCreate || canEdit) && <Button type="submit">{editing ? "Save User" : "Create User"}</Button>}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
