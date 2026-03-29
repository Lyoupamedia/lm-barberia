import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Settings, User, Building2, Globe, LayoutDashboard, Save } from "lucide-react";

interface SettingsData {
  business_name: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  language: string;
  currency: string;
  currency_symbol: string;
  visible_sections: Record<string, boolean>;
}

const defaultSettings: SettingsData = {
  business_name: "LM Barberia",
  business_address: "",
  business_phone: "",
  business_email: "",
  language: "en",
  currency: "USD",
  currency_symbol: "$",
  visible_sections: { income: true, expenses: true, clients: true, appointments: true, invoices: true, team: true },
};

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "pt", label: "Português" },
];

const currencies = [
  { value: "USD", symbol: "$", label: "USD ($)" },
  { value: "EUR", symbol: "€", label: "EUR (€)" },
  { value: "GBP", symbol: "£", label: "GBP (£)" },
  { value: "BRL", symbol: "R$", label: "BRL (R$)" },
  { value: "MXN", symbol: "$", label: "MXN ($)" },
  { value: "COP", symbol: "$", label: "COP ($)" },
  { value: "ARS", symbol: "$", label: "ARS ($)" },
  { value: "CLP", symbol: "$", label: "CLP ($)" },
];

const sectionLabels: Record<string, string> = {
  income: "Income",
  expenses: "Expenses",
  clients: "Clients",
  appointments: "Appointments",
  invoices: "Invoices",
  team: "Team",
};

export default function SettingsPage() {
  const { user, profile, isAdmin } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [profileForm, setProfileForm] = useState({ full_name: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setSettings({
          business_name: data.business_name,
          business_address: data.business_address || "",
          business_phone: data.business_phone || "",
          business_email: data.business_email || "",
          language: data.language,
          currency: data.currency,
          currency_symbol: data.currency_symbol,
          visible_sections: (data.visible_sections as Record<string, boolean>) || defaultSettings.visible_sections,
        });
      }

      if (profile) {
        setProfileForm({ full_name: profile.full_name, phone: profile.phone || "" });
      }
      setLoading(false);
    };
    load();
  }, [user, profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: profileForm.full_name.trim(), phone: profileForm.phone.trim() || null })
        .eq("user_id", user.id);
      if (error) throw error;
      toast({ title: "Profile updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        business_name: settings.business_name,
        business_address: settings.business_address,
        business_phone: settings.business_phone,
        business_email: settings.business_email,
        language: settings.language,
        currency: settings.currency,
        currency_symbol: settings.currency_symbol,
        visible_sections: settings.visible_sections,
      };

      const { data: existing } = await supabase
        .from("settings")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from("settings").update(payload).eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("settings").insert(payload);
        if (error) throw error;
      }

      toast({ title: "Settings saved" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCurrencyChange = (value: string) => {
    const curr = currencies.find((c) => c.value === value);
    setSettings({ ...settings, currency: value, currency_symbol: curr?.symbol || "$" });
  };

  const toggleSection = (key: string) => {
    setSettings({
      ...settings,
      visible_sections: { ...settings.visible_sections, [key]: !settings.visible_sections[key] },
    });
  };

  const initials = profileForm.full_name
    ? profileForm.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "U";

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
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="page-header">Settings</h1>
        </div>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="font-heading">My Profile</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary font-heading font-bold text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold font-heading">{profileForm.full_name || "User"}</p>
                <p className="text-sm text-muted-foreground capitalize">{isAdmin ? "Admin" : "Barber"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Full Name</Label>
                <Input value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="Phone number" />
              </div>
            </div>
            <Button onClick={handleSaveProfile} disabled={saving} size="sm">
              <Save className="h-4 w-4 mr-2" />Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Business Info (Admin only) */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="font-heading">Business Information</CardTitle>
                  <CardDescription>Your salon details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Business Name</Label>
                  <Input value={settings.business_name} onChange={(e) => setSettings({ ...settings, business_name: e.target.value })} />
                </div>
                <div>
                  <Label>Business Phone</Label>
                  <Input value={settings.business_phone} onChange={(e) => setSettings({ ...settings, business_phone: e.target.value })} placeholder="Business phone" />
                </div>
                <div>
                  <Label>Business Email</Label>
                  <Input type="email" value={settings.business_email} onChange={(e) => setSettings({ ...settings, business_email: e.target.value })} placeholder="contact@salon.com" />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={settings.business_address} onChange={(e) => setSettings({ ...settings, business_address: e.target.value })} placeholder="Street, City" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Language & Currency */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="font-heading">Language & Currency</CardTitle>
                <CardDescription>Regional preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Language</Label>
                <Select value={settings.language} onValueChange={(v) => setSettings({ ...settings, language: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {languages.map((l) => (
                      <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={settings.currency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Sections (Admin only) */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="font-heading">Dashboard Sections</CardTitle>
                  <CardDescription>Toggle which sections are visible in the sidebar</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(sectionLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">Show {label.toLowerCase()} in navigation</p>
                    </div>
                    <Switch
                      checked={settings.visible_sections[key] ?? true}
                      onCheckedChange={() => toggleSection(key)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Settings */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={saving} size="lg">
            <Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save All Settings"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
