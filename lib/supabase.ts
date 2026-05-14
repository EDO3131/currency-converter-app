import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const supabaseUrl: string = Constants.expoConfig?.extra?.supabaseUrl ?? "";
const supabaseAnonKey: string =
  Constants.expoConfig?.extra?.supabaseAnonKey ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
