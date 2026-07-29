// Supabase client configuration for browser-side auth.
// The project URL is derived from the provided Supabase project reference.
const SUPABASE_URL = 'https://XOpJ-VTpIMtaRxQW3RN07g_HbUDMeUN.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_XOpJ-VTpIMtaRxQW3RN07g_HbUDMeUN';

const hasSupabaseConfig = SUPABASE_URL !== '' && SUPABASE_PUBLISHABLE_KEY !== '';

if (typeof window !== 'undefined') {
  window.SUPABASE_URL = SUPABASE_URL;
  window.SUPABASE_PUBLISHABLE_KEY = SUPABASE_PUBLISHABLE_KEY;
  window.supabaseAuthConfigMissing = !hasSupabaseConfig;

  if (hasSupabaseConfig && typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  } else {
    window.supabase = null;
  }
}
