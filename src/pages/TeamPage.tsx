import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, Users, Calendar, ShieldCheck, Plus, Percent, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface TeamMember {
  user_id: string;
  full_name: string;
  phone: string | null;
  role: AppRole | null;
  commission_rate: number;
  totalIncome: number;
  totalCommission: number;
  clientCount: number;
  appointmentCount: number;
}

export default function TeamPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [createForm, setCreateForm] = useState({ full_name: "", email: "", password: "", commission_rate: "50" });
  const [editForm, setEditForm] = useState({ full_name: "", phone: "", commission_rate: "" });

  const fetchTeam = async () => {
    const [profilesRes, rolesRes, incomeRes, clientsRes, appointmentsRes] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, phone, commission_rate"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("income").select("barber_id, amount"),
      supabase.from("clients").select("barber_id"),
      supabase.from("appointments").select("barber_id"),
    ]);

    const rolesMap = new Map<string, AppRole>();
    (rolesRes.data || []).forEach((r) => rolesMap.set(r.user_id, r.role));

    const profiles = profilesRes.data || [];
    const stats: TeamMember[] = profiles.map((p) => {
      const totalIncome = (incomeRes.data || [])
        .filter((i) => i.barber_id === p.user_id)
        .reduce((s, i) => s + Number(i.amount), 0);
      const rate = Number(p.commission_rate) || 0;
      return {
        user_id: p.user_id,
        full_name: p.full_name || "Unknown",
        phone: p.phone,
        role: rolesMap.get(p.user_id) || null,
        commission_rate: rate,
        totalIncome,
        totalCommission: totalIncome * (rate / 100),
        clientCount: (clientsRes.data || []).filter((c) => c.barber_id === p.user_id).length,
        appointmentCount: (appointmentsRes.data || []).filter((a) => a.barber_id === p.user_id).length,
      };
    });

    stats.sort((a, b) => b.totalIncome - a.totalIncome);
    setMembers(stats);
    setLoading(false);
  };

  useEffect(() => { fetchTeam(); }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      if (newRole === "none") {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", userId);
        if (error) throw error;
      } else {
        const existing = members.find((m) => m.user_id === userId);
        if (existing?.role) {
          const { error } = await supabase.from("user_roles").update({ role: newRole as AppRole }).eq("user_id", userId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole as AppRole });
          if (error) throw error;
        }
      }
      toast({ title: "Role updated" });
      fetchTeam();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleCreateBarber = async () => {
    if (!createForm.full_name || !createForm.email || !createForm.password) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    if (createForm.password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const res = await supabase.functions.invoke("create-barber", {
        body: {
          email: createForm.email.trim(),
          password: createForm.password,
          full_name: createForm.full_name.trim(),
          commission_rate: parseFloat(createForm.commission_rate) || 0,
        },
      });
      if (res.error) throw res.error;
      if (res.data?.error) throw new Error(res.data.error);
      toast({ title: "Barber created successfully!" });
      setCreateDialogOpen(false);
      setCreateForm({ full_name: "", email: "", password: "", commission_rate: "50" });
      fetchTeam();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const openEditProfile = (m: TeamMember) => {
    setEditingMember(m);
    setEditForm({ full_name: m.full_name, phone: m.phone || "", commission_rate: String(m.commission_rate) });
    setEditDialogOpen(true);
  };

  const handleEditProfile = async () => {
    if (!editingMember) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name.trim(),
          phone: editForm.phone.trim() || null,
          commission_rate: parseFloat(editForm.commission_rate) || 0,
        } as any)
        .eq("user_id", editingMember.user_id);
      if (error) throw error;
      toast({ title: "Profile updated" });
      setEditDialogOpen(false);
      setEditingMember(null);
      fetchTeam();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteMember = async (userId: string) => {
    try {
      // Remove role and profile (user auth record stays but they can't access anything)
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("profiles").delete().eq("user_id", userId);
      if (error) throw error;
      toast({ title: "Member removed" });
      fetchTeam();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const roleBadge = (role: AppRole | null) => {
    if (!role) return <Badge variant="outline" className="text-muted-foreground">No role</Badge>;
    if (role === "admin") return <Badge className="bg-primary/20 text-primary border-primary/30">Admin</Badge>;
    return <Badge variant="secondary">Barber</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="page-header">Team</h1>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Barber</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-heading">Create Barber Account</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Full Name</Label><Input value={createForm.full_name} onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })} placeholder="John Doe" /></div>
                <div><Label>Email</Label><Input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} placeholder="barber@example.com" /></div>
                <div><Label>Password</Label><Input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} placeholder="Min 6 characters" /></div>
                <div>
                  <Label>Commission Rate (%)</Label>
                  <Input type="number" min="0" max="100" value={createForm.commission_rate} onChange={(e) => setCreateForm({ ...createForm, commission_rate: e.target.value })} />
                  <p className="text-xs text-muted-foreground mt-1">Percentage of income the barber earns</p>
                </div>
                <Button onClick={handleCreateBarber} className="w-full" disabled={creating}>
                  {creating ? "Creating..." : "Create Barber"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Profile Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-heading">Edit Profile</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Full Name</Label><Input value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} placeholder="Phone number" /></div>
              <div>
                <Label>Commission Rate (%)</Label>
                <Input type="number" min="0" max="100" value={editForm.commission_rate} onChange={(e) => setEditForm({ ...editForm, commission_rate: e.target.value })} />
              </div>
              <Button onClick={handleEditProfile} className="w-full">Update Profile</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Top performers cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.filter((m) => m.role).slice(0, 3).map((b, i) => (
            <Card key={b.user_id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-heading font-bold">
                      {b.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold font-heading">{b.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {i === 0 ? "🏆 Top Performer" : `#${i + 1} Performer`} · {b.commission_rate}% commission
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openEditProfile(b)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="text-center rounded-lg bg-muted p-2">
                    <DollarSign className="h-4 w-4 mx-auto text-primary mb-1" />
                    <p className="text-xs text-muted-foreground">Income</p>
                    <p className="text-sm font-bold">${b.totalIncome.toLocaleString()}</p>
                  </div>
                  <div className="text-center rounded-lg bg-muted p-2">
                    <Percent className="h-4 w-4 mx-auto text-primary mb-1" />
                    <p className="text-xs text-muted-foreground">Commission</p>
                    <p className="text-sm font-bold">${b.totalCommission.toLocaleString()}</p>
                  </div>
                  <div className="text-center rounded-lg bg-muted p-2">
                    <Users className="h-4 w-4 mx-auto text-primary mb-1" />
                    <p className="text-xs text-muted-foreground">Clients</p>
                    <p className="text-sm font-bold">{b.clientCount}</p>
                  </div>
                  <div className="text-center rounded-lg bg-muted p-2">
                    <Calendar className="h-4 w-4 mx-auto text-primary mb-1" />
                    <p className="text-xs text-muted-foreground">Appts</p>
                    <p className="text-sm font-bold">{b.appointmentCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Full table */}
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Commission %</TableHead>
                <TableHead>Total Income</TableHead>
                <TableHead>Commission Earned</TableHead>
                <TableHead>Clients</TableHead>
                <TableHead>Assign Role</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : members.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No team members yet</TableCell></TableRow>
              ) : (
                members.map((m) => (
                  <TableRow key={m.user_id}>
                    <TableCell className="font-medium">{m.full_name}</TableCell>
                    <TableCell>{roleBadge(m.role)}</TableCell>
                    <TableCell>{m.role === "barber" ? `${m.commission_rate}%` : "—"}</TableCell>
                    <TableCell>${m.totalIncome.toLocaleString()}</TableCell>
                    <TableCell className="font-medium text-primary">${m.totalCommission.toLocaleString()}</TableCell>
                    <TableCell>{m.clientCount}</TableCell>
                    <TableCell>
                      <Select
                        value={m.role || "none"}
                        onValueChange={(val) => handleRoleChange(m.user_id, val)}
                        disabled={m.user_id === user?.id}
                      >
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No role</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="barber">Barber</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditProfile(m)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {m.user_id !== user?.id && (
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteMember(m.user_id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
