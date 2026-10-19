
import { Heart, HandHeart, X } from "lucide-react";
import { bailarines } from "../data/bailarines";
import ProfileCard from "../components/ProfileCard";

function Favorites({ likes, setLikes }) {
  const perfilesFavoritos = bailarines.filter((bailarin) =>
    likes.includes(bailarin.id)
  );

  function quitarFavorito(id) {
    setLikes((actuales) =>
      actuales.filter((idFavorito) => idFavorito !== id)
    );
  }

  return (
    <main className="min-h-[75vh] bg-[#f7f0e5] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 text-center">
          <Heart
            size={34}
            className="mx-auto mb-4 text-[#581f2b]"
          />

          <h1 className="font-serif text-4xl font-bold text-[#581f2b]">
            Mis favoritos
          </h1>

          <p className="mt-3 text-stone-600">
            Administra los bailarines que te interesan.
          </p>
        </header>

        {perfilesFavoritos.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {perfilesFavoritos.map((bailarin) => (
              <article
                key={bailarin.id}
                className="relative"
              >
                <ProfileCard bailarín={bailarin} />

                <button
                  type="button"
                  onClick={() => quitarFavorito(bailarin.id)}
                  aria-label={`Quitar a ${bailarin.nombre} de favoritos`}
                  title="Quitar de favoritos"
                  className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-white text-[#581f2b] shadow-md transition hover:scale-110 hover:bg-red-50 hover:text-red-700"
                >
                  <X size={20} />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#e8ddcd] bg-[#fffaf2] px-6 py-12 text-center">
            <HandHeart
              size={48}
              className="mx-auto text-[#b18432]"
            />

            <h2 className="mt-5 font-serif text-2xl font-bold text-[#581f2b]">
              Todavía no tienes favoritos
            </h2>

            <p className="mt-3 leading-7 text-stone-600">
              Explora los perfiles y pulsa el corazón cuando encuentres
              un bailarín que te interese.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default Favorites;
