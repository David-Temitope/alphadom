import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://ksdlqjyayvybbiiyfrxf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzZGxxanlheXZ5YmJpaXlmcnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MDExMzIsImV4cCI6MjA4Mjk2MTEzMn0.-zQKKG1CzGP0cAy1SMymAyjadBWl-9K2ghzg5kBCQ2g";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
