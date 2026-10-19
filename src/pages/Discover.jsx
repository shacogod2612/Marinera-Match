
import { useState } from "react";
import {
  Heart,
  X,
  Star,
  RotateCcw,
  HandHeart,
  SlidersHorizontal,
} from "lucide-react";

import { bailarines } from "../data/bailarines";
import ProfileCard from "../components/ProfileCard";

const filtrosIniciales = {
  sexo: "Todos",
  ciudad: "Todas",
  nivel: "Todos",
  objetivo: "Todos",
  academia: "Todas",
};

function Discover() {
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const [vistos, setVistos] = useState([]);
  const [likes, setLikes] = useState([]);
  const [destacados, setDestacados] = useState([]);

  // Obtenemos las opciones directamente de los datos.
  const ciudades = [
    "Todas",
    ...new Set(bailarines.map((b) => b.ciudad)),
  ];

  const academias = [
    "Todas",
    ...new Set(
      bailarines
        .map((b) => b.academia)
        .filter(Boolean)
    ),
  ];

  const perfilesFiltrados = bailarines.filter((bailarin) => {
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
        bailarin.academia === filtros.academia)
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
    setLikes([]);
    setDestacados([]);
  }

  const clasesSelect =
    "mt-2 w-full rounded-xl border border-[#e4d3bd] bg-white px-3 py-3 text-sm text-[#242321] outline-none focus:border-[#581f2b] focus:ring-2 focus:ring-[#581f2b]/10";

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
              opciones={["Todos", "Práctica", "Concursos"]}
            />

            <div className="sm:col-span-2">
              <CampoFiltro
                etiqueta="Academia"
                campo="academia"
                valor={filtros.academia}
                opciones={academias}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFiltros(filtrosIniciales)}
            className="mt-4 text-sm font-semibold text-[#581f2b] underline underline-offset-4 hover:text-[#8a3b4a]"
          >
            Limpiar filtros
          </button>
        </section>

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
              No hay más perfiles
            </h2>

            <p className="mt-3 leading-7 text-stone-600">
              Prueba otros filtros o reinicia tu búsqueda.
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
      </div>
    </main>
  );
}

export default Discover;
