import { supabaseReady } from "../lib/supabase";

export const NotConfigured = () =>
  !supabaseReady ? (
    <div className="msg err">
      ಡೇಟಾಬೇಸ್ ಇನ್ನೂ ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ. .env ಫೈಲ್‌ನಲ್ಲಿ VITE_SUPABASE_URL ಮತ್ತು VITE_SUPABASE_ANON_KEY ಸೇರಿಸಿ.
    </div>
  ) : null;

export const cleanPhone = (v) => v.replace(/\D/g, "");
export const validPhone = (v) => /^[6-9]\d{9}$/.test(cleanPhone(v));
