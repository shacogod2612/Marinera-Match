
import { Link, NavLink } from "react-router-dom";
import { Heart } from "lucide-react";

const enlaces = [
  { to: "/", label: "Inicio", end: true },
  { to: "/descubrir", label: "Descubrir" },
  { to: "/matches", label: "Matches" },
  { to: "/perfil", label: "Mi perfil" },
  { to: "/favoritos", label: "Favoritos" },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e8ddcd] bg-[#f7f0e5]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-[#581f2b] font-serif text-lg font-bold text-[#d6a64f]">
            EP
          </span>

          <span className="font-serif text-lg font-bold text-[#581f2b] sm:text-xl">
            Marinera Match
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {enlaces.map((enlace) => (
            <NavLink
              key={enlace.to}
              to={enlace.to}
              end={enlace.end}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[#581f2b]"
                    : "text-stone-600 hover:text-[#581f2b]"
                }`
              }
            >
              {enlace.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/descubrir"
          className="flex items-center gap-2 rounded-full bg-[#581f2b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#71303d]"
        >
          <Heart size={16} />
          <span className="hidden sm:inline">Encontrar pareja</span>
        </Link>
      </div>

      <nav className="flex justify-around border-t border-[#e8ddcd] px-2 py-3 md:hidden">
        {enlaces.map((enlace) => (
          <NavLink
            key={enlace.to}
            to={enlace.to}
            end={enlace.end}
            className={({ isActive }) =>
              `text-xs font-medium ${
                isActive ? "text-[#581f2b]" : "text-stone-500"
              }`
            }
          >
            {enlace.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;
