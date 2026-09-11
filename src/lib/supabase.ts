import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mzfufwmfpgpjinfzksij.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16ZnVmd21mcGdwamluZnprc2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMTMwNzAsImV4cCI6MjEwNDY4OTA3MH0.Ap4ZZC_mYj3HdE28vqVc6mJGlaQZk-gN7fhZF7gqNds';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

