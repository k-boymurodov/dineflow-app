import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve from Vite environment or localStorage override
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const localUrl = localStorage.getItem('dineflow_supabase_url');
const localKey = localStorage.getItem('dineflow_supabase_key');

const supabaseUrl = localUrl || envUrl;
const supabaseAnonKey = localKey || envAnonKey;

export const isSupabaseConfigured = (): boolean => {
  return !!(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20 &&
    !supabaseUrl.includes('placeholder')
  );
};

export const getSupabaseConfig = () => {
  return {
    url: supabaseUrl || '',
    key: supabaseAnonKey || '',
    isConfigured: isSupabaseConfigured(),
    isEnv: !!(envUrl && envAnonKey),
  };
};

export const saveCustomSupabaseConfig = (url: string, key: string) => {
  if (url && key) {
    localStorage.setItem('dineflow_supabase_url', url);
    localStorage.setItem('dineflow_supabase_key', key);
  } else {
    localStorage.removeItem('dineflow_supabase_url');
    localStorage.removeItem('dineflow_supabase_key');
  }
  window.location.reload();
};

let client: SupabaseClient | null = null;

if (isSupabaseConfigured()) {
  try {
    client = createClient(supabaseUrl!, supabaseAnonKey!);
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
  }
}

export const supabase = client;
