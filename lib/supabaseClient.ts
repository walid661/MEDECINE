import { createClient } from '@supabase/supabase-js';

// In a Vite environment, these would be accessible via import.meta.env
// Ensure these variables are defined in your .env file or environment configuration
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);