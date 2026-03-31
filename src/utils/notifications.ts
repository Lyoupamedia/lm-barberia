import { supabase } from "@/integrations/supabase/client";

export async function createNotification(
  actorId: string,
  actorName: string,
  actionType: "created" | "updated" | "deleted",
  entityType: string,
  entityName: string
) {
  await supabase.from("notifications").insert({
    actor_id: actorId,
    actor_name: actorName,
    action_type: actionType,
    entity_type: entityType,
    entity_name: entityName,
  });
}
