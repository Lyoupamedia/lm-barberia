import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Income = Tables<"income"> & { clients?: { name: string } | null; services?: { name: string } | null };

export default function IncomePage() {
  const { user, isAdmin } = useAuth();
  const { t, formatCurrency, currencySymbol } = useSettings();
  const { toast } = useToast();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name: string; price: number }[]>([]);
  const [commissionRate, setCommissionRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [form, setForm] = useState({ client_id: "", service_id: "", amount: "", description: "", income_date: new Date().toISOString().split("T")[0] });

  const fetchData = async () => {
    const [incRes, clientRes, serviceRes] = await Promise.all([
      supabase.from("income").select("*, clients(name), services(name)").order("income_date", { ascending: false }),
      supabase.from("clients").select("id, name"),
      supabase.from("services").select("id, name, price"),
    ]);
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("commission_rate").eq("user_id", user.id).maybeSingle();
      if (profile) setCommissionRate(Number(profile.commission_rate) || 0);
    }
    setIncomes(incRes.data || []);
    setClients(clientRes.data || []);
    setServices(serviceRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleServiceChange = (serviceId: string) => {
    const svc = services.find((s) => s.id === serviceId);
    setForm({ ...form, service_id: serviceId, amount: svc ? String(svc.price) : form.amount });
  };

  const openNew = () => {
    setEditingIncome(null);
    setForm({ client_id: "", service_id: "", amount: "", description: "", income_date: new Date().toISOString().split("T")[0] });
    setDialogOpen(true);
  };

  const openEdit = (i: Income) => {
    setEditingIncome(i);
    setForm({ client_id: i.client_id || "", service_id: i.service_id || "", amount: String(i.amount), description: i.description || "", income_date: i.income_date });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const payload = { client_id: form.client_id || null, service_id: form.service_id || null, amount: parseFloat(form.amount), description: form.description, income_date: form.income_date };
      if (editingIncome) {
        const { error } = await supabase.from("income").update(payload).eq("id", editingIncome.id);
        if (error) throw error;
        toast({ title: t("edit_income") });
      } else {
        const { error } = await supabase.from("income").insert({ ...payload, barber_id: user.id });
        if (error) throw error;
        toast({ title: t("record_income") });
      }
      setDialogOpen(false);
      setEditingIncome(null);
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("income").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: t("delete") }); fetchData(); }
  };

  const today = incomes.filter((i) => i.income_date === new Date().toISOString().split("T")[0]).reduce((s, i) => s + Number(i.amount), 0);
  const total = incomes.reduce((s, i) => s + Number(i.amount), 0);
  const totalCommission = total * (commissionRate / 100);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="page-header">{t("income")}</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />{t("record_income")}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-heading">{editingIncome ? t("edit_income") : t("record_income")}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{t("service")}</Label>
                  <Select value={form.service_id} onValueChange={handleServiceChange}>
                    <SelectTrigger><SelectValue placeholder={t("select_service")} /></SelectTrigger>
                    <SelectContent>{services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} — {currencySymbol}{s.price}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("client")}</Label>
                  <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                    <SelectTrigger><SelectValue placeholder={`${t("select_client")} (${t("optional")})`} /></SelectTrigger>
                    <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>{t("amount")} ({currencySymbol})</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
                <div><Label>{t("date")}</Label><Input type="date" value={form.income_date} onChange={(e) => setForm({ ...form, income_date: e.target.value })} /></div>
                <div><Label>{t("description")}</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                {commissionRate > 0 && form.amount && (
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <p className="text-muted-foreground">{t("commission")} ({commissionRate}%): <span className="font-bold text-primary">{formatCurrency(parseFloat(form.amount) * commissionRate / 100)}</span></p>
                  </div>
                )}
                <Button onClick={handleSave} className="w-full">{editingIncome ? t("update") : t("save")} {t("income")}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t("today")}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold font-heading">{formatCurrency(today)}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t("total_income")}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold font-heading">{formatCurrency(total)}</p></CardContent></Card>
          {commissionRate > 0 && (
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-1"><Percent className="h-3.5 w-3.5" />{t("my_commission")} ({commissionRate}%)</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold font-heading text-primary">{formatCurrency(totalCommission)}</p></CardContent></Card>
          )}
        </div>

        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("date")}</TableHead>
                <TableHead>{t("service")}</TableHead>
                <TableHead>{t("client")}</TableHead>
                <TableHead>{t("amount")}</TableHead>
                {commissionRate > 0 && <TableHead>{t("commission")}</TableHead>}
                <TableHead className="w-24">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t("loading")}</TableCell></TableRow>
              ) : incomes.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t("no_income_recorded")}</TableCell></TableRow>
              ) : (
                incomes.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{new Date(i.income_date).toLocaleDateString()}</TableCell>
                    <TableCell>{i.services?.name || i.description || "—"}</TableCell>
                    <TableCell>{i.clients?.name || "—"}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(Number(i.amount))}</TableCell>
                    {commissionRate > 0 && (
                      <TableCell className="font-medium text-primary">{formatCurrency(Number(i.amount) * commissionRate / 100)}</TableCell>
                    )}
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(i)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(i.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
