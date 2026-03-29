import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Users, Calendar, TrendingUp, CreditCard, Award, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  clientCount: number;
  appointmentCount: number;
  topBarber: string;
  monthlyData: { month: string; income: number }[];
}

interface RecentAppointment {
  id: string;
  appointment_date: string;
  status: string;
  clients: { name: string } | null;
}

interface RecentClient {
  id: string;
  name: string;
  phone: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const { t, formatCurrency } = useSettings();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0, totalExpenses: 0, clientCount: 0, appointmentCount: 0, topBarber: "—", monthlyData: [],
  });
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
  const [recentClients, setRecentClients] = useState<RecentClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      try {
        const [incomeRes, clientsRes, appointmentsRes, expensesRes, recentAppRes, recentCliRes] = await Promise.all([
          supabase.from("income").select("amount, barber_id, income_date"),
          supabase.from("clients").select("id"),
          supabase.from("appointments").select("id"),
          isAdmin ? supabase.from("expenses").select("amount") : Promise.resolve({ data: [] }),
          supabase.from("appointments").select("id, appointment_date, status, clients(name)").order("appointment_date", { ascending: false }).limit(5),
          supabase.from("clients").select("id, name, phone, created_at").order("created_at", { ascending: false }).limit(5),
        ]);

        const totalIncome = (incomeRes.data || []).reduce((sum, i) => sum + Number(i.amount), 0);
        const totalExpenses = (expensesRes.data || []).reduce((sum, e) => sum + Number(e.amount), 0);

        const barberIncome: Record<string, number> = {};
        (incomeRes.data || []).forEach((i) => {
          barberIncome[i.barber_id] = (barberIncome[i.barber_id] || 0) + Number(i.amount);
        });
        let topBarberId = "";
        let topAmount = 0;
        Object.entries(barberIncome).forEach(([id, amount]) => {
          if (amount > topAmount) { topBarberId = id; topAmount = amount; }
        });

        let topBarberName = "—";
        if (topBarberId) {
          const { data: profile } = await supabase.from("profiles").select("full_name").eq("user_id", topBarberId).maybeSingle();
          if (profile) topBarberName = profile.full_name || "Unknown";
        }

        const months: { month: string; income: number }[] = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthStr = d.toLocaleDateString("en-US", { month: "short" });
          const monthIncome = (incomeRes.data || [])
            .filter((inc) => {
              const id = new Date(inc.income_date);
              return id.getMonth() === d.getMonth() && id.getFullYear() === d.getFullYear();
            })
            .reduce((sum, inc) => sum + Number(inc.amount), 0);
          months.push({ month: monthStr, income: monthIncome });
        }

        setStats({ totalIncome, totalExpenses, clientCount: clientsRes.data?.length || 0, appointmentCount: appointmentsRes.data?.length || 0, topBarber: topBarberName, monthlyData: months });
        setRecentAppointments((recentAppRes.data as RecentAppointment[]) || []);
        setRecentClients(recentCliRes.data || []);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [user, isAdmin]);

  const statusColor = (s: string) => {
    if (s === "completed") return "bg-success/15 text-success border-success/30";
    if (s === "cancelled") return "bg-destructive/15 text-destructive border-destructive/30";
    return "bg-warning/15 text-warning border-warning/30";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="page-header">{t("dashboard")}</h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title={t("total_income")} value={formatCurrency(stats.totalIncome)} icon={<DollarSign className="h-5 w-5" />} />
          {isAdmin && (
            <StatCard title={t("total_expenses")} value={formatCurrency(stats.totalExpenses)} icon={<CreditCard className="h-5 w-5" />} />
          )}
          <StatCard title={t("profit")} value={formatCurrency(stats.totalIncome - stats.totalExpenses)} icon={<TrendingUp className="h-5 w-5" />} />
          <StatCard title={t("clients")} value={stats.clientCount} icon={<Users className="h-5 w-5" />} />
          <StatCard title={t("appointments")} value={stats.appointmentCount} icon={<Calendar className="h-5 w-5" />} />
          {isAdmin && (
            <StatCard title={t("top_barber")} value={stats.topBarber} icon={<Award className="h-5 w-5" />} />
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-lg">{t("recent_appointments")}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/appointments")}>{t("view_all")}</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("client")}</TableHead>
                    <TableHead>{t("date")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAppointments.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-4 text-muted-foreground">{t("no_appointments_yet")}</TableCell></TableRow>
                  ) : (
                    recentAppointments.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.clients?.name || "Unknown"}</TableCell>
                        <TableCell className="text-sm">{new Date(a.appointment_date).toLocaleDateString()}</TableCell>
                        <TableCell><Badge variant="outline" className={statusColor(a.status)}>{a.status}</Badge></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => navigate("/appointments")}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-lg">{t("recent_clients")}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/clients")}>{t("view_all")}</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("phone")}</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentClients.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">{t("no_clients_yet")}</TableCell></TableRow>
                  ) : (
                    recentClients.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="text-sm">{c.phone || "—"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">{t("income_overview")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar dataKey="income" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
