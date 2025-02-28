import { createClient } from "@supabase/supabase-js";
import { type Database } from "@/lib/supabase/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
