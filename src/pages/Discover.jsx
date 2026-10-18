
import { useState } from "react";
import {
  Heart,
  X,
  Star,
  RotateCcw,
  HandHeart,
} from "lucide-react";

import { bailarines } from "../data/bailarines";
import ProfileCard from "../components/ProfileCard";

function Discover() {
  const [indice, setIndice] = useState(0);
  const [likes, setLikes] = useState([]);
  const [destacados, setDestacados] = useState([]);

  const sinPerfiles = indice >= bailarines.length;
  const bailarínActual = bailarines[indice];

  function pasarPerfil() {
    if (sinPerfiles) return;

    setIndice((actual) => actual + 1);
  }

  function darLike() {
    if (sinPerfiles) return;

    setLikes((actuales) => [
      ...actuales,
      bailarínActual.id,
    ]);

    pasarPerfil();
  }

  function destacarPerfil() {
    if (sinPerfiles) return;

    setDestacados((actuales) => [
      ...actuales,
      bailarínActual.id,
    ]);

    pasarPerfil();
  }

  function reiniciarBusqueda() {
    setIndice(0);
    setLikes([]);
    setDestacados([]);
  }

  return (
    <main className="min-h-[75vh] bg-[#f7f0e5] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-xl">
        <header className="mb-9 text-center">
          <span className="text-xs font-bold tracking-[0.2em] text-[#b18432]">
            TU PRÓXIMA PAREJA DE MARINERA
          </span>

          <h1 className="mt-4 font-serif text-4xl font-bold text-[#581f2b] sm:text-5xl">
            Descubre a tu compañero ideal.
          </h1>

          <p className="mx-auto mt-4 max-w-md leading-7 text-stone-600">
            Conecta con bailarines que comparten tu pasión,
            tu nivel y tus ganas de crecer.
          </p>
        </header>

        {!sinPerfiles ? (
          <>
            <ProfileCard bailarín={bailarínActual} />

            <p className="mt-4 text-center text-sm text-stone-500">
              Perfil {indice + 1} de {bailarines.length}
            </p>

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

            <p className="mt-5 text-center text-xs text-stone-500">
              {likes.length} likes · {destacados.length} destacados
            </p>
          </>
        ) : (
          <div className="rounded-2xl border border-[#e8ddcd] bg-[#fffaf2] px-6 py-12 text-center shadow-lg">
            <HandHeart
              size={48}
              className="mx-auto text-[#b18432]"
            />

            <h2 className="mt-5 font-serif text-2xl font-bold text-[#581f2b]">
              ¡Has conocido a todos!
            </h2>

            <p className="mt-3 leading-7 text-stone-600">
              Por ahora no quedan más perfiles. Puedes
              volver a empezar tu búsqueda.
            </p>

            <button
              type="button"
              onClick={reiniciarBusqueda}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#581f2b] px-5 py-3 font-semibold text-white transition hover:bg-[#71303d]"
            >
              <RotateCcw size={17} />
              Volver a explorar
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default Discover;
