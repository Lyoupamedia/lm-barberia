import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import type { Tables } from "@/integrations/supabase/types";

type Invoice = Tables<"invoices"> & { clients?: { name: string } | null };

export default function InvoicesPage() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name: string; price: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ client_id: "", selectedServices: [] as string[] });

  const fetchData = async () => {
    const [invRes, clientRes, serviceRes] = await Promise.all([
      supabase.from("invoices").select("*, clients(name)").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name"),
      supabase.from("services").select("id, name, price"),
    ]);
    setInvoices(invRes.data || []);
    setClients(clientRes.data || []);
    setServices(serviceRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!user || !form.client_id || form.selectedServices.length === 0) return;
    try {
      const selectedSvcs = services.filter((s) => form.selectedServices.includes(s.id));
      const total = selectedSvcs.reduce((s, svc) => s + svc.price, 0);

      const { data: invoice, error } = await supabase.from("invoices").insert({
        client_id: form.client_id,
        barber_id: user.id,
        total_amount: total,
        status: "draft",
      }).select().single();
      if (error) throw error;

      const items = selectedSvcs.map((svc) => ({
        invoice_id: invoice.id,
        service_id: svc.id,
        description: svc.name,
        quantity: 1,
        unit_price: svc.price,
        total: svc.price,
      }));
      const { error: itemsError } = await supabase.from("invoice_items").insert(items);
      if (itemsError) throw itemsError;

      toast({ title: "Invoice created" });
      setDialogOpen(false);
      setForm({ client_id: "", selectedServices: [] });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("invoices").update({ status }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchData();
  };

  const handleDelete = async (id: string) => {
    try {
      // Delete items first, then invoice
      await supabase.from("invoice_items").delete().eq("invoice_id", id);
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Invoice deleted" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleService = (id: string) => {
    setForm((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(id)
        ? prev.selectedServices.filter((s) => s !== id)
        : [...prev.selectedServices, id],
    }));
  };

  const statusColor = (s: string) => {
    if (s === "paid") return "bg-success/15 text-success border-success/30";
    if (s === "sent") return "bg-info/15 text-info border-info/30";
    return "bg-muted text-muted-foreground";
  };

  const selectedTotal = services.filter((s) => form.selectedServices.includes(s.id)).reduce((sum, s) => sum + s.price, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="page-header">Invoices</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Create Invoice</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-heading">New Invoice</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Client</Label>
                  <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Services</Label>
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                    {services.map((s) => (
                      <label key={s.id} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent/50">
                        <Checkbox checked={form.selectedServices.includes(s.id)} onCheckedChange={() => toggleService(s.id)} />
                        <span className="flex-1 text-sm">{s.name}</span>
                        <span className="text-sm font-medium">${s.price}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-t">
                  <span className="font-medium">Total:</span>
                  <span className="text-lg font-bold font-heading">${selectedTotal.toFixed(2)}</span>
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={!form.client_id || form.selectedServices.length === 0}>Create Invoice</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-56">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : invoices.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No invoices yet</TableCell></TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.clients?.name || "Unknown"}</TableCell>
                    <TableCell>{new Date(inv.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">${Number(inv.total_amount).toFixed(2)}</TableCell>
                    <TableCell><Badge variant="outline" className={statusColor(inv.status)}>{inv.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {inv.status === "draft" && <Button variant="outline" size="sm" onClick={() => updateStatus(inv.id, "sent")}>Mark Sent</Button>}
                        {inv.status === "sent" && <Button variant="outline" size="sm" onClick={() => updateStatus(inv.id, "paid")}>Mark Paid</Button>}
                        {isAdmin && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(inv.id)}>
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
