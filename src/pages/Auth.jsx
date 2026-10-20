
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Mail,
  Lock,
  UserRound,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  supabase,
  configurarRecordarme,
  obtenerPreferenciaRecordarme,
} from "../lib/supabaseClient";

function Auth() {
  const [modo, setModo] = useState("registro");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [recordarme, setRecordarme] = useState(
    obtenerPreferenciaRecordarme
  );
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  async function manejarAutenticacion(e) {
    e.preventDefault();
    setMensaje("");

    if (modo === "registro" && !nombre.trim()) {
      setMensaje("Escribe tu nombre para continuar.");
      return;
    }

    if (password.length < 6) {
      setMensaje("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setCargando(true);

    try {
      if (modo === "registro") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nombre: nombre.trim() },
          },
        });

        if (error) throw error;

        if (data.session) {
          navigate("/perfil");
        } else {
          setMensaje(
            "Cuenta creada. Revisa tu correo para confirmar el registro antes de iniciar sesión."
          );
          setModo("login");
        }
      } else {
          configurarRecordarme(recordarme);

          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          navigate("/perfil");
        }
    } catch (error) {
      setMensaje(error.message || "No se pudo completar la operación.");
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
            {modo === "registro" ? "Únete a la comunidad" : "Qué bueno verte"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-stone-600">
            {modo === "registro"
              ? "Crea tu cuenta y encuentra tu próxima pareja de marinera."
              : "Inicia sesión para continuar en Entre Pañuelos."}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-xl bg-[#f1e7d8] p-1">
          <button
            type="button"
            onClick={() => {
              setModo("registro");
              setMensaje("");
              setMostrarPassword(false);
            }}
            className={`rounded-lg py-2.5 text-sm font-semibold ${
              modo === "registro"
                ? "bg-white text-[#581f2b] shadow-sm"
                : "text-stone-600"
            }`}
          >
            Registrarme
          </button>

          <button
            type="button"
            onClick={() => {
              setModo("login");
              setMensaje("");
              setMostrarPassword(false);
            }}
            className={`rounded-lg py-2.5 text-sm font-semibold ${
              modo === "login"
                ? "bg-white text-[#581f2b] shadow-sm"
                : "text-stone-600"
            }`}
          >
            Iniciar sesión
          </button>
        </div>

        <form onSubmit={manejarAutenticacion} className="space-y-4">
          {modo === "registro" && (
            <label className="block text-sm font-medium text-stone-700">
              Nombre
              <span className="mt-2 flex items-center gap-3 rounded-xl border border-[#e4d3bd] bg-white px-3">
                <UserRound size={18} className="text-stone-400" />
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  autoComplete="name"
                  required
                  className="min-w-0 flex-1 bg-transparent py-3 outline-none"
                  placeholder="Tu nombre"
                />
              </span>
            </label>
          )}

          <label className="block text-sm font-medium text-stone-700">
            Correo electrónico
            <span className="mt-2 flex items-center gap-3 rounded-xl border border-[#e4d3bd] bg-white px-3">
              <Mail size={18} className="text-stone-400" />
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

          <label className="block text-sm font-medium text-stone-700">
            Contraseña
            <span className="mt-2 flex items-center gap-3 rounded-xl border border-[#e4d3bd] bg-white px-3">
              <Lock size={18} className="shrink-0 text-stone-400" />

              <input
                type={mostrarPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  modo === "registro" ? "new-password" : "current-password"
                }
                minLength={6}
                required
                className="min-w-0 flex-1 bg-transparent py-3 outline-none"
                placeholder="Mínimo 6 caracteres"
              />

              <button
                type="button"
                onClick={() => setMostrarPassword((anterior) => !anterior)}
                aria-label={
                  mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                aria-pressed={mostrarPassword}
                className="shrink-0 rounded-lg p-1 text-stone-500 transition hover:bg-[#f1e7d8] hover:text-[#581f2b]"
              >
                {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </span>
          </label>

          {modo === "login" && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-stone-600">
                <input
                  type="checkbox"
                  checked={recordarme}
                  onChange={(e) => setRecordarme(e.target.checked)}
                  className="size-4 accent-[#581f2b]"
                />
                Recordarme
              </label>

              <button
                type="button"
                onClick={() =>
                  navigate("/recuperar-contrasena", {
                    state: { email },
                  })
                }
                className="font-medium text-[#581f2b] hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {mensaje && (
            <p
              role="status"
              aria-live="polite"
              className="rounded-xl bg-[#f1e7d8] p-3 text-sm text-[#581f2b]"
            >
              {mensaje}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-full bg-[#581f2b] px-5 py-3.5 font-semibold text-white transition hover:bg-[#71303d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cargando
              ? "Procesando..."
              : modo === "registro"
                ? "Crear cuenta"
                : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-stone-500">
          Al continuar, podrás crear tu perfil de bailarín y descubrir
          personas con tus mismos objetivos.
        </p>

        <p className="mt-4 text-center text-sm">
          <Link to="/" className="font-semibold text-[#581f2b] hover:underline">
            Volver al inicio
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Auth;
