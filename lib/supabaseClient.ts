import { createClient } from '@supabase/supabase-js';

// Helper to safely access environment variables
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch {}
  
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      // @ts-ignore
      return process.env[key];
    }
  } catch {}

  return '';
};

// Fallback credentials provided by the user
const DEFAULT_URL = 'https://qppuiegloocarwemqrqa.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwcHVpZWdsb29jYXJ3ZW1xcnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NzM2MTMsImV4cCI6MjA4MDU0OTYxM30.9w3Axbgbc804l87oX0iAI21kF0nLqwidprqDbeHvsDU';

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || DEFAULT_URL;
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || DEFAULT_KEY;

if (!supabaseUrl) {
    console.error('Supabase URL is missing! App will likely crash.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);