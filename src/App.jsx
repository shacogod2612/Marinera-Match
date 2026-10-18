
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Matches from "./pages/Matches";
import Profile from "./pages/Profile";

function App() {
  return (
    <div className="min-h-screen bg-[#f7f0e5]">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/descubrir" element={<Discover />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/perfil" element={<Profile />} />
      </Routes>

      <footer className="border-t border-[#e8ddcd] px-5 py-8 text-center text-sm text-stone-500">
        Marinera Match · Unidos por la marinera peruana
      </footer>
    </div>
  );
}

export default App;
