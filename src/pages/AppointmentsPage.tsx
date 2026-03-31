import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { createNotification } from "@/utils/notifications";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Appointment = Tables<"appointments"> & { clients?: { name: string } | null };

export default function AppointmentsPage() {
  const { user, isAdmin } = useAuth();
  const { t } = useSettings();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [barbers, setBarbers] = useState<{ user_id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [form, setForm] = useState({ client_id: "", barber_id: "", appointment_date: "", status: "pending", notes: "" });

  const fetchData = async () => {
    const [appRes, clientRes] = await Promise.all([
      supabase.from("appointments").select("*, clients(name)").order("appointment_date", { ascending: false }),
      supabase.from("clients").select("id, name"),
    ]);
    setAppointments(appRes.data || []);
    setClients(clientRes.data || []);
    if (isAdmin) {
      const { data } = await supabase.from("profiles").select("user_id, full_name");
      setBarbers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openNew = () => { setEditingAppointment(null); setForm({ client_id: "", barber_id: "", appointment_date: "", status: "pending", notes: "" }); setDialogOpen(true); };
  const openEdit = (a: Appointment) => {
    setEditingAppointment(a);
    setForm({ client_id: a.client_id, barber_id: a.barber_id, appointment_date: new Date(a.appointment_date).toISOString().slice(0, 16), status: a.status, notes: a.notes || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      if (editingAppointment) {
        const { error } = await supabase.from("appointments").update({ client_id: form.client_id, barber_id: isAdmin ? form.barber_id : user.id, appointment_date: form.appointment_date, status: form.status, notes: form.notes || null }).eq("id", editingAppointment.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("appointments").insert({ client_id: form.client_id, barber_id: isAdmin ? form.barber_id : user.id, appointment_date: form.appointment_date, status: form.status, notes: form.notes || null });
        if (error) throw error;
      }
      setDialogOpen(false); setEditingAppointment(null); fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchData();
  };

  const statusColor = (s: string) => {
    if (s === "completed") return "bg-success/15 text-success border-success/30";
    if (s === "cancelled") return "bg-destructive/15 text-destructive border-destructive/30";
    return "bg-warning/15 text-warning border-warning/30";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="page-header">{t("appointments")}</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />{t("new_appointment")}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-heading">{editingAppointment ? t("edit_appointment") : t("new_appointment")}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{t("client")}</Label>
                  <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                    <SelectTrigger><SelectValue placeholder={t("select_client")} /></SelectTrigger>
                    <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {isAdmin && (
                  <div>
                    <Label>{t("barber")}</Label>
                    <Select value={form.barber_id} onValueChange={(v) => setForm({ ...form, barber_id: v })}>
                      <SelectTrigger><SelectValue placeholder={t("select_barber")} /></SelectTrigger>
                      <SelectContent>{barbers.map((b) => <SelectItem key={b.user_id} value={b.user_id}>{b.full_name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                <div><Label>{t("date_time")}</Label><Input type="datetime-local" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} /></div>
                {editingAppointment && (
                  <div>
                    <Label>{t("status")}</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">{t("pending")}</SelectItem>
                        <SelectItem value="completed">{t("completed")}</SelectItem>
                        <SelectItem value="cancelled">{t("cancelled")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div><Label>{t("notes")}</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                <Button onClick={handleSave} className="w-full">{editingAppointment ? t("update") : t("save")} {t("appointments")}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("client")}</TableHead>
                <TableHead>{t("date")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("notes")}</TableHead>
                <TableHead className="w-36">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t("loading")}</TableCell></TableRow>
              ) : appointments.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t("no_appointments")}</TableCell></TableRow>
              ) : (
                appointments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.clients?.name || "Unknown"}</TableCell>
                    <TableCell>{new Date(a.appointment_date).toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline" className={statusColor(a.status)}>{a.status}</Badge></TableCell>
                    <TableCell className="max-w-xs truncate">{a.notes || "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
