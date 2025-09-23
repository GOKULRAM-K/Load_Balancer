// src/hooks/useSupabaseNodes.ts
import React from "react";
import { supabase } from "../services/supabaseClient";

export type NodeRow = {
  id: string;
  name: string;
  feeder: string;
  district: string;
  lat: number;
  lng: number;
  telemetry: { ts: number; vuf: number; neutral: number };
  mode: string;
};

export function useSupabaseNodes() {
  const [nodes, setNodes] = React.useState<NodeRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchNodes() {
      setLoading(true);
      const { data, error } = await supabase.from("nodes").select("*");
      if (error) console.error("Supabase fetch error:", error);
      else setNodes((data ?? []) as NodeRow[]);
      setLoading(false);
    }
    fetchNodes();
  }, []);

  return { nodes, loading };
}
