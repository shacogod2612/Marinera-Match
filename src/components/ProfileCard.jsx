
import { MapPin } from "lucide-react";

function ProfileCard({ bailarín }) {
  return (
    <article className="profile-card">
      <div className="profile-photo">
        <img
          src={bailarín.imagen}
          alt={`Perfil de ${bailarín.nombre}`}
        />
      </div>

      <div className="profile-info">
        <h2>
          {bailarín.nombre}, {bailarín.edad}
        </h2>

        <div className="profile-tags">
          <span>{bailarín.nivel}</span>
          <span>{bailarín.objetivo}</span>
        </div>

        <p className="profile-location">
          <MapPin size={16} />
          {bailarín.ciudad}, Perú
        </p>

        <p className="profile-description">
          {bailarín.descripcion}
        </p>
      </div>
    </article>
  );
}

export default ProfileCard;
