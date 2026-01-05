import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://ksdlqjyayvybbiiyfrxf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzZGxxanlheXZ5YmJpaXlmcnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMDc1MDksImV4cCI6MjA2Nzc4MzUwOX0.dcAZFPkSbmz1UN7nuFGyTHGSZ5E51KEyH3Ffk7Nm-lQ";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
