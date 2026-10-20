
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
  "mt-2 w-full rounded-xl border border-[#e4d3bd] bg-white px-3 py-3 text-sm text-[#242321] outline-none focus:border-[#581f2b] focus:ring-2 focus:ring-[#581f2b]/10";

function Discover({ likes, setLikes }) {
  const [bailarines, setBailarines] = useState([]);
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const [vistos, setVistos] = useState([]);
  const [destacados, setDestacados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [autenticado, setAutenticado] = useState(false);

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

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, nombre, edad, sexo, ciudad, nivel, objetivo, academia, descripcion, imagen_url"
        )
        .neq("id", user.id)
        .order("created_at", { ascending: false });

      if (cancelado) return;

      if (error) {
        setErrorCarga(
          `No se pudieron cargar los perfiles: ${error.message}`
        );
        setBailarines([]);
      } else {
        const perfiles = (data ?? []).map((perfil) => ({
          ...perfil,
          imagen:
            perfil.imagen_url ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800",
        }));

        setBailarines(perfiles);
      }

      setCargando(false);
    }

    cargarBailarines();

    return () => {
      cancelado = true;
    };
  }, []);

  const ciudades = [
    "Todas",
    ...new Set(
      bailarines.map((b) => b.ciudad).filter(Boolean)
    ),
  ];

  const academias = [
    "Todas",
    ...new Set(
      bailarines.map((b) => b.academia).filter(Boolean)
    ),
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
            bailarin.objetivo === filtros.objetivo ||
            (filtros.objetivo === "Ambos" &&
              bailarin.objetivo === "Ambos")) &&
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

  function darLike() {
    if (!bailarínActual) return;

    setLikes((actuales) =>
      actuales.includes(bailarínActual.id)
        ? actuales
        : [...actuales, bailarínActual.id]
    );

    pasarPerfil();
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
    setFiltros(filtrosIniciales);
    setVistos([]);
    setDestacados([]);
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
    <main className="min-h-[75vh] bg-[#f7f0e5] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-xl">
        <header className="mb-8 text-center">
          <span className="text-xs font-bold tracking-[0.2em] text-[#b18432]">
            TU PRÓXIMA PAREJA DE MARINERA
          </span>

          <h1 className="mt-4 font-serif text-4xl font-bold text-[#581f2b] sm:text-5xl">
            Descubre a tu compañero ideal.
          </h1>

          <p className="mx-auto mt-4 max-w-md leading-7 text-stone-600">
            Encuentra bailarines compatibles con tus preferencias,
            tu nivel y tus objetivos.
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
            {errorCarga}
          </div>
        ) : (
          <>
            <section className="mb-8 rounded-2xl border border-[#e8ddcd] bg-[#fffaf2] p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <SlidersHorizontal size={20} className="text-[#b18432]" />
                <h2 className="font-serif text-xl font-bold text-[#581f2b]">
                  Filtrar bailarines
                </h2>
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
                  opciones={["Todos", "Práctica", "Concursos", "Ambos"]}
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

              <button
                type="button"
                onClick={() => setFiltros(filtrosIniciales)}
                className="mt-4 text-sm font-semibold text-[#581f2b] underline underline-offset-4 hover:text-[#8a3b4a]"
              >
                Limpiar filtros
              </button>
            </section>

            {errorEdad && (
              <p
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
              >
                {errorEdad}
              </p>
            )}

            <p className="mb-4 text-center text-sm text-stone-500">
              {perfilesDisponibles.length} perfiles disponibles
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
                    : "No hay más perfiles"}
                </h2>

                <p className="mt-3 leading-7 text-stone-600">
                  {bailarines.length === 0
                    ? "Cuando otros bailarines se registren y completen sus perfiles, aparecerán aquí."
                    : "Prueba otros filtros o reinicia tu búsqueda."}
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
