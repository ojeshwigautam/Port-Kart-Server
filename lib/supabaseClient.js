import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log(supabaseAnonKey, supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const handleSupabaseError = (res, error) => {
    const status = error.status || 400;
    return res.status(status).json({
      error: error.message || "Authentication error",
    });
  };