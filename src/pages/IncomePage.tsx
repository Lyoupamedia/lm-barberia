import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, DollarSign, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Income = Tables<"income"> & { clients?: { name: string } | null; services?: { name: string } | null };

export default function IncomePage() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name: string; price: number }[]>([]);
  const [commissionRate, setCommissionRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ client_id: "", service_id: "", amount: "", description: "", income_date: new Date().toISOString().split("T")[0] });

  const fetchData = async () => {
    const [incRes, clientRes, serviceRes] = await Promise.all([
      supabase.from("income").select("*, clients(name), services(name)").order("income_date", { ascending: false }),
      supabase.from("clients").select("id, name"),
      supabase.from("services").select("id, name, price"),
    ]);

    // Fetch commission rate for current user
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("commission_rate")
        .eq("user_id", user.id)
        .maybeSingle();
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

  const handleSave = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from("income").insert({
        barber_id: user.id,
        client_id: form.client_id || null,
        service_id: form.service_id || null,
        amount: parseFloat(form.amount),
        description: form.description,
        income_date: form.income_date,
      });
      if (error) throw error;
      toast({ title: "Income recorded" });
      setDialogOpen(false);
      setForm({ client_id: "", service_id: "", amount: "", description: "", income_date: new Date().toISOString().split("T")[0] });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const today = incomes.filter((i) => i.income_date === new Date().toISOString().split("T")[0]).reduce((s, i) => s + Number(i.amount), 0);
  const total = incomes.reduce((s, i) => s + Number(i.amount), 0);
  const totalCommission = total * (commissionRate / 100);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="page-header">Income</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Record Income</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-heading">Record Income</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Service</Label>
                  <Select value={form.service_id} onValueChange={handleServiceChange}>
                    <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                    <SelectContent>{services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} — ${s.price}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Client</Label>
                  <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select client (optional)" /></SelectTrigger>
                    <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Amount ($)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
                <div><Label>Date</Label><Input type="date" value={form.income_date} onChange={(e) => setForm({ ...form, income_date: e.target.value })} /></div>
                <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                {commissionRate > 0 && form.amount && (
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <p className="text-muted-foreground">Your commission ({commissionRate}%): <span className="font-bold text-primary">${(parseFloat(form.amount) * commissionRate / 100).toFixed(2)}</span></p>
                  </div>
                )}
                <Button onClick={handleSave} className="w-full">Save Income</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Today</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold font-heading">${today.toLocaleString()}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Income</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold font-heading">${total.toLocaleString()}</p></CardContent></Card>
          {commissionRate > 0 && (
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-1"><Percent className="h-3.5 w-3.5" />My Commission ({commissionRate}%)</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold font-heading text-primary">${totalCommission.toLocaleString()}</p></CardContent></Card>
          )}
        </div>

        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                {commissionRate > 0 && <TableHead>Commission</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : incomes.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No income recorded yet</TableCell></TableRow>
              ) : (
                incomes.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{new Date(i.income_date).toLocaleDateString()}</TableCell>
                    <TableCell>{i.services?.name || i.description || "—"}</TableCell>
                    <TableCell>{i.clients?.name || "—"}</TableCell>
                    <TableCell className="font-medium">${Number(i.amount).toFixed(2)}</TableCell>
                    {commissionRate > 0 && (
                      <TableCell className="font-medium text-primary">${(Number(i.amount) * commissionRate / 100).toFixed(2)}</TableCell>
                    )}
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
