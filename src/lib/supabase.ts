import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. App will fall back to localStorage Mock if needed, but Supabase functionality will fail.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

/**
 * SQL for Supabase Table:
 * 
 * CREATE TABLE fieldwork_logs (
 *   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   created_at timestamp with time zone DEFAULT now(),
 *   date date NOT NULL,
 *   student_name text NOT NULL,
 *   student_id text NOT NULL,
 *   out_time text NOT NULL,
 *   in_time text NOT NULL,
 *   actual_work_time text NOT NULL,
 *   student_submitted boolean DEFAULT true,
 *   teacher_approved boolean DEFAULT false
 * );
 * 
 * -- Enable RLS
 * ALTER TABLE fieldwork_logs ENABLE ROW LEVEL SECURITY;
 * 
 * -- Open Policy (Adjust for production)
 * CREATE POLICY "Public Access" ON fieldwork_logs FOR ALL USING (true) WITH CHECK (true);
 */
