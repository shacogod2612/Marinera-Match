
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
  Star,
  Trash2,
  Images,
  CalendarDays,
  VenusAndMars,
  Trophy,
  Target,
  Building2,
  FileText,
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
  { clave: "edad", etiqueta: "Edad", Icono: CalendarDays },
  { clave: "sexo", etiqueta: "Sexo", Icono: VenusAndMars },
  { clave: "nivel", etiqueta: "Nivel de marinera", Icono: Trophy },
  { clave: "objetivo", etiqueta: "Qué busca", Icono: Target },
  { clave: "academia", etiqueta: "Academia", Icono: Building2 },
];

const extensionesImagen = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_FOTOS = 6;
const MAX_TAMANO = 5 * 1024 * 1024;

function Profile({ onFotoPerfilChange }) {
  const [perfil, setPerfil] = useState(perfilInicial);
  const [perfilGuardado, setPerfilGuardado] = useState(perfilInicial);

  const [fotoUrl, setFotoUrl] = useState("");
  const [fotos, setFotos] = useState([]);
  const [archivosSeleccionados, setArchivosSeleccionados] = useState([]);

  const [existePerfil, setExistePerfil] = useState(false);
  const [editando, setEditando] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [cargandoFotos, setCargandoFotos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFotos, setSubiendoFotos] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("error");
  const [errorGaleria, setErrorGaleria] = useState("");
  const [distritosPeru, setDistritosPeru] = useState([]);
  const [cargandoDistritos, setCargandoDistritos] = useState(true);
  const [errorDistritos, setErrorDistritos] = useState("");

  // Carga los ubigeos y arma sugerencias con distrito, provincia y departamento.
  useEffect(() => {
    const urls = {
      departamentos:
        "https://raw.githubusercontent.com/RitchieRD/ubigeos-peru-data/main/json/1_ubigeo_departamentos.json",
      provincias:
        "https://raw.githubusercontent.com/RitchieRD/ubigeos-peru-data/main/json/2_ubigeo_provincias.json",
      distritos:
        "https://raw.githubusercontent.com/RitchieRD/ubigeos-peru-data/main/json/3_ubigeo_distritos.json",
    };

    async function cargarDistritosPeru() {
      try {
        const respuestas = await Promise.all(
          Object.values(urls).map((url) => fetch(url))
        );
        if (respuestas.some((respuesta) => !respuesta.ok)) {
          throw new Error("No se pudo descargar la lista de ubicaciones.");
        }

        const [departamentosJson, provinciasJson, distritosJson] =
          await Promise.all(respuestas.map((respuesta) => respuesta.json()));

        const departamentosPorId = new Map(
          departamentosJson.ubigeo_departamentos.map((item) => [item.id, item])
        );
        const provinciasPorId = new Map(
          provinciasJson.ubigeo_provincias.map((item) => [item.id, item])
        );

        const opciones = distritosJson.ubigeo_distritos
          .map((distrito) => {
            const provincia = provinciasPorId.get(distrito.provincia_id);
            const departamento = provincia
              ? departamentosPorId.get(provincia.departamento_id)
              : null;

            if (!provincia || !departamento) return null;

            return {
              ubigeo: distrito.ubigeo,
              nombre: `${distrito.distrito}, ${provincia.provincia}, ${departamento.departamento}`,
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

        setDistritosPeru(opciones);
      } catch (error) {
        setErrorDistritos(
          error.message || "No se pudo cargar la lista de distritos."
        );
      } finally {
        setCargandoDistritos(false);
      }
    }

    cargarDistritosPeru();
  }, []);

  // Carga las fotos guardadas en la galería del usuario.
  async function cargarGaleria(idUsuario, fotoPrincipalActual = "") {
    setCargandoFotos(true);
    setErrorGaleria("");

    try {
      const { data, error } = await supabase
        .from("profile_photos")
        .select("id, user_id, foto_url, storage_path, es_principal, created_at")
        .eq("user_id", idUsuario)
        .order("created_at", { ascending: true });

      if (error) throw error;

      let galeria = data ?? [];

      // Compatibilidad con perfiles que todavía tengan una foto
      // guardada en profiles.foto_url pero no en la tabla de galería.
      if (galeria.length === 0 && fotoPrincipalActual) {
        galeria = [
          {
            id: null,
            user_id: idUsuario,
            foto_url: fotoPrincipalActual,
            storage_path: null,
            es_principal: true,
            legado: true,
          },
        ];
      }

      setFotos(galeria);

      const principal = galeria.find((foto) => foto.es_principal);
      if (principal) {
        setFotoUrl(principal.foto_url);
      } else if (galeria.length > 0) {
        setFotoUrl(galeria[0].foto_url);
      } else {
        setFotoUrl("");
      }
    } catch (error) {
      setErrorGaleria(
        `No se pudo cargar la galería: ${error.message}`
      );
    } finally {
      setCargandoFotos(false);
    }
  }

  // Carga el usuario y su perfil.
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
          return;
        }

        if (data) {
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
          onFotoPerfilChange(data.foto_url ?? null);
          setExistePerfil(true);
          setEditando(false);
          setMensaje("");

          await cargarGaleria(user.id, data.foto_url ?? "");
        } else {
          setExistePerfil(false);
          setEditando(true);
          setMensaje(
            "Tu perfil todavía no existe. Completa tus datos y guárdalos."
          );
          setTipoMensaje("error");
          setFotos([]);
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

  function seleccionarFotos(e) {
    const archivos = Array.from(e.target.files ?? []);
    e.target.value = "";

    if (archivos.length === 0) return;

    setErrorGaleria("");
    setArchivosSeleccionados([]);

    const disponibles = MAX_FOTOS - fotos.length;

    if (disponibles <= 0) {
      setErrorGaleria(`Puedes tener un máximo de ${MAX_FOTOS} fotos.`);
      return;
    }

    if (archivos.length > disponibles) {
      setErrorGaleria(
        `Solo puedes añadir ${disponibles} foto(s) más. El máximo es ${MAX_FOTOS}.`
      );
      return;
    }

    for (const archivo of archivos) {
      if (!Object.hasOwn(extensionesImagen, archivo.type)) {
        setErrorGaleria(
          "Todas las imágenes deben ser JPG, PNG o WebP."
        );
        return;
      }

      if (archivo.size > MAX_TAMANO) {
        setErrorGaleria(
          `La imagen "${archivo.name}" supera los 5 MB.`
        );
        return;
      }
    }

    setArchivosSeleccionados(archivos);
  }

  function comenzarEdicion() {
    setPerfil({ ...perfilGuardado });
    setArchivosSeleccionados([]);
    setMensaje("");
    setEditando(true);
  }

  function cancelarEdicion() {
    setPerfil({ ...perfilGuardado });
    setArchivosSeleccionados([]);
    setMensaje("");
    setEditando(false);
  }

  async function guardarPerfil(e) {
    e.preventDefault();
    setMensaje("");

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
        foto_url: fotoUrl || null,
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
      setExistePerfil(true);
      setEditando(false);
      onFotoPerfilChange(fotoUrl || null);
      setMensaje("¡Tu perfil se guardó correctamente!");
      setTipoMensaje("exito");
    } catch (error) {
      setMensaje(error.message || "Ocurrió un error al guardar el perfil.");
      setTipoMensaje("error");
    } finally {
      setGuardando(false);
    }
  }

  // Sube las fotos seleccionadas a Storage y registra sus URL en la tabla.
  async function subirFotos() {
    if (!usuarioId || archivosSeleccionados.length === 0) return;

    setSubiendoFotos(true);
    setErrorGaleria("");

    const archivosSubidos = [];
    let nuevaGaleria = [...fotos];

    try {
      const { data: filas, error: errorConsulta } = await supabase
        .from("profile_photos")
        .select("id")
        .eq("user_id", usuarioId);

      if (errorConsulta) throw errorConsulta;

      const cantidadActual = filas?.length ?? 0;

      if (cantidadActual + archivosSeleccionados.length > MAX_FOTOS) {
        throw new Error(`Puedes tener un máximo de ${MAX_FOTOS} fotos.`);
      }

      let necesitaPrincipal =
        !nuevaGaleria.some((foto) => foto.es_principal);

      for (const archivo of archivosSeleccionados) {
        const extension = extensionesImagen[archivo.type];
        const ruta = `${usuarioId}/${crypto.randomUUID()}.${extension}`;

        const { error: errorSubida } = await supabase.storage
          .from("fotos-perfil")
          .upload(ruta, archivo, {
            upsert: false,
            contentType: archivo.type,
          });

        if (errorSubida) {
          throw new Error(
            `No se pudo subir "${archivo.name}": ${errorSubida.message}`
          );
        }

        const { data: urlData } = supabase.storage
          .from("fotos-perfil")
          .getPublicUrl(ruta);

        const esPrincipal = necesitaPrincipal;
        if (esPrincipal) necesitaPrincipal = false;

        const { data: fotoInsertada, error: errorInsercion } =
          await supabase
            .from("profile_photos")
            .insert({
              user_id: usuarioId,
              foto_url: urlData.publicUrl,
              storage_path: ruta,
              es_principal: esPrincipal,
            })
            .select()
            .single();

        if (errorInsercion) {
          // Si falla el registro, intenta limpiar el archivo recién subido.
          await supabase.storage.from("fotos-perfil").remove([ruta]);
          throw new Error(
            `No se pudo registrar la foto: ${errorInsercion.message}`
          );
        }

        archivosSubidos.push(ruta);
        nuevaGaleria.push(fotoInsertada);

        if (esPrincipal) {
          const { error: errorPerfil } = await supabase
            .from("profiles")
            .update({ foto_url: urlData.publicUrl })
            .eq("id", usuarioId);

          if (errorPerfil) {
            throw new Error(
              `La foto se subió, pero no se pudo actualizar la principal: ${errorPerfil.message}`
            );
          }

          setFotoUrl(urlData.publicUrl);
          onFotoPerfilChange(urlData.publicUrl);
        }
      }

      setArchivosSeleccionados([]);
      await cargarGaleria(usuarioId, fotoUrl);
      setMensaje(
        `${archivosSubidos.length} foto(s) añadida(s) correctamente.`
      );
      setTipoMensaje("exito");
    } catch (error) {
      setErrorGaleria(error.message || "No se pudieron subir las fotos.");
      await cargarGaleria(usuarioId, fotoUrl);
    } finally {
      setSubiendoFotos(false);
    }
  }

  // Cambia la foto principal y sincroniza profiles.foto_url.
  async function elegirPrincipal(foto) {
    if (!foto?.id || foto.es_principal || !usuarioId) return;

    setErrorGaleria("");
    setMensaje("");

    const principalAnterior = fotos.find((item) => item.es_principal);

    try {
      // El índice único permite una sola foto principal por usuario.
      const { error: errorDesmarcar } = await supabase
        .from("profile_photos")
        .update({ es_principal: false })
        .eq("user_id", usuarioId)
        .eq("es_principal", true);

      if (errorDesmarcar) throw errorDesmarcar;

      const { error: errorMarcar } = await supabase
        .from("profile_photos")
        .update({ es_principal: true })
        .eq("id", foto.id)
        .eq("user_id", usuarioId);

      if (errorMarcar) {
        if (principalAnterior?.id) {
          await supabase
            .from("profile_photos")
            .update({ es_principal: true })
            .eq("id", principalAnterior.id)
            .eq("user_id", usuarioId);
        }
        throw errorMarcar;
      }

      const { error: errorPerfil } = await supabase
        .from("profiles")
        .update({ foto_url: foto.foto_url })
        .eq("id", usuarioId);

      if (errorPerfil) throw errorPerfil;

      setFotoUrl(foto.foto_url);
      onFotoPerfilChange(foto.foto_url);
      await cargarGaleria(usuarioId, foto.foto_url);
      setMensaje("¡Foto principal actualizada!");
      setTipoMensaje("exito");
    } catch (error) {
      setErrorGaleria(
        `No se pudo cambiar la foto principal: ${error.message}`
      );
      await cargarGaleria(usuarioId, fotoUrl);
    }
  }

  // Elimina el registro y después intenta borrar el archivo de Storage.
  async function eliminarFoto(foto) {
    if (!foto?.id || !usuarioId) return;

    const confirmacion = window.confirm(
      foto.es_principal
        ? "Vas a eliminar tu foto principal. ¿Deseas continuar?"
        : "¿Deseas eliminar esta foto de tu galería?"
    );

    if (!confirmacion) return;

    setErrorGaleria("");
    setMensaje("");

    try {
      const eraPrincipal = foto.es_principal;

      const { error: errorBorrado } = await supabase
        .from("profile_photos")
        .delete()
        .eq("id", foto.id)
        .eq("user_id", usuarioId);

      if (errorBorrado) throw errorBorrado;

      let galeriaRestante = fotos.filter((item) => item.id !== foto.id);

      if (foto.storage_path) {
        const { error: errorStorage } = await supabase.storage
          .from("fotos-perfil")
          .remove([foto.storage_path]);

        if (errorStorage) {
          setErrorGaleria(
            `La foto se quitó de la galería, pero el archivo no se pudo borrar de Storage: ${errorStorage.message}`
          );
        }
      }

      if (eraPrincipal) {
        const siguiente = galeriaRestante[0];

        if (siguiente?.id) {
          const { error: errorPrincipal } = await supabase
            .from("profile_photos")
            .update({ es_principal: true })
            .eq("id", siguiente.id)
            .eq("user_id", usuarioId);

          if (errorPrincipal) throw errorPrincipal;

          const { error: errorPerfil } = await supabase
            .from("profiles")
            .update({ foto_url: siguiente.foto_url })
            .eq("id", usuarioId);

          if (errorPerfil) throw errorPerfil;

          galeriaRestante = galeriaRestante.map((item) => ({
            ...item,
            es_principal: item.id === siguiente.id,
          }));

          setFotoUrl(siguiente.foto_url);
          onFotoPerfilChange(siguiente.foto_url);
        } else {
          const { error: errorPerfil } = await supabase
            .from("profiles")
            .update({ foto_url: null })
            .eq("id", usuarioId);

          if (errorPerfil) throw errorPerfil;

          setFotoUrl("");
          onFotoPerfilChange(null);
        }
      }

      setFotos(galeriaRestante);

      if (!errorGaleria) {
        setMensaje("Foto eliminada de tu galería.");
        setTipoMensaje("exito");
      }
    } catch (error) {
      setErrorGaleria(
        `No se pudo eliminar la foto: ${error.message}`
      );
      await cargarGaleria(usuarioId, fotoUrl);
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
                {camposPerfil.map(({ clave, etiqueta, Icono }) => (
                  <div key={clave}>
                    <dt className="flex items-center gap-2 text-sm text-stone-500">
                      <Icono size={16} className="text-[#b18432]" aria-hidden="true" />
                      {etiqueta}
                    </dt>
                    <dd className="mt-1 font-medium text-stone-800">
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
                Editar perfil y galería
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
                  Completa tus datos y administra tus fotos.
                </p>
              </div>
            </div>

            {/* Galería de fotos */}
            <section className="mb-8 rounded-2xl border border-[#e8ddcd] bg-white p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <Images size={21} className="text-[#b18432]" />
                <h3 className="font-serif text-xl font-bold text-[#581f2b]">
                  Mi galería
                </h3>
              </div>

              <p className="mt-2 text-sm leading-6 text-stone-600">
                Añade hasta {MAX_FOTOS} fotos. La foto principal será la que
                aparezca en tu tarjeta de Descubrir.
              </p>

              {cargandoFotos ? (
                <p className="mt-4 flex items-center gap-2 text-sm text-stone-500">
                  <LoaderCircle size={18} className="animate-spin" />
                  Cargando fotos...
                </p>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {fotos.map((foto) => (
                    <article
                      key={foto.id ?? foto.foto_url}
                      className="overflow-hidden rounded-xl border border-[#e8ddcd] bg-[#fffaf2]"
                    >
                      <div className="relative aspect-3/4 bg-[#f7f0e5]">
                        <img
                          src={foto.foto_url}
                          alt={
                            foto.es_principal
                              ? "Foto principal de tu perfil"
                              : "Foto de tu galería"
                          }
                          className="size-full object-cover"
                        />

                        {foto.es_principal && (
                          <span className="absolute left-2 top-2 rounded-full bg-[#581f2b] px-2 py-1 text-xs font-semibold text-white">
                            Principal
                          </span>
                        )}
                      </div>

                      <div className="grid gap-2 p-2">
                        {!foto.es_principal && foto.id && (
                          <button
                            type="button"
                            onClick={() => elegirPrincipal(foto)}
                            disabled={subiendoFotos || guardando}
                            className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#e4d3bd] px-2 py-2 text-xs font-semibold text-[#581f2b] hover:bg-[#f7f0e5] disabled:opacity-50"
                          >
                            <Star size={14} />
                            Hacer principal
                          </button>
                        )}

                        {foto.id && (
                          <button
                            type="button"
                            onClick={() => eliminarFoto(foto)}
                            disabled={subiendoFotos || guardando}
                            className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 px-2 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                            Eliminar
                          </button>
                        )}
                      </div>
                    </article>
                  ))}

                  {fotos.length === 0 && (
                    <div className="col-span-full rounded-xl border border-dashed border-[#e4d3bd] px-4 py-8 text-center">
                      <Camera size={32} className="mx-auto text-[#b18432]" />
                      <p className="mt-2 text-sm text-stone-600">
                        Todavía no tienes fotos. ¡Añade la primera!
                      </p>
                    </div>
                  )}
                </div>
              )}

              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#e4d3bd] bg-[#fffaf2] px-5 py-3 font-semibold text-[#581f2b] transition hover:bg-[#f7f0e5]">
                <Camera size={18} />
                Seleccionar fotos

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={seleccionarFotos}
                  disabled={
                    subiendoFotos ||
                    guardando ||
                    fotos.length >= MAX_FOTOS
                  }
                  className="sr-only"
                />
              </label>

              <p className="mt-2 text-xs text-stone-500">
                JPG, PNG o WebP · Máximo 5 MB por foto ·
                {` ${fotos.length}/${MAX_FOTOS} fotos`}
              </p>

              {archivosSeleccionados.length > 0 && (
                <div className="mt-3 rounded-xl bg-[#f7f0e5] p-3">
                  <p className="text-sm font-semibold text-[#581f2b]">
                    {archivosSeleccionados.length} foto(s) seleccionada(s)
                  </p>

                  <ul className="mt-2 space-y-1 text-sm text-stone-600">
                    {archivosSeleccionados.map((archivo) => (
                      <li key={`${archivo.name}-${archivo.size}`}>
                        {archivo.name}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={subirFotos}
                      disabled={subiendoFotos}
                      className="inline-flex items-center gap-2 rounded-full bg-[#581f2b] px-4 py-2 font-semibold text-white disabled:opacity-50"
                    >
                      {subiendoFotos ? (
                        <LoaderCircle size={17} className="animate-spin" />
                      ) : (
                        <Camera size={17} />
                      )}
                      {subiendoFotos ? "Subiendo..." : "Subir a mi galería"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setArchivosSeleccionados([])}
                      disabled={subiendoFotos}
                      className="inline-flex items-center gap-2 rounded-full border border-[#e4d3bd] px-4 py-2 font-semibold text-[#581f2b] disabled:opacity-50"
                    >
                      <X size={17} />
                      Cancelar selección
                    </button>
                  </div>
                </div>
              )}

              {errorGaleria && (
                <p role="alert" className="mt-3 text-sm text-red-700">
                  {errorGaleria}
                </p>
              )}
            </section>

            {/* Datos personales */}
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-stone-700">
                <span className="inline-flex items-center gap-2">
                  <UserRound size={16} className="text-[#b18432]" aria-hidden="true" />
                  Nombre *
                </span>
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
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={16} className="text-[#b18432]" aria-hidden="true" />
                  Edad
                </span>
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
                <span className="inline-flex items-center gap-2">
                  <VenusAndMars size={16} className="text-[#b18432]" aria-hidden="true" />
                  Sexo
                </span>
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
                <span className="inline-flex items-center gap-2">
                  <MapPin size={16} className="text-[#b18432]" aria-hidden="true" />
                  Distrito / ciudad
                </span>
                <input
                  name="ciudad"
                  list="distritos-peru"
                  value={perfil.ciudad}
                  onChange={actualizarCampo}
                  maxLength={200}
                  className={clasesInput}
                  placeholder={
                    cargandoDistritos
                      ? "Cargando distritos del Perú..."
                      : "Escribe para buscar tu distrito"
                  }
                  autoComplete="address-level3"
                />
                <datalist id="distritos-peru">
                  {distritosPeru.map((distrito) => (
                    <option key={distrito.ubigeo} value={distrito.nombre} />
                  ))}
                </datalist>
                <span className="mt-1 block text-xs text-stone-500">
                  Busca por nombre. Se mostrará el distrito, la provincia y el departamento.
                </span>
                {errorDistritos && (
                  <span role="status" className="mt-1 block text-xs text-amber-700">
                    No se pudo cargar la lista automática. Puedes escribir tu ciudad manualmente.
                  </span>
                )}
              </label>

              <label className="block text-sm font-medium text-stone-700">
                <span className="inline-flex items-center gap-2">
                  <Trophy size={16} className="text-[#b18432]" aria-hidden="true" />
                  Nivel de marinera
                </span>
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
                <span className="inline-flex items-center gap-2">
                  <Target size={16} className="text-[#b18432]" aria-hidden="true" />
                  ¿Qué buscas?
                </span>
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
                <span className="inline-flex items-center gap-2">
                  <Building2 size={16} className="text-[#b18432]" aria-hidden="true" />
                  Academia
                </span>
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
                <span className="inline-flex items-center gap-2">
                  <FileText size={16} className="text-[#b18432]" aria-hidden="true" />
                  Sobre mí
                </span>
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
                  disabled={guardando || subiendoFotos}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#e4d3bd] px-6 py-3 font-semibold text-[#581f2b] transition hover:bg-[#f7f0e5] disabled:opacity-60"
                >
                  <X size={18} />
                  Cancelar
                </button>
              )}

              <button
                type="submit"
                disabled={guardando || subiendoFotos}
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
