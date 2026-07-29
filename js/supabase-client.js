// Supabase client configuration for browser-side auth.
// Use the canonical project URL for this Supabase project so browser auth requests can reach the correct host.
const SUPABASE_URL = 'https://uaftimjextzbowhjdhsr.supabase.co';
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
