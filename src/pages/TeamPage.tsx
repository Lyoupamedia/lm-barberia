import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, Calendar, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface TeamMember {
  user_id: string;
  full_name: string;
  role: AppRole | null;
  totalIncome: number;
  clientCount: number;
  appointmentCount: number;
}

export default function TeamPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeam = async () => {
    const [profilesRes, rolesRes, incomeRes, clientsRes, appointmentsRes] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("income").select("barber_id, amount"),
      supabase.from("clients").select("barber_id"),
      supabase.from("appointments").select("barber_id"),
    ]);

    const rolesMap = new Map<string, AppRole>();
    (rolesRes.data || []).forEach((r) => rolesMap.set(r.user_id, r.role));

    const profiles = profilesRes.data || [];
    const stats: TeamMember[] = profiles.map((p) => ({
      user_id: p.user_id,
      full_name: p.full_name || "Unknown",
      role: rolesMap.get(p.user_id) || null,
      totalIncome: (incomeRes.data || []).filter((i) => i.barber_id === p.user_id).reduce((s, i) => s + Number(i.amount), 0),
      clientCount: (clientsRes.data || []).filter((c) => c.barber_id === p.user_id).length,
      appointmentCount: (appointmentsRes.data || []).filter((a) => a.barber_id === p.user_id).length,
    }));

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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            <span>Manage roles</span>
          </div>
        </div>

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
                  <div>
                    <p className="font-semibold font-heading">{b.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {i === 0 ? "🏆 Top Performer" : `#${i + 1} Performer`}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="text-center rounded-lg bg-muted p-2">
                    <DollarSign className="h-4 w-4 mx-auto text-primary mb-1" />
                    <p className="text-xs text-muted-foreground">Income</p>
                    <p className="text-sm font-bold">${b.totalIncome}</p>
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

        {/* Full table with role management */}
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Total Income</TableHead>
                <TableHead>Clients</TableHead>
                <TableHead>Appointments</TableHead>
                <TableHead className="w-40">Assign Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : members.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No team members yet</TableCell></TableRow>
              ) : (
                members.map((m) => (
                  <TableRow key={m.user_id}>
                    <TableCell className="font-medium">{m.full_name}</TableCell>
                    <TableCell>{roleBadge(m.role)}</TableCell>
                    <TableCell>${m.totalIncome.toLocaleString()}</TableCell>
                    <TableCell>{m.clientCount}</TableCell>
                    <TableCell>{m.appointmentCount}</TableCell>
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
