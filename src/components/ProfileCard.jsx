
import { useEffect, useState } from "react";
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  UserRound,
} from "lucide-react";

function ProfileCard({ bailarín }) {
  const [indiceFoto, setIndiceFoto] = useState(0);
  const [errorImagen, setErrorImagen] = useState(false);

  const fotos = Array.isArray(bailarín.fotos)
    ? bailarín.fotos
    : bailarín.imagen
      ? [bailarín.imagen]
      : [];

  const indiceSeguro = Math.min(
    indiceFoto,
    Math.max(fotos.length - 1, 0)
  );

  const fotoActual = fotos[indiceSeguro];

  useEffect(() => {
    setIndiceFoto(0);
    setErrorImagen(false);
  }, [bailarín.id]);

  useEffect(() => {
    setErrorImagen(false);
  }, [fotoActual]);

  function fotoAnterior() {
    setIndiceFoto((actual) =>
      actual === 0 ? fotos.length - 1 : actual - 1
    );
  }

  function fotoSiguiente() {
    setIndiceFoto((actual) =>
      actual === fotos.length - 1 ? 0 : actual + 1
    );
  }

  const etiquetas = [
    bailarín.sexo,
    bailarín.nivel,
    bailarín.objetivo,
    bailarín.academia,
  ].filter(Boolean);

  return (
    <article className="overflow-hidden rounded-2xl border border-[#e8ddcd] bg-[#fffaf2] shadow-xl shadow-[#581f2b]/10">
      <div className="relative flex h-420px items-center justify-center overflow-hidden bg-[#211b1b] sm:h-520px">
        {fotoActual && !errorImagen ? (
          <img
            src={fotoActual}
            alt={`Foto ${indiceSeguro + 1} del perfil de ${bailarín.nombre}`}
            onError={() => setErrorImagen(true)}
            className="h-full w-full object-contain object-center"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-[#8c756c]">
            <UserRound size={64} strokeWidth={1.3} />
            <span className="text-sm">
              {fotos.length > 0
                ? "No se pudo cargar esta foto"
                : "Este perfil aún no tiene fotos"}
            </span>
          </div>
        )}

        {fotos.length > 1 && (
          <>
            <button
              type="button"
              onClick={fotoAnterior}
              aria-label="Ver foto anterior"
              className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white shadow-md transition hover:bg-black/70"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              type="button"
              onClick={fotoSiguiente}
              aria-label="Ver foto siguiente"
              className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white shadow-md transition hover:bg-black/70"
            >
              <ChevronRight size={24} />
            </button>

            <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
              {indiceSeguro + 1} / {fotos.length}
            </span>
          </>
        )}
      </div>

      {fotos.length > 1 && (
        <div className="flex justify-center gap-2 border-b border-[#e8ddcd] px-4 py-3">
          {fotos.map((foto, indice) => (
            <button
              key={`${foto}-${indice}`}
              type="button"
              onClick={() => setIndiceFoto(indice)}
              aria-label={`Ver foto ${indice + 1}`}
              aria-pressed={indiceSeguro === indice}
              className={`size-2.5 rounded-full transition ${
                indiceSeguro === indice
                  ? "scale-125 bg-[#581f2b]"
                  : "bg-[#d8c8b8] hover:bg-[#b18432]"
              }`}
            />
          ))}
        </div>
      )}

      <div className="p-6">
        <h2 className="font-serif text-3xl font-bold text-[#581f2b]">
          {bailarín.nombre}
          {bailarín.edad != null && `, ${bailarín.edad}`}
        </h2>

        <div className="mt-4 flex flex-wrap gap-2">
          {etiquetas.map((etiqueta, indice) => (
            <span
              key={`${etiqueta}-${indice}`}
              className="rounded-full border border-[#e4d3bd] px-3 py-1.5 text-xs font-semibold text-[#581f2b]"
            >
              {etiqueta}
            </span>
          ))}
        </div>

        {bailarín.ciudad && (
          <p className="mt-4 flex items-center gap-2 text-sm text-stone-500">
            <MapPin size={17} />
            {bailarín.ciudad}, Perú
          </p>
        )}

        {bailarín.descripcion && (
          <p className="mt-4 whitespace-pre-line leading-7 text-stone-700">
            {bailarín.descripcion}
          </p>
        )}

        {bailarín.academia && (
          <h3 className="mt-4 font-semibold text-[#581f2b]">
            Academia: {bailarín.academia}
          </h3>
        )}
      </div>
    </article>
  );
}

export default ProfileCard;
