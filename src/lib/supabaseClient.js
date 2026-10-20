
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const CLAVE_RECORDARME = "entre-panuelo-recordarme";

export function obtenerPreferenciaRecordarme() {
  return localStorage.getItem(CLAVE_RECORDARME) !== "false";
}

function obtenerAlmacenamiento() {
  return obtenerPreferenciaRecordarme()
    ? localStorage
    : sessionStorage;
}

const almacenamientoAuth = {
  getItem(clave) {
    return obtenerAlmacenamiento().getItem(clave);
  },

  setItem(clave, valor) {
    const activo = obtenerAlmacenamiento();
    const alternativo =
      activo === localStorage ? sessionStorage : localStorage;

    activo.setItem(clave, valor);
    alternativo.removeItem(clave);
  },

  removeItem(clave) {
    localStorage.removeItem(clave);
    sessionStorage.removeItem(clave);
  },
};

export function configurarRecordarme(recordar) {
  localStorage.setItem(
    CLAVE_RECORDARME,
    recordar ? "true" : "false"
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      storage: almacenamientoAuth,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
