const SUPABASE_URL = "https://pryrgwmpmlfbthdksbzr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_WwiTVh0wiOLWLZevmgZN3w_CJgcshhm";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
