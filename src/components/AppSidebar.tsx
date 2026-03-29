import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  Receipt,
  FileText,
  UserCog,
  Scissors,
  CreditCard,
  Settings,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { isAdmin, profile, signOut } = useAuth();
  const { t, language } = useSettings();
  const isRTL = language === "ar";

  const adminItems = [
    { title: t("dashboard"), url: "/dashboard", icon: LayoutDashboard },
    { title: t("clients"), url: "/clients", icon: Users },
    { title: t("appointments"), url: "/appointments", icon: Calendar },
    { title: t("income"), url: "/income", icon: DollarSign },
    { title: t("expenses"), url: "/expenses", icon: CreditCard },
    { title: t("invoices"), url: "/invoices", icon: FileText },
    { title: t("services"), url: "/services", icon: Scissors },
    { title: t("team"), url: "/team", icon: UserCog },
    { title: t("settings"), url: "/settings", icon: Settings },
  ];

  const barberItems = [
    { title: t("dashboard"), url: "/dashboard", icon: LayoutDashboard },
    { title: t("my_clients"), url: "/clients", icon: Users },
    { title: t("my_appointments"), url: "/appointments", icon: Calendar },
    { title: t("my_income"), url: "/income", icon: DollarSign },
    { title: t("invoices"), url: "/invoices", icon: FileText },
    { title: t("settings"), url: "/settings", icon: Settings },
  ];

  const items = isAdmin ? adminItems : barberItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Scissors className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-sm font-bold text-sidebar-accent-foreground font-heading">LM Barberia</h2>
              <p className="text-xs text-sidebar-foreground">{t("salon_manager")}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("menu")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="mb-3 rounded-lg bg-sidebar-accent p-3">
            <p className="text-xs font-medium text-sidebar-accent-foreground truncate">
              {profile?.full_name || "User"}
            </p>
            <p className="text-xs text-sidebar-foreground capitalize">
              {isAdmin ? t("admin") : t("barber")}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={signOut}
          className="w-full text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
        >
          <Receipt className="h-4 w-4" />
          {!collapsed && <span className="ml-2">{t("sign_out")}</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
