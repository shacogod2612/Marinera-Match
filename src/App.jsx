
import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Matches from "./pages/Matches";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
import RecuperarContrasena from "./pages/RecuperarContrasena";
import NuevaContrasena from "./pages/NuevaContrasena";

function App() {
  const [likes, setLikes] = useState([]);
  const [fotoPerfil, setFotoPerfil] = useState(null);

  return (
    <div className="min-h-screen bg-[#f7f0e5] pb-20 md:pb-0">
      <Navbar
        fotoPerfil={fotoPerfil}
        setFotoPerfil={setFotoPerfil}
      />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/descubrir"
          element={
            <Discover
              likes={likes}
              setLikes={setLikes}
            />
          }
        />

        <Route
          path="/favoritos"
          element={
            <Favorites
              likes={likes}
              setLikes={setLikes}
            />
          }
        />

        <Route path="/matches" element={<Matches />} />

        <Route
          path="/perfil"
          element={
            <Profile
              onFotoPerfilChange={setFotoPerfil}
            />
          }
        />

        <Route path="/acceso" element={<Auth />} />
        <Route path="/chat/:conversationId" element={<Chat />} />
        <Route
          path="/recuperar-contrasena"
          element={<RecuperarContrasena />}
        />

        <Route
          path="/nueva-contrasena"
          element={<NuevaContrasena />}
        />
      </Routes>

      <footer className="border-t border-[#e8ddcd] px-5 py-8 text-center text-sm text-stone-500">
        Marinera Match · Unidos por la marinera peruana
      </footer>
    </div>
  );
}

export default App;
