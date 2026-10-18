
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Users, Trophy } from "lucide-react";

function Home() {
  return (
    <main className="overflow-hidden">
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e4d3bd] px-4 py-2 text-xs font-bold tracking-[0.16em] text-[#581f2b]">
            <span className="size-2 rounded-full bg-[#d6a64f]" />
            UNA PASIÓN QUE NOS UNE
          </span>

          <h1 className="mt-7 font-serif text-5xl font-bold leading-tight text-[#581f2b] sm:text-6xl lg:text-7xl">
            Dos pañuelos.
            <span className="mt-2 block text-[#b18432]">
              Una misma pasión.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-stone-600 sm:text-lg">
            Encuentra a esa persona con quien compartir el arte de la
            marinera peruana, entrenar, crecer y alcanzar nuevos sueños.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/descubrir"
              className="inline-flex items-center gap-2 rounded-full bg-[#581f2b] px-6 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#71303d]"
            >
              Encontrar pareja
              <ArrowRight size={18} />
            </Link>

            <a
              href="#como-funciona"
              className="rounded-full border border-[#d9c8b1] px-6 py-3.5 font-semibold text-[#581f2b] transition hover:bg-white/60"
            >
              Cómo funciona
            </a>
          </div>

          <div className="mt-8 flex items-center gap-3 text-sm text-stone-500">
            <Heart size={18} className="text-[#b18432]" />
            Unidos por el arte de nuestra tradición.
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -right-5 -top-5 size-28 rounded-full bg-[#d6a64f]/20 blur-2xl" />

          <div className="relative flex min-h-400px flex-col items-center justify-center overflow-hidden rounded-2rem border border-[#e4d3bd] bg-liner-to-br from-[#71303d] via-[#581f2b] to-[#35141b] p-8 text-center shadow-2xl sm:min-h-480px">
            <span className="mb-6 rounded-full border border-[#d6a64f]/50 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-[#e9c77d]">
              TRADICIÓN · ARTE · CONEXIÓN
            </span>

            <div className="grid size-28 place-items-center rounded-full border border-[#d6a64f]/50 bg-white/5">
              <Heart size={54} strokeWidth={1.2} className="text-[#e9c77d]" />
            </div>

            <h2 className="mt-8 font-serif text-3xl font-bold text-[#f7f0e5] sm:text-4xl">
              La marinera nos une
            </h2>

            <p className="mt-4 max-w-xs leading-7 text-[#f7f0e5]/75">
              Cada paso cuenta una historia. Encuentra con quién escribir la tuya.
            </p>

            <div className="mt-8 h-px w-24 bg-[#d6a64f]" />

            <span className="mt-5 text-sm font-semibold tracking-[0.25em] text-[#e9c77d]">
              ORGULLO PERUANO
            </span>
          </div>
        </div>
      </section>

      <section
        id="como-funciona"
        className="border-t border-[#e8ddcd] bg-white/40 px-5 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold tracking-[0.2em] text-[#b18432]">
              MÁS QUE UN BAILE
            </span>

            <h2 className="mt-4 font-serif text-3xl font-bold text-[#581f2b] sm:text-4xl">
              Tu próxima gran pareja comienza aquí.
            </h2>

            <p className="mt-4 leading-7 text-stone-600">
              Un espacio para encontrar pareja de práctica, prepararte para
              concursos y seguir creciendo en la marinera.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-[#e8ddcd] bg-[#fffaf2] p-6">
              <Users size={28} className="text-[#b18432]" />
              <h3 className="mt-5 font-serif text-xl font-bold text-[#581f2b]">
                Conoce bailarines
              </h3>
              <p className="mt-3 leading-7 text-stone-600">
                Descubre personas según su ciudad, nivel y objetivos.
              </p>
            </article>

            <article className="rounded-2xl border border-[#e8ddcd] bg-[#fffaf2] p-6">
              <Heart size={28} className="text-[#b18432]" />
              <h3 className="mt-5 font-serif text-xl font-bold text-[#581f2b]">
                Conecta mutuamente
              </h3>
              <p className="mt-3 leading-7 text-stone-600">
                Expresa tu interés y descubre cuándo ambos quieren conectar.
              </p>
            </article>

            <article className="rounded-2xl border border-[#e8ddcd] bg-[#fffaf2] p-6">
              <Trophy size={28} className="text-[#b18432]" />
              <h3 className="mt-5 font-serif text-xl font-bold text-[#581f2b]">
                Crezcan juntos
              </h3>
              <p className="mt-3 leading-7 text-stone-600">
                Encuentra una pareja con metas compatibles para practicar y competir.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
