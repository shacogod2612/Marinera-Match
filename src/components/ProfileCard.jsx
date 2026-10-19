
import { MapPin } from "lucide-react";

function ProfileCard({ bailarín }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#e8ddcd] bg-[#fffaf2] shadow-xl shadow-[#581f2b]/10">
      <div className="h-72 overflow-hidden bg-[#e8ddcd] sm:h-80">
        <img
          src={bailarín.imagen}
          alt={`Fotografía ilustrativa del perfil de ${bailarín.nombre}`}
          className="h-full w-full object-contain object-center"
        />
      </div>

      <div className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-3xl font-bold text-[#581f2b]">
            {bailarín.nombre}, {bailarín.edad}, 
          </h2>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
            {[
              bailarín.sexo,
              bailarín.nivel,
              bailarín.objetivo,
              bailarín.academia,
            ].map((etiqueta) => (
              <span
                key={etiqueta}
                className="rounded-full border border-[#e4d3bd] px-3 py-1.5 text-xs font-semibold text-[#581f2b]"
              >
                {etiqueta}
              </span>
            ))}
        </div>

        <p className="mt-4 flex items-center gap-2 text-sm text-stone-500">
          <MapPin size={17} />
          {bailarín.ciudad}, Perú
        </p>

        <p className="mt-4 leading-7 text-stone-700">
          {bailarín.descripcion}
        </p>

          <h3 className="mt-4 leading-7 text-[#581f2b]">
          Academia: {bailarín.academia}
        </h3>
      </div>
    </article>
  );
}

export default ProfileCard;
