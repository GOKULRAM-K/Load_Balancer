// src/services/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  // Warning is fine for local dev — keys should be in .env
  console.warn(
    "Supabase keys missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env (Vite) file"
  );
}

export const supabase = createClient(url ?? "", key ?? "");
