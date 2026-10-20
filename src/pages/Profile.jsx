
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Save,
  UserRound,
  LoaderCircle,
  Pencil,
  X,
  MapPin,
  Camera,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const perfilInicial = {
  nombre: "",
  edad: "",
  sexo: "",
  ciudad: "",
  nivel: "",
  objetivo: "",
  academia: "",
  descripcion: "",
};

const clasesInput =
  "mt-2 w-full rounded-xl border border-[#e4d3bd] bg-white px-4 py-3 text-sm text-[#242321] outline-none transition focus:border-[#581f2b] focus:ring-2 focus:ring-[#581f2b]/10";

const camposPerfil = [
  { clave: "edad", etiqueta: "Edad" },
  { clave: "sexo", etiqueta: "Sexo" },
  { clave: "nivel", etiqueta: "Nivel de marinera" },
  { clave: "objetivo", etiqueta: "Qué busca" },
  { clave: "academia", etiqueta: "Academia" },
];

const extensionesImagen = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function Profile() {
  const [perfil, setPerfil] = useState(perfilInicial);
  const [perfilGuardado, setPerfilGuardado] = useState(perfilInicial);

  const [fotoUrl, setFotoUrl] = useState("");
  const [fotoArchivo, setFotoArchivo] = useState(null);
  const [fotoPreview, setFotoPreview] = useState("");

  const [existePerfil, setExistePerfil] = useState(false);
  const [editando, setEditando] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("error");
  const [errorFoto, setErrorFoto] = useState("");

  // Genera una vista previa y libera la URL temporal al cambiar la imagen.
  useEffect(() => {
    if (!fotoArchivo) {
      setFotoPreview("");
      return;
    }

    const urlTemporal = URL.createObjectURL(fotoArchivo);
    setFotoPreview(urlTemporal);

    return () => URL.revokeObjectURL(urlTemporal);
  }, [fotoArchivo]);

  // Carga el usuario y su perfil guardado.
  useEffect(() => {
    let cancelado = false;

    async function cargarPerfil() {
      setCargando(true);

      try {
        const {
          data: { user },
          error: errorUsuario,
        } = await supabase.auth.getUser();

        if (cancelado) return;

        if (errorUsuario || !user) {
          setUsuarioId(null);
          setMensaje("Inicia sesión para gestionar tu perfil.");
          setTipoMensaje("error");
          setCargando(false);
          return;
        }

        setUsuarioId(user.id);

        const { data, error } = await supabase
          .from("profiles")
          .select(
            "nombre, edad, sexo, ciudad, nivel, objetivo, academia, descripcion, foto_url"
          )
          .eq("id", user.id)
          .maybeSingle();

        if (cancelado) return;

        if (error) {
          setMensaje(`No se pudo cargar tu perfil: ${error.message}`);
          setTipoMensaje("error");
        } else if (data) {
          const perfilCargado = {
            nombre: data.nombre ?? "",
            edad: data.edad == null ? "" : String(data.edad),
            sexo: data.sexo ?? "",
            ciudad: data.ciudad ?? "",
            nivel: data.nivel ?? "",
            objetivo: data.objetivo ?? "",
            academia: data.academia ?? "",
            descripcion: data.descripcion ?? "",
          };

          setPerfil(perfilCargado);
          setPerfilGuardado(perfilCargado);
          setFotoUrl(data.foto_url ?? "");
          setExistePerfil(true);
          setEditando(false);
          setMensaje("");
        } else {
          setExistePerfil(false);
          setEditando(true);
          setMensaje(
            "Tu perfil todavía no existe. Completa tus datos y guárdalos."
          );
          setTipoMensaje("error");
        }
      } catch {
        if (!cancelado) {
          setMensaje("No se pudo conectar para cargar tu perfil.");
          setTipoMensaje("error");
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargarPerfil();

    return () => {
      cancelado = true;
    };
  }, []);

  function actualizarCampo(e) {
    const { name, value } = e.target;

    setPerfil((actual) => ({
      ...actual,
      [name]: value,
    }));
  }

  function seleccionarFoto(e) {
    const archivo = e.target.files?.[0];

    // Permite seleccionar otra vez el mismo archivo.
    e.target.value = "";

    if (!archivo) return;

    setErrorFoto("");

    if (!Object.hasOwn(extensionesImagen, archivo.type)) {
      setErrorFoto("Elige una imagen JPG, PNG o WebP.");
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      setErrorFoto("La foto no puede superar los 5 MB.");
      return;
    }

    setFotoArchivo(archivo);
  }

  function comenzarEdicion() {
    setPerfil({ ...perfilGuardado });
    setFotoArchivo(null);
    setErrorFoto("");
    setMensaje("");
    setEditando(true);
  }

  function cancelarEdicion() {
    setPerfil({ ...perfilGuardado });
    setFotoArchivo(null);
    setErrorFoto("");
    setMensaje("");
    setEditando(false);
  }

  // Sube la imagen y devuelve su URL pública.
  async function subirFotoPerfil() {
    if (!fotoArchivo) return fotoUrl;

    const extension = extensionesImagen[fotoArchivo.type];
    const ruta = `${usuarioId}/${crypto.randomUUID()}.${extension}`;

    const { error: errorSubida } = await supabase.storage
      .from("fotos-perfil")
      .upload(ruta, fotoArchivo, {
        upsert: false,
        contentType: fotoArchivo.type,
      });

    if (errorSubida) {
      throw new Error(`No se pudo subir la foto: ${errorSubida.message}`);
    }

    const { data } = supabase.storage
      .from("fotos-perfil")
      .getPublicUrl(ruta);

    return data.publicUrl;
  }

  async function guardarPerfil(e) {
    e.preventDefault();
    setMensaje("");
    setErrorFoto("");

    if (!usuarioId) {
      setMensaje("Inicia sesión antes de guardar tu perfil.");
      setTipoMensaje("error");
      return;
    }

    if (!perfil.nombre.trim()) {
      setMensaje("El nombre es obligatorio.");
      setTipoMensaje("error");
      return;
    }

    if (
      perfil.edad !== "" &&
      (!Number.isInteger(Number(perfil.edad)) ||
        Number(perfil.edad) < 18 ||
        Number(perfil.edad) > 120)
    ) {
      setMensaje("La edad debe ser un número entre 18 y 120.");
      setTipoMensaje("error");
      return;
    }

    setGuardando(true);

    try {
      // Si no se eligió otra foto, conserva la URL anterior.
      const nuevaFotoUrl = await subirFotoPerfil();

      const datosPerfil = {
        id: usuarioId,
        nombre: perfil.nombre.trim(),
        edad: perfil.edad === "" ? null : Number(perfil.edad),
        sexo: perfil.sexo || null,
        ciudad: perfil.ciudad.trim() || null,
        nivel: perfil.nivel || null,
        objetivo: perfil.objetivo || null,
        academia: perfil.academia.trim() || null,
        descripcion: perfil.descripcion.trim() || null,
        foto_url: nuevaFotoUrl || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(datosPerfil, { onConflict: "id" });

      if (error) {
        throw new Error(`No se pudo guardar el perfil: ${error.message}`);
      }

      const perfilActualizado = {
        ...perfil,
        nombre: datosPerfil.nombre,
        edad: datosPerfil.edad == null ? "" : String(datosPerfil.edad),
        sexo: datosPerfil.sexo ?? "",
        ciudad: datosPerfil.ciudad ?? "",
        nivel: datosPerfil.nivel ?? "",
        objetivo: datosPerfil.objetivo ?? "",
        academia: datosPerfil.academia ?? "",
        descripcion: datosPerfil.descripcion ?? "",
      };

      setPerfil(perfilActualizado);
      setPerfilGuardado(perfilActualizado);
      setFotoUrl(nuevaFotoUrl || "");
      setFotoArchivo(null);
      setExistePerfil(true);
      setEditando(false);
      setMensaje("¡Tu perfil se guardó correctamente!");
      setTipoMensaje("exito");
    } catch (error) {
      setMensaje(error.message || "Ocurrió un error al guardar el perfil.");
      setTipoMensaje("error");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#f7f0e5]">
        <p className="flex items-center gap-2 text-[#581f2b]">
          <LoaderCircle size={20} className="animate-spin" />
          Cargando tu perfil...
        </p>
      </main>
    );
  }

  if (!usuarioId) {
    return (
      <main className="min-h-[60vh] bg-[#f7f0e5] px-4 py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-[#e8ddcd] bg-[#fffaf2] p-8 text-center">
          <UserRound size={42} className="mx-auto text-[#b18432]" />

          <h1 className="mt-4 font-serif text-3xl font-bold text-[#581f2b]">
            Mi perfil
          </h1>

          <p className="mt-3 text-stone-600">
            Necesitas iniciar sesión para crear y editar tu perfil de bailarín.
          </p>

          <Link
            to="/acceso"
            className="mt-6 inline-flex rounded-full bg-[#581f2b] px-6 py-3 font-semibold text-white transition hover:bg-[#71303d]"
          >
            Iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  const fotoVisible = fotoPreview || fotoUrl;

  return (
    <main className="min-h-[75vh] bg-[#f7f0e5] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <span className="text-xs font-bold tracking-[0.2em] text-[#b18432]">
            TU ESPACIO PERSONAL
          </span>

          <h1 className="mt-3 font-serif text-4xl font-bold text-[#581f2b]">
            Mi perfil
          </h1>

          <p className="mt-3 leading-7 text-stone-600">
            Cuéntales a otros bailarines quién eres, qué nivel tienes
            y qué buscas en una pareja de marinera.
          </p>
        </header>

        {mensaje && (
          <p
            role="status"
            aria-live="polite"
            className={`mb-5 rounded-xl p-3 text-sm ${
              tipoMensaje === "exito"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {mensaje}
          </p>
        )}

        {existePerfil && !editando ? (
          <section className="overflow-hidden rounded-2xl border border-[#e8ddcd] bg-[#fffaf2] shadow-sm">
            <div className="bg-[#581f2b] p-6 text-white sm:p-8">
              <div className="flex items-center gap-4">
                <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#d6a64f] bg-white/10 text-[#d6a64f]">
                  {fotoUrl ? (
                    <img
                      src={fotoUrl}
                      alt={`Foto de ${perfil.nombre}`}
                      className="size-full object-cover"
                    />
                  ) : (
                    <UserRound size={44} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="wrap-break-words font-serif text-2xl font-bold">
                    {perfil.nombre}
                  </h2>

                  <p className="mt-2 flex items-center gap-2 text-sm text-white/80">
                    <MapPin size={16} />
                    {perfil.ciudad || "Ciudad no especificada"}
                  </p>

                  {perfil.nivel && (
                    <span className="mt-3 inline-block rounded-full bg-[#d6a64f]/20 px-3 py-1 text-sm text-[#f3d99c]">
                      {perfil.nivel}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <h3 className="font-serif text-xl font-bold text-[#581f2b]">
                Información del bailarín
              </h3>

              <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                {camposPerfil.map(({ clave, etiqueta }) => (
                  <div key={clave}>
                    <dt className="text-sm text-stone-500">{etiqueta}</dt>
                    <dd className="mt-1 -wrap-break-words font-medium text-stone-800">
                      {perfil[clave] || "No especificado"}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 border-t border-[#e8ddcd] pt-5">
                <h3 className="font-semibold text-[#581f2b]">Sobre mí</h3>
                <p className="mt-2 whitespace-pre-wrap leading-7 text-stone-600">
                  {perfil.descripcion ||
                    "Todavía no has añadido una descripción."}
                </p>
              </div>

              <button
                type="button"
                onClick={comenzarEdicion}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#581f2b] px-6 py-3 font-semibold text-white transition hover:bg-[#71303d] sm:w-auto"
              >
                <Pencil size={18} />
                Editar perfil
              </button>
            </div>
          </section>
        ) : (
          <form
            onSubmit={guardarPerfil}
            className="rounded-2xl border border-[#e8ddcd] bg-[#fffaf2] p-5 shadow-sm sm:p-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-xl bg-[#581f2b] text-[#d6a64f]">
                <UserRound size={25} />
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold text-[#581f2b]">
                  {existePerfil ? "Editar mi perfil" : "Información del bailarín"}
                </h2>
                <p className="text-sm text-stone-500">
                  Completa tus datos personales y de baile.
                </p>
              </div>
            </div>

            {/* Foto de perfil */}
            <div className="mb-8 flex flex-col items-center">
              <div className="grid size-32 place-items-center overflow-hidden rounded-full border-4 border-[#e8ddcd] bg-[#f7f0e5] text-[#b18432]">
                {fotoVisible ? (
                  <img
                    src={fotoVisible}
                    alt="Vista previa de tu foto de perfil"
                    className="size-full object-cover"
                  />
                ) : (
                  <UserRound size={58} />
                )}
              </div>

              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#e4d3bd] bg-white px-5 py-2.5 font-semibold text-[#581f2b] transition hover:bg-[#f7f0e5]">
                <Camera size={18} />
                {fotoArchivo ? "Cambiar selección" : "Elegir foto"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={seleccionarFoto}
                  disabled={guardando}
                  className="sr-only"
                />
              </label>

              <p className="mt-2 text-xs text-stone-500">
                JPG, PNG o WebP · Máximo 5 MB
              </p>

              {fotoArchivo && (
                <button
                  type="button"
                  onClick={() => setFotoArchivo(null)}
                  disabled={guardando}
                  className="mt-2 text-sm text-[#581f2b] underline"
                >
                  Descartar nueva foto
                </button>
              )}

              {errorFoto && (
                <p role="alert" className="mt-2 text-sm text-red-700">
                  {errorFoto}
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-stone-700">
                Nombre *
                <input
                  name="nombre"
                  value={perfil.nombre}
                  onChange={actualizarCampo}
                  required
                  maxLength={80}
                  autoComplete="name"
                  className={clasesInput}
                  placeholder="Tu nombre"
                />
              </label>

              <label className="block text-sm font-medium text-stone-700">
                Edad
                <input
                  name="edad"
                  type="number"
                  min="18"
                  max="120"
                  step="1"
                  value={perfil.edad}
                  onChange={actualizarCampo}
                  className={clasesInput}
                  placeholder="Tu edad"
                />
              </label>

              <label className="block text-sm font-medium text-stone-700">
                Sexo
                <select
                  name="sexo"
                  value={perfil.sexo}
                  onChange={actualizarCampo}
                  className={clasesInput}
                >
                  <option value="">Seleccionar</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-stone-700">
                Ciudad
                <input
                  name="ciudad"
                  value={perfil.ciudad}
                  onChange={actualizarCampo}
                  maxLength={100}
                  className={clasesInput}
                  placeholder="Ej. Lima"
                />
              </label>

              <label className="block text-sm font-medium text-stone-700">
                Nivel de marinera
                <select
                  name="nivel"
                  value={perfil.nivel}
                  onChange={actualizarCampo}
                  className={clasesInput}
                >
                  <option value="">Seleccionar</option>
                  <option value="Principiante">Principiante</option>
                  <option value="Medio">Medio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-stone-700">
                ¿Qué buscas?
                <select
                  name="objetivo"
                  value={perfil.objetivo}
                  onChange={actualizarCampo}
                  className={clasesInput}
                >
                  <option value="">Seleccionar</option>
                  <option value="Práctica">Práctica</option>
                  <option value="Concursos">Concursos</option>
                  <option value="Ambos">Ambos</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-stone-700 sm:col-span-2">
                Academia
                <input
                  name="academia"
                  value={perfil.academia}
                  onChange={actualizarCampo}
                  maxLength={120}
                  className={clasesInput}
                  placeholder="Nombre de tu academia (opcional)"
                />
              </label>

              <label className="block text-sm font-medium text-stone-700 sm:col-span-2">
                Sobre mí
                <textarea
                  name="descripcion"
                  value={perfil.descripcion}
                  onChange={actualizarCampo}
                  rows={4}
                  maxLength={500}
                  className={clasesInput}
                  placeholder="Cuéntales a otros bailarines sobre ti y tus objetivos..."
                />
                <span className="mt-1 block text-right text-xs text-stone-500">
                  {perfil.descripcion.length}/500
                </span>
              </label>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {existePerfil && (
                <button
                  type="button"
                  onClick={cancelarEdicion}
                  disabled={guardando}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#e4d3bd] px-6 py-3 font-semibold text-[#581f2b] transition hover:bg-[#f7f0e5] disabled:opacity-60"
                >
                  <X size={18} />
                  Cancelar
                </button>
              )}

              <button
                type="submit"
                disabled={guardando}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#581f2b] px-6 py-3 font-semibold text-white transition hover:bg-[#71303d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {guardando ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {guardando
                  ? "Guardando..."
                  : existePerfil
                    ? "Guardar cambios"
                    : "Guardar perfil"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

export default Profile;
