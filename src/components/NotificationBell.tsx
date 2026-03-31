import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  actor_id: string;
  actor_name: string;
  action_type: string;
  entity_type: string;
  entity_name: string;
  created_at: string;
  read_by: string[];
}

export function NotificationBell() {
  const { user } = useAuth();
  const { t } = useSettings();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);
    setNotifications((data as Notification[]) || []);
  };

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev].slice(0, 30));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const unreadCount = notifications.filter(
    (n) => user && !((n.read_by as string[]) || []).includes(user.id) && n.actor_id !== user.id
  ).length;

  const markAllRead = async () => {
    if (!user) return;
    const unread = notifications.filter(
      (n) => !((n.read_by as string[]) || []).includes(user.id)
    );
    for (const n of unread) {
      const updatedReadBy = [...((n.read_by as string[]) || []), user.id];
      await supabase.from("notifications").update({ read_by: updatedReadBy }).eq("id", n.id);
    }
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read_by: ((n.read_by as string[]) || []).includes(user.id)
          ? n.read_by
          : [...((n.read_by as string[]) || []), user.id],
      }))
    );
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) markAllRead();
  };

  const actionLabel = (action: string) => {
    if (action === "created") return t("notif_created");
    if (action === "updated") return t("notif_updated");
    if (action === "deleted") return t("notif_deleted");
    return action;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("just_now");
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="text-sm font-semibold font-heading">{t("notifications")}</h4>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">{unreadCount} {t("new")}</Badge>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">{t("no_notifications")}</p>
          ) : (
            notifications.map((n) => {
              const isOwn = n.actor_id === user?.id;
              const isRead = ((n.read_by as string[]) || []).includes(user?.id || "");
              return (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b last:border-0 ${!isRead && !isOwn ? "bg-accent/30" : ""}`}
                >
                  <p className="text-sm">
                    <span className="font-medium">{isOwn ? t("you") : n.actor_name}</span>{" "}
                    {actionLabel(n.action_type)}{" "}
                    <span className="font-medium">{n.entity_name}</span>{" "}
                    <span className="text-muted-foreground">({n.entity_type})</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(n.created_at)}</p>
                </div>
              );
            })
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
