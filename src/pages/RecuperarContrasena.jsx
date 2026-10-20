
import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Mail, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

function RecuperarContrasena() {
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);

  async function enviarSolicitud(e) {
    e.preventDefault();
    setMensaje("");
    setError(false);
    setCargando(true);

    try {
      const urlCambio = new URL(
        `${import.meta.env.BASE_URL}nueva-contrasena`,
        window.location.origin
      ).toString();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: urlCambio,
      });

      if (error) throw error;

      setMensaje(
        "Si existe una cuenta con ese correo, recibirás un enlace para cambiar tu contraseña. Revisa también la carpeta de spam."
      );
      setEmail("");
    } catch (err) {
      setError(true);
      setMensaje(
        err.message || "No se pudo enviar la solicitud. Inténtalo nuevamente."
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="min-h-[75vh] bg-[#f7f0e5] px-4 py-12 sm:py-16">
      <section className="mx-auto max-w-md rounded-3xl border border-[#e8ddcd] bg-[#fffaf2] p-6 shadow-lg sm:p-9">
        <div className="mb-6 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#581f2b] text-[#d6a64f]">
            <Heart size={28} />
          </div>

          <h1 className="mt-5 font-serif text-3xl font-bold text-[#581f2b]">
            Recuperar contraseña
          </h1>

          <p className="mt-2 text-sm leading-6 text-stone-600">
            Escribe el correo asociado a tu cuenta y te enviaremos las
            instrucciones para crear una nueva contraseña.
          </p>
        </div>

        <form onSubmit={enviarSolicitud} className="space-y-4">
          <label className="block text-sm font-medium text-stone-700">
            Correo electrónico
            <span className="mt-2 flex items-center gap-3 rounded-xl border border-[#e4d3bd] bg-white px-3">
              <Mail size={18} className="shrink-0 text-stone-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="min-w-0 flex-1 bg-transparent py-3 outline-none"
                placeholder="tu@correo.com"
              />
            </span>
          </label>

          {mensaje && (
            <p
              role="status"
              aria-live="polite"
              className={`rounded-xl p-3 text-sm ${
                error
                  ? "bg-red-100 text-red-800"
                  : "bg-[#f1e7d8] text-[#581f2b]"
              }`}
            >
              {mensaje}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-full bg-[#581f2b] px-5 py-3.5 font-semibold text-white transition hover:bg-[#71303d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cargando ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link
            to="/acceso"
            className="inline-flex items-center gap-2 font-semibold text-[#581f2b] hover:underline"
          >
            <ArrowLeft size={16} />
            Volver al inicio de sesión
          </Link>
        </p>
      </section>
    </main>
  );
}

export default RecuperarContrasena;
