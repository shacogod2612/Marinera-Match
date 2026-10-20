
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

function NuevaContrasena() {
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [sesionRecuperacion, setSesionRecuperacion] = useState(false);
  const [comprobando, setComprobando] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);
  const [guardada, setGuardada] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((evento, session) => {
      if (evento === "PASSWORD_RECOVERY" && session) {
        setSesionRecuperacion(true);
        setComprobando(false);
      }
    });

    // Si Supabase ya procesó el enlace, comprobamos la sesión existente.
    supabase.auth.getSession().then(({ data: sessionData, error: sessionError }) => {
      if (sessionError) {
        setError(true);
        setMensaje("No se pudo validar el enlace de recuperación.");
      } else if (sessionData.session && window.location.hash.includes("type=recovery")) {
        setSesionRecuperacion(true);
      }

      setComprobando(false);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  async function guardarNuevaContrasena(e) {
    e.preventDefault();
    setMensaje("");
    setError(false);

    if (password.length < 6) {
      setError(true);
      setMensaje("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmacion) {
      setError(true);
      setMensaje("Las contraseñas no coinciden.");
      return;
    }

    if (!sesionRecuperacion) {
      setError(true);
      setMensaje("El enlace no es válido o ha expirado. Solicita uno nuevo.");
      return;
    }

    setCargando(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setGuardada(true);
      setMensaje("¡Tu contraseña se actualizó correctamente!");

      await supabase.auth.signOut();
    } catch (err) {
      setError(true);
      setMensaje(
        err.message || "No se pudo actualizar la contraseña. Solicita otro enlace."
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
            Nueva contraseña
          </h1>

          <p className="mt-2 text-sm leading-6 text-stone-600">
            Crea una contraseña nueva para volver a entrar a Entre Pañuelos.
          </p>
        </div>

        {comprobando ? (
          <p className="text-center text-sm text-stone-600">
            Verificando el enlace...
          </p>
        ) : guardada ? (
          <div className="space-y-4">
            {mensaje && (
              <p role="status" className="rounded-xl bg-[#f1e7d8] p-3 text-sm text-[#581f2b]">
                {mensaje}
              </p>
            )}
            <button
              type="button"
              onClick={() => navigate("/acceso", { replace: true })}
              className="w-full rounded-full bg-[#581f2b] px-5 py-3.5 font-semibold text-white hover:bg-[#71303d]"
            >
              Ir a iniciar sesión
            </button>
          </div>
        ) : !sesionRecuperacion ? (
          <div className="space-y-4">
            <p role="status" className="rounded-xl bg-[#f1e7d8] p-3 text-sm text-[#581f2b]">
              {mensaje || "El enlace no es válido o ha expirado. Solicita uno nuevo."}
            </p>
            <Link
              to="/recuperar-contrasena"
              className="block text-center font-semibold text-[#581f2b] hover:underline"
            >
              Solicitar otro enlace
            </Link>
          </div>
        ) : (
          <form onSubmit={guardarNuevaContrasena} className="space-y-4">
            <label className="block text-sm font-medium text-stone-700">
              Nueva contraseña
              <span className="mt-2 flex items-center gap-3 rounded-xl border border-[#e4d3bd] bg-white px-3">
                <Lock size={18} className="shrink-0 text-stone-400" />
                <input
                  type={mostrarPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                  className="min-w-0 flex-1 bg-transparent py-3 outline-none"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword((v) => !v)}
                  aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="rounded-lg p-1 text-stone-500 hover:bg-[#f1e7d8]"
                >
                  {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </span>
            </label>

            <label className="block text-sm font-medium text-stone-700">
              Confirmar contraseña
              <span className="mt-2 flex items-center gap-3 rounded-xl border border-[#e4d3bd] bg-white px-3">
                <Lock size={18} className="shrink-0 text-stone-400" />
                <input
                  type={mostrarConfirmacion ? "text" : "password"}
                  value={confirmacion}
                  onChange={(e) => setConfirmacion(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                  className="min-w-0 flex-1 bg-transparent py-3 outline-none"
                  placeholder="Repite la contraseña"
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmacion((v) => !v)}
                  aria-label={mostrarConfirmacion ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="rounded-lg p-1 text-stone-500 hover:bg-[#f1e7d8]"
                >
                  {mostrarConfirmacion ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </span>
            </label>

            {mensaje && (
              <p
                role="status"
                aria-live="polite"
                className={`rounded-xl p-3 text-sm ${
                  error ? "bg-red-100 text-red-800" : "bg-[#f1e7d8] text-[#581f2b]"
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
              {cargando ? "Guardando..." : "Guardar nueva contraseña"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

export default NuevaContrasena;
