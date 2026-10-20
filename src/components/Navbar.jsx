
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Heart,
  Bell,
  HeartHandshake,
  MessageCircle,
  Check,
  LoaderCircle,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const enlaces = [
  { to: "/", label: "Inicio", end: true },
  { to: "/descubrir", label: "Descubrir" },
  { to: "/matches", label: "Matches" },
  { to: "/perfil", label: "Mi perfil" },
  { to: "/favoritos", label: "Favoritos" },
];

function Navbar() {
  const navigate = useNavigate();

  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [cargandoNotificaciones, setCargandoNotificaciones] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);
  const [errorNotificaciones, setErrorNotificaciones] = useState("");
  const [abriendoNotificacion, setAbriendoNotificacion] = useState(null);

  const noLeidas = notificaciones.filter((n) => !n.read_at).length;

  useEffect(() => {
    let activo = true;
    let canal = null;
    let suscripcionAuth = null;
    let usuarioActualId = null;

    async function cargarNotificaciones(idUsuario) {
      if (!activo || !idUsuario) return;

      setCargandoNotificaciones(true);
      setErrorNotificaciones("");

      try {
        const { data, error } = await supabase
          .from("notifications")
          .select(
            "id, user_id, actor_id, type, related_user_id, related_message_id, read_at, created_at"
          )
          .eq("user_id", idUsuario)
          .order("created_at", { ascending: false })
          .limit(30);

        if (error) throw error;

        const lista = data ?? [];
        const idsActores = [
          ...new Set(lista.map((n) => n.actor_id).filter(Boolean)),
        ];

        let perfiles = [];

        if (idsActores.length > 0) {
          const { data: perfilesDB, error: errorPerfiles } = await supabase
            .from("profiles")
            .select("id, nombre, foto_url")
            .in("id", idsActores);

          if (errorPerfiles) throw errorPerfiles;

          perfiles = perfilesDB ?? [];
        }

        if (!activo) return;

        const perfilesPorId = new Map(
          perfiles.map((perfil) => [perfil.id, perfil])
        );

        setNotificaciones(
          lista.map((notificacion) => ({
            ...notificacion,
            actor: perfilesPorId.get(notificacion.actor_id) ?? null,
          }))
        );
      } catch (error) {
        console.error("Error cargando notificaciones:", error);

        if (activo) {
          setErrorNotificaciones(
            "No pudimos cargar las notificaciones. Inténtalo nuevamente."
          );
        }
      } finally {
        if (activo) setCargandoNotificaciones(false);
      }
    }

    async function iniciarNotificaciones() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!activo) return;

      if (error || !user) {
        usuarioActualId = null;
        setUsuarioId(null);
        setNotificaciones([]);

        if (canal) {
          supabase.removeChannel(canal);
          canal = null;
        }

        return;
      }

      // Evitar crear un canal duplicado para el mismo usuario.
      if (usuarioActualId === user.id && canal) return;

      if (canal) {
        supabase.removeChannel(canal);
        canal = null;
      }

      usuarioActualId = user.id;
      setUsuarioId(user.id);

      canal = supabase
        .channel(`notificaciones-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            if (activo) cargarNotificaciones(user.id);
          }
        )
        .subscribe();

      await cargarNotificaciones(user.id);
    }

    iniciarNotificaciones();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      // Dejar que termine el evento de autenticación antes de consultar.
      setTimeout(() => {
        if (activo) iniciarNotificaciones();
      }, 0);
    });

    suscripcionAuth = subscription;

    return () => {
      activo = false;
      suscripcionAuth?.unsubscribe();

      if (canal) {
        supabase.removeChannel(canal);
      }
    };
  }, []);

  async function abrirNotificacion(notificacion) {
    setMostrarNotificaciones(false);
    setAbriendoNotificacion(notificacion.id);

    try {
      // Marcar como leída.
      if (!notificacion.read_at && usuarioId) {
        const ahora = new Date().toISOString();

        const { error } = await supabase
          .from("notifications")
          .update({ read_at: ahora })
          .eq("id", notificacion.id)
          .eq("user_id", usuarioId);

        if (error) throw error;

        setNotificaciones((anteriores) =>
          anteriores.map((n) =>
            n.id === notificacion.id ? { ...n, read_at: ahora } : n
          )
        );
      }

      // Si es un mensaje, abrir la conversación correspondiente.
      if (notificacion.type === "message") {
        if (!notificacion.related_message_id) {
          setErrorNotificaciones(
            "No encontramos el mensaje asociado a esta notificación."
          );
          return;
        }

        const { data: mensaje, error } = await supabase
          .from("messages")
          .select("conversation_id")
          .eq("id", notificacion.related_message_id)
          .single();

        if (error) throw error;

        if (!mensaje?.conversation_id) {
          setErrorNotificaciones("No encontramos la conversación.");
          return;
        }

        navigate(`/chat/${mensaje.conversation_id}`);
        return;
      }

      // Si es un match, llevar a la sección de matches.
      if (notificacion.type === "match") {
        navigate("/matches");
      }
    } catch (error) {
      console.error("Error abriendo notificación:", error);
      setErrorNotificaciones(
        "No pudimos abrir la notificación. Inténtalo nuevamente."
      );
    } finally {
      setAbriendoNotificacion(null);
    }
  }

  async function marcarTodasLeidas() {
    if (!usuarioId || noLeidas === 0) return;

    const ahora = new Date().toISOString();

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: ahora })
      .eq("user_id", usuarioId)
      .is("read_at", null);

    if (error) {
      console.error("Error marcando notificaciones:", error);
      setErrorNotificaciones("No se pudieron marcar como leídas.");
      return;
    }

    setNotificaciones((anteriores) =>
      anteriores.map((n) => ({ ...n, read_at: n.read_at || ahora }))
    );

    setErrorNotificaciones("");
  }

  function obtenerTextoNotificacion(notificacion) {
    const nombre = notificacion.actor?.nombre || "Un bailarín";

    if (notificacion.type === "message") {
      return {
        titulo: `${nombre} te envió un mensaje`,
        descripcion: "Pulsa para abrir la conversación.",
      };
    }

    return {
      titulo: `${nombre} hizo match contigo`,
      descripcion: "¡Ya pueden conversar!",
    };
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8ddcd] bg-[#f7f0e5]/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-[#581f2b] font-serif text-lg font-bold text-[#d6a64f]">
            EP
          </span>

          <span className="font-serif text-lg font-bold text-[#581f2b] sm:text-xl">
            Marinera Match
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {enlaces.map((enlace) => (
            <NavLink
              key={enlace.to}
              to={enlace.to}
              end={enlace.end}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[#581f2b]"
                    : "text-stone-600 hover:text-[#581f2b]"
                }`
              }
            >
              {enlace.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setMostrarNotificaciones((anterior) => !anterior);
                setErrorNotificaciones("");
              }}
              aria-label={`Notificaciones${
                noLeidas ? `, ${noLeidas} sin leer` : ""
              }`}
              aria-expanded={mostrarNotificaciones}
              className="relative grid size-11 place-items-center rounded-full border border-[#e8ddcd] bg-[#fffaf2] text-[#581f2b] transition hover:bg-[#f0e4d3]"
            >
              <Bell size={21} />

              {noLeidas > 0 && (
                <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {noLeidas > 99 ? "99+" : noLeidas}
                </span>
              )}
            </button>

            {mostrarNotificaciones && (
              <div className="absolute right-0 top-full z-60 mt-3 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#e8ddcd] bg-[#fffaf2] shadow-xl">
                <div className="flex items-center justify-between gap-3 border-b border-[#e8ddcd] px-4 py-3">
                  <div>
                    <h2 className="font-serif font-bold text-[#581f2b]">
                      Notificaciones
                    </h2>
                    <p className="text-xs text-stone-500">
                      {noLeidas > 0
                        ? `${noLeidas} sin leer`
                        : "Estás al día"}
                    </p>
                  </div>

                  {noLeidas > 0 && (
                    <button
                      type="button"
                      onClick={marcarTodasLeidas}
                      className="flex items-center gap-1 text-xs font-semibold text-[#581f2b] hover:underline"
                    >
                      <Check size={15} />
                      Marcar leídas
                    </button>
                  )}
                </div>

                {errorNotificaciones && (
                  <p
                    role="alert"
                    className="border-b border-[#eee4d6] bg-red-50 p-3 text-sm text-red-700"
                  >
                    {errorNotificaciones}
                  </p>
                )}

                {cargandoNotificaciones ? (
                  <div className="flex items-center justify-center gap-2 p-8 text-sm text-stone-500">
                    <LoaderCircle size={19} className="animate-spin" />
                    Cargando...
                  </div>
                ) : notificaciones.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <Bell
                      size={30}
                      className="mx-auto text-[#b18432]"
                    />
                    <p className="mt-3 font-semibold text-[#581f2b]">
                      Aún no tienes notificaciones
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      Cuando hagas match o recibas un mensaje, te avisaremos
                      aquí.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-380px overflow-y-auto">
                    {notificaciones.map((n) => {
                      const texto = obtenerTextoNotificacion(n);
                      const esMensaje = n.type === "message";
                      const abriendo = abriendoNotificacion === n.id;

                      return (
                        <button
                          key={n.id}
                          type="button"
                          disabled={abriendo}
                          onClick={() => abrirNotificacion(n)}
                          className={`flex w-full items-start gap-3 border-b border-[#eee4d6] px-4 py-4 text-left transition hover:bg-[#f7f0e5] disabled:opacity-60 ${
                            !n.read_at ? "bg-[#f6ecdf]" : ""
                          }`}
                        >
                          {n.actor?.foto_url ? (
                            <img
                              src={n.actor.foto_url}
                              alt=""
                              className="size-11 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#581f2b] text-[#f7f0e5]">
                              {esMensaje ? (
                                <MessageCircle size={21} />
                              ) : (
                                <HeartHandshake size={21} />
                              )}
                            </span>
                          )}

                          <span className="min-w-0 flex-1">
                            <span className="block text-sm leading-5 text-stone-700">
                              <strong className="text-[#581f2b]">
                                {texto.titulo}
                              </strong>
                            </span>

                            <span className="mt-1 block text-sm text-stone-600">
                              {texto.descripcion}
                            </span>

                            <span className="mt-1 block text-xs text-stone-500">
                              {new Date(n.created_at).toLocaleString("es-PE", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </span>

                          {abriendo ? (
                            <LoaderCircle
                              size={17}
                              className="mt-2 shrink-0 animate-spin text-[#581f2b]"
                            />
                          ) : (
                            !n.read_at && (
                              <span
                                aria-label="Sin leer"
                                className="mt-2 size-2 shrink-0 rounded-full bg-[#b18432]"
                              />
                            )
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMostrarNotificaciones(false);
                    navigate("/matches");
                  }}
                  className="w-full px-4 py-3 text-sm font-semibold text-[#581f2b] transition hover:bg-[#f0e4d3]"
                >
                  Ver mis matches
                </button>
              </div>
            )}
          </div>

          <Link
            to="/descubrir"
            className="flex items-center gap-2 rounded-full bg-[#581f2b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#71303d]"
          >
            <Heart size={16} />
            <span className="hidden sm:inline">Encontrar pareja</span>
          </Link>
        </div>
      </div>

      <nav className="flex justify-around overflow-x-auto border-t border-[#e8ddcd] px-2 py-3 md:hidden">
        {enlaces.map((enlace) => (
          <NavLink
            key={enlace.to}
            to={enlace.to}
            end={enlace.end}
            className={({ isActive }) =>
              `whitespace-nowrap px-2 text-xs font-medium ${
                isActive ? "text-[#581f2b]" : "text-stone-500"
              }`
            }
          >
            {enlace.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;
