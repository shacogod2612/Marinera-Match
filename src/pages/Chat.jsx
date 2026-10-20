
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  MessageCircle,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

function Chat() {
  const { conversationId } = useParams();

  const [usuario, setUsuario] = useState(null);
  const [conversacion, setConversacion] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const mensajesRef = useRef(null);

  // Cargar conversación, usuario, historial y escuchar mensajes nuevos.
  useEffect(() => {
    let activo = true;
    let canal = null;

    async function cargarChat() {
      setCargando(true);
      setError("");

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (!activo) return;

      if (authError || !authData.user) {
        setError("Inicia sesión para acceder al chat.");
        setCargando(false);
        return;
      }

      const usuarioActual = authData.user;
      setUsuario(usuarioActual);

      // Obtener la conversación. RLS debe permitirla solo a sus participantes.
      const { data: chat, error: chatError } = await supabase
        .from("conversations")
        .select("id, user1_id, user2_id")
        .eq("id", conversationId)
        .maybeSingle();

      if (!activo) return;

      if (chatError || !chat) {
        setError(
          "No encontramos esta conversación o no tienes permiso para acceder."
        );
        setCargando(false);
        return;
      }

      setConversacion(chat);

      const otroUsuarioId =
        chat.user1_id === usuarioActual.id
          ? chat.user2_id
          : chat.user1_id;

      // Obtener nombre y foto de la otra persona.
      const { data: perfil } = await supabase
        .from("profiles")
        .select("id, nombre, foto_url")
        .eq("id", otroUsuarioId)
        .maybeSingle();

      if (!activo) return;

      setConversacion({
        ...chat,
        otroUsuario: perfil,
      });

      // Escuchar mensajes nuevos de esta conversación.
      canal = supabase
        .channel(`chat-${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            if (!activo) return;

            const nuevoMensaje = payload.new;

            setMensajes((anteriores) => {
              // Evitar duplicados si el mensaje también llega por el INSERT.
              if (anteriores.some((m) => m.id === nuevoMensaje.id)) {
                return anteriores;
              }

              return [...anteriores, nuevoMensaje].sort(
                (a, b) =>
                  new Date(a.created_at) - new Date(b.created_at)
              );
            });
          }
        )
        .subscribe();

      // Cargar historial guardado.
      const { data: historial, error: historialError } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_id, content, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (!activo) return;

      if (historialError) {
        setError("No pudimos cargar los mensajes. Inténtalo de nuevo.");
        setCargando(false);
        return;
      }

      setMensajes((actuales) => {
        // Combinar el historial con cualquier mensaje recibido durante la carga.
        const combinados = new Map();

        historial.forEach((m) => combinados.set(m.id, m));
        actuales.forEach((m) => combinados.set(m.id, m));

        return [...combinados.values()].sort(
          (a, b) =>
            new Date(a.created_at) - new Date(b.created_at)
        );
      });

      setCargando(false);
    }

    cargarChat();

    return () => {
      activo = false;

      if (canal) {
        supabase.removeChannel(canal);
      }
    };
  }, [conversationId]);

  // Desplazar al mensaje más reciente.
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop =
        mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  async function enviarMensaje(e) {
    e.preventDefault();

    const contenido = mensaje.trim();

    if (!contenido || !usuario || !conversacion || enviando) {
      return;
    }

    setEnviando(true);
    setError("");

    const { data, error: envioError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: usuario.id,
        content: contenido,
      })
      .select("id, conversation_id, sender_id, content, created_at")
      .single();

    if (envioError) {
      setError("No se pudo enviar el mensaje. Inténtalo nuevamente.");
    } else {
      setMensaje("");

      // Añadirlo inmediatamente sin esperar al evento Realtime.
      setMensajes((anteriores) => {
        if (anteriores.some((m) => m.id === data.id)) {
          return anteriores;
        }

        return [...anteriores, data].sort(
          (a, b) =>
            new Date(a.created_at) - new Date(b.created_at)
        );
      });
    }

    setEnviando(false);
  }

  const nombreOtro =
    conversacion?.otroUsuario?.nombre || "Tu match";

  if (cargando) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-stone-600">
          <LoaderCircle className="animate-spin" size={24} />
          <span>Cargando conversación...</span>
        </div>
      </main>
    );
  }

  if (error && !conversacion) {
    return (
      <main className="mx-auto max-w-xl px-5 py-20 text-center">
        <AlertCircle className="mx-auto mb-4 text-[#8b4655]" size={36} />
        <h1 className="font-serif text-2xl font-bold text-[#581f2b]">
          No se puede abrir el chat
        </h1>
        <p className="mt-3 text-stone-600">{error}</p>
        <Link
          to="/matches"
          className="mt-6 inline-flex rounded-xl bg-[#581f2b] px-5 py-3 text-white hover:bg-[#71303d]"
        >
          Volver a mis matches
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-[75vh] bg-[#faf7f2] px-4 py-6 sm:px-6">
      <section className="mx-auto flex h-[75vh] max-h-850px min-h-500px max-w-4xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        {/* Encabezado */}
        <header className="flex items-center gap-3 border-b border-stone-200 px-4 py-4 sm:px-6">
          <Link
            to="/matches"
            aria-label="Volver a mis matches"
            className="rounded-full p-2 text-stone-600 transition hover:bg-stone-100"
          >
            <ArrowLeft size={21} />
          </Link>

          {conversacion?.otroUsuario?.foto_url ? (
            <img
              src={conversacion.otroUsuario.foto_url}
              alt=""
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f3e5e7] text-[#581f2b]">
              <MessageCircle size={22} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="truncate font-serif text-lg font-bold text-[#581f2b]">
              {nombreOtro}
            </h1>
            <p className="text-xs text-stone-500">
              Coordinen su próximo baile
            </p>
          </div>
        </header>

        {/* Historial */}
        <div
          ref={mensajesRef}
          className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[#fcfaf7] p-4 sm:p-6"
        >
          {mensajes.length === 0 ? (
            <div className="m-auto max-w-sm text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f3e5e7] text-[#581f2b]">
                <MessageCircle size={30} />
              </div>

              <h2 className="font-serif text-xl font-bold text-[#581f2b]">
                ¡Empiecen a conversar!
              </h2>

              <p className="mt-2 text-sm leading-6 text-stone-500">
                Ya hicieron match. Escriban para coordinar horarios,
                ensayos y sus próximos pasos en la marinera.
              </p>
            </div>
          ) : (
            mensajes.map((item) => {
              const esMio = item.sender_id === usuario?.id;

              return (
                <div
                  key={item.id}
                  className={`flex ${esMio ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                      esMio
                        ? "rounded-br-sm bg-[#581f2b] text-white"
                        : "rounded-bl-sm border border-stone-200 bg-white text-stone-800"
                    }`}
                  >
                    <p className="whitespace-pre-wrap wrap-break-words text-sm leading-6">
                      {item.content}
                    </p>

                    <p
                      className={`mt-1 text-right text-[10px] ${
                        esMio ? "text-white/70" : "text-stone-400"
                      }`}
                    >
                      {new Date(item.created_at).toLocaleTimeString(
                        "es-PE",
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Errores de envío */}
        {error && (
          <p
            role="alert"
            className="border-t border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {/* Escribir y enviar */}
        <form
          onSubmit={enviarMensaje}
          className="flex items-end gap-3 border-t border-stone-200 bg-white p-4 sm:px-6"
        >
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Escribe un mensaje..."
            aria-label="Escribe un mensaje"
            rows={1}
            maxLength={3000}
            className="max-h-32 min-h-12 flex-1 resize-y rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#8b4655] focus:ring-2 focus:ring-[#8b4655]/10"
          />

          <button
            type="submit"
            disabled={!mensaje.trim() || enviando}
            aria-label="Enviar mensaje"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#581f2b] text-white transition hover:bg-[#71303d] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {enviando ? (
              <LoaderCircle className="animate-spin" size={19} />
            ) : (
              <Send size={19} />
            )}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Chat;
