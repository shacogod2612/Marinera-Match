
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  X,
  Star,
  RotateCcw,
  HandHeart,
  SlidersHorizontal,
  LoaderCircle,
  ChevronDown,
  FilterX,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import ProfileCard from "../components/ProfileCard";

const filtrosIniciales = {
  sexo: "Todos",
  ciudad: "Todas",
  nivel: "Todos",
  objetivo: "Todos",
  academia: "Todas",
  edadMinima: "",
  edadMaxima: "",
};

const clasesSelect =
  "mt-2 w-full rounded-xl border border-[#e4d3bd] bg-white px-3 py-3 text-sm text-[#242321] outline-none transition focus:border-[#581f2b] focus:ring-2 focus:ring-[#581f2b]/10";

function Discover({ likes, setLikes }) {
  const [bailarines, setBailarines] = useState([]);
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [vistos, setVistos] = useState([]);
  const [destacados, setDestacados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [guardandoLike, setGuardandoLike] = useState(false);
  const [errorLike, setErrorLike] = useState("");
  const [avisoMatch, setAvisoMatch] = useState("");

  useEffect(() => {
    let cancelado = false;

    async function cargarBailarines() {
      setCargando(true);
      setErrorCarga("");

      const {
        data: { user },
        error: errorUsuario,
      } = await supabase.auth.getUser();

      if (cancelado) return;

      if (errorUsuario || !user) {
        setAutenticado(false);
        setBailarines([]);
        setCargando(false);
        return;
      }

      setAutenticado(true);

      const { data: perfilesDB, error: errorPerfiles } =
        await supabase
          .from("profiles")
          .select(
            "id, nombre, edad, sexo, ciudad, nivel, objetivo, academia, descripcion, foto_url"
          )
          .neq("id", user.id)
          .order("created_at", { ascending: false });

      if (cancelado) return;

      if (errorPerfiles) {
        setErrorCarga(
          `No se pudieron cargar los perfiles: ${errorPerfiles.message}`
        );
        setBailarines([]);
        setCargando(false);
        return;
      }

      const perfiles = perfilesDB ?? [];

      if (perfiles.length === 0) {
        setBailarines([]);
        setCargando(false);
        return;
      }

      const idsPerfiles = perfiles.map((perfil) => perfil.id);

      const { data: fotosDB, error: errorFotos } = await supabase
        .from("profile_photos")
        .select("id, user_id, foto_url, es_principal, created_at")
        .in("user_id", idsPerfiles)
        .order("created_at", { ascending: true });

      if (cancelado) return;

      if (errorFotos) {
        setErrorCarga(
          `Los perfiles se encontraron, pero no se pudieron cargar sus galerías: ${errorFotos.message}`
        );
        setBailarines([]);
        setCargando(false);
        return;
      }

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

        if (perfil.foto_url && !urlsAgregadas.has(perfil.foto_url)) {
          fotosUnicas.unshift(perfil.foto_url);
          urlsAgregadas.add(perfil.foto_url);
        }

        return {
          ...perfil,
          imagen: fotosUnicas[0] ?? null,
          fotos: fotosUnicas,
        };
      });

      setBailarines(perfilesCompletos);
      setCargando(false);
    }

    cargarBailarines();

    return () => {
      cancelado = true;
    };
  }, []);

  const ciudades = [
    "Todas",
    ...new Set(bailarines.map((b) => b.ciudad).filter(Boolean)),
  ];

  const academias = [
    "Todas",
    ...new Set(bailarines.map((b) => b.academia).filter(Boolean)),
  ];

  const edadMinima =
    filtros.edadMinima === "" ? null : Number(filtros.edadMinima);

  const edadMaxima =
    filtros.edadMaxima === "" ? null : Number(filtros.edadMaxima);

  let errorEdad = "";

  if (
    filtros.edadMinima !== "" &&
    (!Number.isInteger(edadMinima) || edadMinima < 1)
  ) {
    errorEdad = "La edad mínima debe ser un número entero mayor que 0.";
  } else if (
    filtros.edadMaxima !== "" &&
    (!Number.isInteger(edadMaxima) || edadMaxima < 1)
  ) {
    errorEdad = "La edad máxima debe ser un número entero mayor que 0.";
  } else if (
    edadMinima !== null &&
    edadMaxima !== null &&
    edadMinima > edadMaxima
  ) {
    errorEdad = "La edad mínima no puede ser mayor que la edad máxima.";
  }

  const perfilesFiltrados = errorEdad
    ? []
    : bailarines.filter((bailarin) => {
        return (
          (filtros.sexo === "Todos" ||
            bailarin.sexo === filtros.sexo) &&
          (filtros.ciudad === "Todas" ||
            bailarin.ciudad === filtros.ciudad) &&
          (filtros.nivel === "Todos" ||
            bailarin.nivel === filtros.nivel) &&
          (filtros.objetivo === "Todos" ||
            bailarin.objetivo === filtros.objetivo) &&
          (filtros.academia === "Todas" ||
            bailarin.academia === filtros.academia) &&
          (edadMinima === null ||
            (bailarin.edad != null && bailarin.edad >= edadMinima)) &&
          (edadMaxima === null ||
            (bailarin.edad != null && bailarin.edad <= edadMaxima))
        );
      });

  const perfilesDisponibles = perfilesFiltrados.filter(
    (bailarin) => !vistos.includes(bailarin.id)
  );

  const bailarínActual = perfilesDisponibles[0];

  const cantidadFiltrosActivos = [
    filtros.sexo !== "Todos",
    filtros.ciudad !== "Todas",
    filtros.nivel !== "Todos",
    filtros.objetivo !== "Todos",
    filtros.academia !== "Todas",
    filtros.edadMinima !== "",
    filtros.edadMaxima !== "",
  ].filter(Boolean).length;

  function actualizarFiltro(campo, valor) {
    setFiltros((actuales) => ({
      ...actuales,
      [campo]: valor,
    }));
  }

  function pasarPerfil() {
    if (!bailarínActual) return;

    setVistos((actuales) =>
      actuales.includes(bailarínActual.id)
        ? actuales
        : [...actuales, bailarínActual.id]
    );
  }


  async function darLike() {
    if (!bailarínActual || guardandoLike) return;

    setGuardandoLike(true);
    setErrorLike("");
    setAvisoMatch("");

    try {
      // Obtener al usuario que está dando el like.
      const {
        data: { user },
        error: errorUsuario,
      } = await supabase.auth.getUser();

      if (errorUsuario) {
        throw errorUsuario;
      }

      if (!user) {
        throw new Error("Debes iniciar sesión para dar like.");
      }

      // Guardar el like en Supabase.
      const { error: errorGuardar } = await supabase
        .from("likes")
        .upsert(
          {
            user_id: user.id,
            liked_user_id: bailarínActual.id,
          },
          {
            onConflict: "user_id,liked_user_id",
            ignoreDuplicates: true,
          }
        );

      if (errorGuardar) {
        throw errorGuardar;
      }

      // Actualizar también el estado local de la aplicación.
      setLikes((actuales) =>
        actuales.includes(bailarínActual.id)
          ? actuales
          : [...actuales, bailarínActual.id]
      );

      // Comprobar si la otra persona ya nos había dado like.
      const { data: likeMutuo, error: errorMutuo } = await supabase
        .from("likes")
        .select("id")
        .eq("user_id", bailarínActual.id)
        .eq("liked_user_id", user.id)
        .maybeSingle();

      if (errorMutuo) {
        throw errorMutuo;
      }

      if (likeMutuo) {
        setAvisoMatch(
          `¡Es un match! Tú y ${bailarínActual.nombre} se han dado like. ❤️`
        );
      }

      // Pasar al siguiente perfil después de guardar el like.
      pasarPerfil();
    } catch (error) {
      console.error("Error al guardar el like:", error);
      setErrorLike(
        error.message || "No se pudo guardar el like. Inténtalo de nuevo."
      );
    } finally {
      setGuardandoLike(false);
    }
  }


  function destacarPerfil() {
    if (!bailarínActual) return;

    setDestacados((actuales) =>
      actuales.includes(bailarínActual.id)
        ? actuales
        : [...actuales, bailarínActual.id]
    );

    pasarPerfil();
  }

  function reiniciarBusqueda() {
    setFiltros({ ...filtrosIniciales });
    setVistos([]);
    setDestacados([]);
    setMostrarFiltros(false);
  }

  function CampoFiltro({ etiqueta, valor, campo, opciones }) {
    return (
      <label className="block text-sm font-medium text-stone-700">
        {etiqueta}
        <select
          value={valor}
          onChange={(e) => actualizarFiltro(campo, e.target.value)}
          className={clasesSelect}
        >
          {opciones.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <main className="min-h-[75vh] bg-[#f7f0e5] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-xl">
        <header className="mb-6 text-center">
          <span className="text-xs font-bold tracking-[0.2em] text-[#b18432]">
            TU PRÓXIMA PAREJA DE MARINERA
          </span>

          <h1 className="mt-3 font-serif text-3xl font-bold text-[#581f2b] sm:text-5xl">
            Descubre a tu compañero ideal.
          </h1>

          <p className="mx-auto mt-3 max-w-md leading-7 text-stone-600">
            Conoce bailarines, explora sus perfiles y encuentra a alguien
            con quien compartir tu pasión por la marinera.
          </p>
        </header>

        {cargando ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-[#fffaf2] p-10 text-[#581f2b]">
            <LoaderCircle size={22} className="animate-spin" />
            Cargando bailarines...
          </div>
        ) : !autenticado ? (
          <div className="rounded-2xl border border-[#e8ddcd] bg-[#fffaf2] px-6 py-12 text-center">
            <HandHeart size={48} className="mx-auto text-[#b18432]" />

            <h2 className="mt-5 font-serif text-2xl font-bold text-[#581f2b]">
              Inicia sesión para descubrir bailarines
            </h2>

            <p className="mt-3 leading-7 text-stone-600">
              Accede a tu cuenta para explorar los perfiles de la comunidad.
            </p>

            <Link
              to="/acceso"
              className="mt-6 inline-flex rounded-full bg-[#581f2b] px-6 py-3 font-semibold text-white transition hover:bg-[#71303d]"
            >
              Iniciar sesión
            </Link>
          </div>
        ) : errorCarga ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"
          >
            <p className="font-semibold">No se pudo cargar Descubrir.</p>
            <p className="mt-2 wrap-break-words text-sm">{errorCarga}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-[#581f2b] px-4 py-2 text-sm font-semibold text-white"
            >
              Volver a intentar
            </button>
          </div>
        ) : (
          <>
            {/* Barra compacta para abrir y cerrar los filtros */}
            <section className="mb-5">
              <button
                type="button"
                onClick={() => setMostrarFiltros((actual) => !actual)}
                aria-expanded={mostrarFiltros}
                aria-controls="panel-filtros"
                className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-left shadow-sm transition ${
                  mostrarFiltros
                    ? "border-[#581f2b] bg-[#581f2b] text-white"
                    : "border-[#e8ddcd] bg-[#fffaf2] text-[#581f2b] hover:border-[#b18432]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`grid size-10 place-items-center rounded-xl ${
                      mostrarFiltros
                        ? "bg-white/10"
                        : "bg-[#f3e8d6]"
                    }`}
                  >
                    <SlidersHorizontal size={20} />
                  </span>

                  <span>
                    <span className="block font-semibold">
                      Filtrar bailarines
                    </span>
                    <span
                      className={`mt-0.5 block text-xs ${
                        mostrarFiltros ? "text-white/75" : "text-stone-500"
                      }`}
                    >
                      {cantidadFiltrosActivos > 0
                        ? `${cantidadFiltrosActivos} ${
                            cantidadFiltrosActivos === 1
                              ? "filtro activo"
                              : "filtros activos"
                          }`
                        : "Personaliza tu búsqueda"}
                    </span>
                  </span>
                </span>

                <ChevronDown
                  size={21}
                  className={`shrink-0 transition-transform duration-200 ${
                    mostrarFiltros ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mostrarFiltros && (
                <div
                  id="panel-filtros"
                  className="mt-3 rounded-2xl border border-[#e8ddcd] bg-[#fffaf2] p-5 shadow-sm"
                >
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-serif text-xl font-bold text-[#581f2b]">
                        Tus preferencias
                      </h2>
                      <p className="mt-1 text-sm text-stone-500">
                        Combina los criterios que quieras.
                      </p>
                    </div>

                    {cantidadFiltrosActivos > 0 && (
                      <button
                        type="button"
                        onClick={() => setFiltros({ ...filtrosIniciales })}
                        className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#581f2b] transition hover:text-[#8a3b4a]"
                      >
                        <FilterX size={17} />
                        Limpiar
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <CampoFiltro
                      etiqueta="Busco"
                      campo="sexo"
                      valor={filtros.sexo}
                      opciones={["Todos", "Masculino", "Femenino"]}
                    />

                    <CampoFiltro
                      etiqueta="Ciudad"
                      campo="ciudad"
                      valor={filtros.ciudad}
                      opciones={ciudades}
                    />

                    <CampoFiltro
                      etiqueta="Nivel de marinera"
                      campo="nivel"
                      valor={filtros.nivel}
                      opciones={[
                        "Todos",
                        "Principiante",
                        "Medio",
                        "Avanzado",
                      ]}
                    />

                    <CampoFiltro
                      etiqueta="Objetivo"
                      campo="objetivo"
                      valor={filtros.objetivo}
                      opciones={[
                        "Todos",
                        "Práctica",
                        "Concursos",
                        "Ambos",
                      ]}
                    />

                    <div className="sm:col-span-2">
                      <CampoFiltro
                        etiqueta="Academia"
                        campo="academia"
                        valor={filtros.academia}
                        opciones={academias}
                      />
                    </div>

                    <label className="block text-sm font-medium text-stone-700">
                      Edad mínima
                      <input
                        type="number"
                        min="1"
                        placeholder="Ej. 18"
                        value={filtros.edadMinima}
                        onChange={(e) =>
                          actualizarFiltro("edadMinima", e.target.value)
                        }
                        className={clasesSelect}
                      />
                    </label>

                    <label className="block text-sm font-medium text-stone-700">
                      Edad máxima
                      <input
                        type="number"
                        min="1"
                        placeholder="Ej. 35"
                        value={filtros.edadMaxima}
                        onChange={(e) =>
                          actualizarFiltro("edadMaxima", e.target.value)
                        }
                        className={clasesSelect}
                      />
                    </label>
                  </div>

                  {cantidadFiltrosActivos > 0 && (
                    <button
                      type="button"
                      onClick={() => setFiltros({ ...filtrosIniciales })}
                      className="mt-5 w-full rounded-xl border border-[#e4d3bd] px-4 py-3 text-sm font-semibold text-[#581f2b] transition hover:bg-[#f7f0e5]"
                    >
                      Restablecer todos los filtros
                    </button>
                  )}
                </div>
              )}
            </section>

            {errorEdad && (
              <p
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
              >
                {errorEdad}
              </p>
            )}
            {errorLike && (
              <p
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {errorLike}
              </p>
            )}

            {avisoMatch && (
              <div
                role="status"
                className="mb-4 rounded-xl border border-[#d6a64f] bg-[#fffaf2] px-4 py-4 text-center text-[#581f2b]"
              >
                <Heart className="mx-auto mb-2" size={25} />
                <p className="font-semibold">{avisoMatch}</p>
                <Link
                  to="/matches"
                  className="mt-2 inline-block text-sm font-semibold underline underline-offset-4"
                >
                  Ver mis matches
                </Link>
              </div>
            )}

            <p className="mb-4 text-center text-sm text-stone-500">
              {perfilesDisponibles.length}{" "}
              {perfilesDisponibles.length === 1
                ? "perfil disponible"
                : "perfiles disponibles"}
            </p>

            {bailarínActual ? (
              <>
                <ProfileCard bailarín={bailarínActual} />

                <div className="mt-6 flex items-center justify-center gap-5">
                  <button
                    type="button"
                    onClick={pasarPerfil}
                    aria-label="Pasar perfil"
                    title="Pasar"
                    className="grid size-14 place-items-center rounded-full border border-[#e8ddcd] bg-[#fffaf2] text-red-700 shadow-md transition hover:scale-110"
                  >
                    <X size={26} />
                  </button>

                  <button
                    type="button"
                    onClick={destacarPerfil}
                    aria-label="Destacar perfil"
                    title="Destacar"
                    className="grid size-12 place-items-center rounded-full border border-[#e8ddcd] bg-[#fffaf2] text-[#b18432] shadow-md transition hover:scale-110"
                  >
                    <Star size={23} />
                  </button>

                  <button
                    type="button"
                    onClick={darLike}
                    disabled={guardandoLike}
                    aria-label="Me interesa"
                    title="Me interesa"
                    className="grid size-16 place-items-center rounded-full bg-[#581f2b] text-white shadow-lg transition hover:scale-110 hover:bg-[#71303d]"
                  >
                    <Heart size={28} />
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-[#e8ddcd] bg-[#fffaf2] px-6 py-12 text-center shadow-lg">
                <HandHeart size={48} className="mx-auto text-[#b18432]" />

                <h2 className="mt-5 font-serif text-2xl font-bold text-[#581f2b]">
                  {bailarines.length === 0
                    ? "Todavía no hay otros perfiles"
                    : errorEdad
                      ? "Revisa el rango de edad"
                      : "No hay perfiles con estos criterios"}
                </h2>

                <p className="mt-3 leading-7 text-stone-600">
                  {bailarines.length === 0
                    ? "Cuando otros bailarines se registren y completen sus perfiles, aparecerán aquí."
                    : errorEdad
                      ? "Corrige las edades para continuar."
                      : "Prueba otros filtros o reinicia tu búsqueda para descubrir más bailarines."}
                </p>

                <button
                  type="button"
                  onClick={reiniciarBusqueda}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#581f2b] px-5 py-3 font-semibold text-white transition hover:bg-[#71303d]"
                >
                  <RotateCcw size={17} />
                  Reiniciar búsqueda
                </button>
              </div>
            )}

            <p className="mt-5 text-center text-xs text-stone-500">
              {likes.length} likes · {destacados.length} destacados
            </p>
          </>
        )}
      </div>
    </main>
  );
}

export default Discover;
