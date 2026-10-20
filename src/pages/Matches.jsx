
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HeartHandshake,
  LoaderCircle,
  Heart,
  Users,
  ArrowRight,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import ProfileCard from "../components/ProfileCard";

function Matches() {
  const [matches, setMatches] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [autenticado, setAutenticado] = useState(true);

  useEffect(() => {
    let cancelado = false;

    async function cargarMatches() {
      setCargando(true);
      setErrorCarga("");

      try {
        // 1. Identificar al usuario actual.
        const {
          data: { user },
          error: errorUsuario,
        } = await supabase.auth.getUser();

        if (errorUsuario) throw errorUsuario;

        if (!user) {
          if (!cancelado) {
            setAutenticado(false);
            setMatches([]);
          }
          return;
        }

        if (!cancelado) setAutenticado(true);

        // 2. Obtener los likes visibles para este usuario.
        // RLS limita las filas a aquellas en las que participa.
        const { data: likesDB, error: errorLikes } = await supabase
          .from("likes")
          .select("user_id, liked_user_id");

        if (errorLikes) throw errorLikes;

        // 3. Separar los likes enviados y los recibidos.
        const likesEnviados = new Set(
          (likesDB ?? [])
            .filter((like) => like.user_id === user.id)
            .map((like) => like.liked_user_id)
        );

        const likesRecibidos = new Set(
          (likesDB ?? [])
            .filter((like) => like.liked_user_id === user.id)
            .map((like) => like.user_id)
        );

        // Solo hay match si las dos personas se dieron like.
        const idsMatches = [...likesEnviados].filter((id) =>
          likesRecibidos.has(id)
        );

        if (idsMatches.length === 0) {
          if (!cancelado) setMatches([]);
          return;
        }

        // 4. Cargar los perfiles que coinciden mutuamente.
        const { data: perfilesDB, error: errorPerfiles } = await supabase
          .from("profiles")
          .select(
            "id, nombre, edad, sexo, ciudad, nivel, objetivo, academia, descripcion, foto_url"
          )
          .in("id", idsMatches);

        if (errorPerfiles) throw errorPerfiles;

        const perfiles = perfilesDB ?? [];

        if (perfiles.length === 0) {
          if (!cancelado) setMatches([]);
          return;
        }

        // 5. Cargar sus galerías de fotos.
        const { data: fotosDB, error: errorFotos } = await supabase
          .from("profile_photos")
          .select("id, user_id, foto_url, es_principal, created_at")
          .in(
            "user_id",
            perfiles.map((perfil) => perfil.id)
          )
          .order("created_at", { ascending: true });

        if (errorFotos) throw errorFotos;

        // 6. Preparar cada perfil para ProfileCard.
        const perfilesCompletos = perfiles.map((perfil) => {
          const fotosDelPerfil = (fotosDB ?? [])
            .filter((foto) => foto.user_id === perfil.id)
            .sort(
              (a, b) =>
                Number(b.es_principal) - Number(a.es_principal)
            );

          const fotosUnicas = [];
          const urlsAgregadas = new Set();

          for (const foto of fotosDelPerfil) {
            if (foto.foto_url && !urlsAgregadas.has(foto.foto_url)) {
              fotosUnicas.push(foto.foto_url);
              urlsAgregadas.add(foto.foto_url);
            }
          }

          if (
            perfil.foto_url &&
            !urlsAgregadas.has(perfil.foto_url)
          ) {
            fotosUnicas.unshift(perfil.foto_url);
          }

          return {
            ...perfil,
            fotos: fotosUnicas,
            imagen: fotosUnicas[0] ?? null,
          };
        });

        if (!cancelado) setMatches(perfilesCompletos);
      } catch (error) {
        console.error("Error al cargar los matches:", error);

        if (!cancelado) {
          setErrorCarga(
            error.message || "No se pudieron cargar tus matches."
          );
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargarMatches();

    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <main className="min-h-[75vh] bg-[#f7f0e5] px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 text-center">
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-[#581f2b] text-[#f7f0e5]">
            <HeartHandshake size={32} />
          </div>

          <span className="text-xs font-bold tracking-[0.2em] text-[#b18432]">
            CONEXIONES MUTUAS
          </span>

          <h1 className="mt-3 font-serif text-4xl font-bold text-[#581f2b] sm:text-5xl">
            Mis Matches
          </h1>

          <p className="mx-auto mt-4 max-w-lg leading-7 text-stone-600">
            Aquí aparecen los bailarines que también han mostrado
            interés en ti. ¡Una conexión que empieza con la marinera!
          </p>
        </header>

        {cargando ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#e8ddcd] bg-[#fffaf2] p-10 text-[#581f2b]">
            <LoaderCircle size={23} className="animate-spin" />
            Buscando tus conexiones...
          </div>
        ) : !autenticado ? (
          <div className="rounded-2xl border border-[#e8ddcd] bg-[#fffaf2] p-8 text-center">
            <Users size={40} className="mx-auto text-[#b18432]" />

            <h2 className="mt-4 font-serif text-2xl font-bold text-[#581f2b]">
              Inicia sesión para ver tus matches
            </h2>

            <Link
              to="/acceso"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#581f2b] px-6 py-3 font-semibold text-white transition hover:bg-[#71303d]"
            >
              Iniciar sesión <ArrowRight size={17} />
            </Link>
          </div>
        ) : errorCarga ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800"
          >
            <p className="font-semibold">
              No pudimos cargar tus matches.
            </p>
            <p className="mt-2 wrap-break-words text-sm">{errorCarga}</p>
            <p className="mt-3 text-sm">
              Revisa las políticas RLS de Supabase y vuelve a intentarlo.
            </p>
          </div>
        ) : matches.length === 0 ? (
          <div className="rounded-2xl border border-[#e8ddcd] bg-[#fffaf2] px-6 py-12 text-center shadow-sm">
            <Heart
              size={45}
              className="mx-auto text-[#b18432]"
              strokeWidth={1.5}
            />

            <h2 className="mt-5 font-serif text-2xl font-bold text-[#581f2b]">
              Tu primera conexión te espera
            </h2>

            <p className="mx-auto mt-3 max-w-md leading-7 text-stone-600">
              Cuando tú y otro bailarín se den like mutuamente, su perfil
              aparecerá aquí automáticamente al volver a cargar la página.
            </p>

            <Link
              to="/descubrir"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#581f2b] px-6 py-3 font-semibold text-white transition hover:bg-[#71303d]"
            >
              Descubrir bailarines
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between gap-3">
              <p className="text-sm text-stone-600">
                Tienes{" "}
                <strong className="text-[#581f2b]">
                  {matches.length}{" "}
                  {matches.length === 1 ? "match" : "matches"}
                </strong>
              </p>

              <Link
                to="/descubrir"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#581f2b] hover:underline"
              >
                Seguir descubriendo <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid items-start gap-8 md:grid-cols-2">
              {matches.map((bailarin) => (
                <article key={bailarin.id} className="min-w-0">
                  <div className="mb-3 flex items-center justify-center gap-2 rounded-full border border-[#e4d3bd] bg-[#fffaf2] px-4 py-2 text-sm font-semibold text-[#581f2b]">
                    <HeartHandshake size={18} className="text-[#b18432]" />
                    ¡Conexión mutua!
                  </div>

                  <ProfileCard bailarín={bailarin} />
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default Matches;
