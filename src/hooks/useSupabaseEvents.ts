// src/hooks/useSupabaseEvents.ts
import React from "react";
import { supabase } from "../services/supabaseClient";

export type EventRow = {
  id: string;
  ts: string;
  node_id: string;
  type: string;
  details: string;
  status: string;
};

export function useSupabaseEvents(limit = 20) {
  const [events, setEvents] = React.useState<EventRow[]>([]);

  React.useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("ts", { ascending: false })
        .limit(limit);
      if (error) console.error("Supabase events error:", error);
      else setEvents((data ?? []) as EventRow[]);
    }
    fetchEvents();
  }, [limit]);

  return { events };
}
