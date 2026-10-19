# Documentación técnica del proyecto Entre Pañuelos

**Versión:** 0.1 — Desarrollo inicial  
**Fecha:** 18 de octubre de 2026  
**Estado:** Interfaz inicial y filtros locales implementados

---

## 1. Descripción general del proyecto

**Entre Pañuelos** es una aplicación web orientada a conectar personas que practican marinera peruana y buscan una pareja de baile con objetivos compatibles.

La plataforma busca facilitar que los bailarines encuentren personas según sus características, ubicación, nivel de experiencia, objetivos de entrenamiento y academia.

### Objetivos principales

- Mostrar perfiles de bailarines.
- Permitir descubrir personas que practican marinera.
- Filtrar perfiles según criterios específicos.
- Permitir dar «me gusta» y destacar perfiles.
- Preparar la base para desarrollar un sistema de conexiones mutuas.
- Construir una interfaz visual atractiva, adaptable a distintos dispositivos y fácil de mantener.

### Tecnologías utilizadas

| Tecnología | Función |
|---|---|
| HTML | Estructura del contenido web. |
| CSS | Estilos visuales, complementados con Tailwind CSS. |
| JavaScript | Lógica y comportamiento de la aplicación. |
| React | Construcción de la interfaz mediante componentes. |
| Vite | Herramienta de desarrollo y compilación. |
| Tailwind CSS v4 | Estilización mediante clases utilitarias. |
| React Router DOM | Navegación entre páginas. |
| Lucide React | Iconos de la interfaz. |
| Git y GitHub | Control de versiones y alojamiento del repositorio. |

---

## 2. Configuración inicial del proyecto

### Paso 1. Crear el proyecto con Vite

Vite permite iniciar y ejecutar el proyecto de React en un entorno de desarrollo.

La estructura se basa en componentes `.jsx`, archivos JavaScript que permiten escribir elementos de interfaz usando JSX.

El servidor de desarrollo permite visualizar los cambios mientras se programa.

Comando habitual para iniciar el servidor:

```bash
npm run dev
```

Este comando debe ejecutarse dentro de la carpeta del proyecto, donde se encuentra `package.json`.

### Paso 2. Instalar las dependencias

Se utilizan estas bibliotecas principales:

```bash
npm install react-router-dom lucide-react
npm install tailwindcss @tailwindcss/vite
```

- `react-router-dom`: permite navegar entre páginas sin recargar completamente la aplicación.
- `lucide-react`: proporciona iconos como corazones, estrellas, ubicaciones y botones de navegación.
- `tailwindcss`: facilita la creación de estilos mediante clases.
- `@tailwindcss/vite`: integra Tailwind CSS v4 con Vite.

### Paso 3. Configurar Tailwind CSS v4

En `vite.config.js` se incorpora el complemento de Tailwind CSS junto al de React.

La configuración debe conservar ambos complementos. La integración de Tailwind se realiza mediante `@tailwindcss/vite`.

En `src/index.css` se importa Tailwind:

```css
@import "tailwindcss";
```

Esto permite utilizar clases como `flex`, `grid`, `rounded-2xl`, `text-sm` y `bg-[#581f2b]` directamente en los componentes JSX.

---

## 3. Identidad visual de Entre Pañuelos

Se definió una estética inspirada en la elegancia de la marinera peruana, utilizando tonos cálidos, vino, dorado y tipografía serif para los títulos.

### Paleta de colores

| Color | Código | Uso |
|---|---|---|
| Vino | `#581f2b` | Identidad principal, títulos y botones. |
| Dorado | `#d6a64f` | Acentos visuales. |
| Crema | `#f7f0e5` | Fondo principal. |
| Carbón | `#242321` | Texto principal. |

### Tipografías

- **Playfair Display:** títulos y elementos con un estilo elegante.
- **DM Sans:** textos generales, controles y contenido de lectura.

Se importaron desde Google Fonts en `index.css`.

### Estilos globales

También se establecieron reglas globales para:

- Eliminar márgenes predeterminados del documento.
- Asegurar que el contenedor principal ocupe al menos la altura de la pantalla.
- Aplicar `box-sizing: border-box`.
- Heredar la tipografía en botones, campos de entrada y selectores.
- Añadir desplazamiento suave mediante `scroll-behavior: smooth`.
- Personalizar el color de selección del texto.

La intención es mantener una apariencia coherente en todas las páginas.

---

## 4. Organización de los archivos

La estructura de trabajo establecida es la siguiente:

```text
src/
├── App.jsx
├── main.jsx
├── index.css
│
├── components/
│   ├── Navbar.jsx
│   └── ProfileCard.jsx
│
├── pages/
│   ├── Home.jsx
│   ├── Discover.jsx
│   ├── Matches.jsx
│   └── Profile.jsx
│
└── data/
    └── bailarines.js
```

### ¿Qué responsabilidad tiene cada archivo?

**`main.jsx`**

Es el punto de entrada de React. Renderiza la aplicación y la envuelve con `BrowserRouter` para habilitar la navegación.

**`App.jsx`**

Organiza la estructura general de la aplicación. Contiene la navegación entre páginas y el pie de página.

**`index.css`**

Contiene los estilos globales, las fuentes y la importación de Tailwind CSS.

**`components/Navbar.jsx`**

Contiene la barra de navegación y los enlaces a las diferentes secciones.

**`components/ProfileCard.jsx`**

Define la tarjeta reutilizable que muestra la información de un bailarín.

**`pages/Home.jsx`**

Es la página de inicio o presentación de la plataforma.

**`pages/Discover.jsx`**

Es la sección donde se muestran los perfiles y se aplican los filtros.

**`pages/Matches.jsx`**

Es el espacio reservado para mostrar las conexiones entre usuarios.

**`pages/Profile.jsx`**

Es el espacio reservado para la sección del perfil del usuario.

**`data/bailarines.js`**

Contiene los datos de ejemplo que utiliza actualmente la sección de descubrimiento.

Esta separación permite mantener el proyecto organizado y facilita añadir funcionalidades sin concentrar toda la lógica en un único archivo.

---

## 5. Navegación entre páginas

En `App.jsx` se establecieron estas rutas:

| Ruta | Página | Función |
|---|---|---|
| `/` | `Home` | Página de inicio. |
| `/descubrir` | `Discover` | Explorar bailarines. |
| `/matches` | `Matches` | Espacio para conexiones. |
| `/perfil` | `Profile` | Sección del perfil. |

La navegación utiliza React Router DOM.

Por ejemplo, `Link` permite ir a otra ruta sin realizar una recarga completa de la página:

```jsx
<Link to="/descubrir">
  Descubrir bailarines
</Link>
```

Por su parte, `NavLink` permite identificar el enlace correspondiente a la ruta activa, lo que resulta útil para resaltar la sección actual en la barra de navegación.

**Importante:** tener una ruta configurada no significa que esa página ya tenga todas sus funcionalidades implementadas. `Matches` y `Profile` siguen siendo secciones preparadas para desarrollo posterior.

---

## 6. Página de inicio

En `Home.jsx` se construyó una presentación inicial de la plataforma con clases de Tailwind CSS.

La página presenta la idea de Entre Pañuelos y organiza su propuesta en tres conceptos:

1. **Conoce bailarines:** descubrir personas que comparten el interés por la marinera.
2. **Conecta mutuamente:** preparar una experiencia basada en el interés de ambas personas.
3. **Crezcan juntos:** destacar la práctica, el entrenamiento y la mejora de la técnica.

Se utilizaron recursos como:

- Contenedores con `max-width` y márgenes automáticos.
- Diseños flexibles.
- Espaciados mediante `padding` y `gap`.
- Fondos crema y elementos en color vino.
- Bordes redondeados y sombras suaves.
- Tipografía serif en títulos.

El objetivo fue establecer la identidad visual antes de desarrollar las funcionalidades más complejas.

---

## 7. Datos de los bailarines

Se creó `src/data/bailarines.js` para mantener separados los datos de ejemplo y la interfaz.

La información se exporta mediante una constante:

```js
export const bailarines = [
  // Perfiles de ejemplo
];
```

Esto permite importar los datos desde cualquier componente que los necesite.

### Estructura de cada perfil

Cada bailarín contiene los siguientes campos:

| Campo | Significado |
|---|---|
| `id` | Identificador único del perfil. |
| `nombre` | Nombre que se muestra en la tarjeta. |
| `edad` | Edad del bailarín. |
| `sexo` | Categoría utilizada para filtrar. |
| `ciudad` | Ciudad de residencia indicada en el perfil. |
| `nivel` | Nivel de experiencia en marinera. |
| `objetivo` | Objetivo principal, como práctica o concursos. |
| `academia` | Academia asociada al perfil. |
| `descripcion` | Texto descriptivo del bailarín. |
| `imagen` | Ruta o URL de la imagen del perfil. |

### Perfiles de prueba actuales

**Alex Donet**

- Edad: 31 años.
- Sexo: Masculino.
- Ciudad: Lima.
- Nivel: Avanzado.
- Objetivo: Concursos.
- Academia: Alex Donet.
- Imagen local: `/img/alex.jfif`.

**Valeria**

- Edad: 21 años.
- Sexo: Femenino.
- Ciudad: Trujillo.
- Nivel: Medio.
- Objetivo: Práctica.
- Academia: Pañuelos al Aire.
- Imagen: URL de Unsplash.

**Diego**

- Edad: 25 años.
- Sexo: Masculino.
- Ciudad: Lima.
- Nivel: Principiante.
- Objetivo: Concursos.
- Academia: Todas Sangres.
- Imagen: URL de Unsplash.

Estos son datos de ejemplo, no perfiles registrados en una base de datos.

**Nota sobre la imagen de Alex:** para que `/img/alex.jfif` funcione con esa ruta, el archivo debe estar dentro de `public/img/alex.jfif`.

---

## 8. Componente reutilizable ProfileCard

Se creó `src/components/ProfileCard.jsx` para representar visualmente a cada bailarín.

El componente recibe un objeto mediante una prop llamada `bailarín`:

```jsx
function ProfileCard({ bailarín }) {
  // Representación del perfil
}
```

La desestructuración permite acceder directamente a los datos recibidos.

Por ejemplo:

```jsx
{bailarín.nombre}
{bailarín.edad}
{bailarín.ciudad}
```

En lugar de escribir una tarjeta diferente para cada persona, React utiliza el mismo componente con datos distintos.

### Elementos de la tarjeta

- Fotografía del perfil.
- Nombre y edad.
- Etiquetas con información del bailarín.
- Ciudad acompañada del icono `MapPin`.
- Descripción personal.

### Etiquetas actuales

Se agrupan cuatro propiedades en un mismo bloque:

```jsx
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
```

Este fragmento utiliza tres conceptos importantes de React:

1. **Arrays:** se agrupan los valores que queremos mostrar.
2. **`map()`:** transforma cada elemento del array en un elemento visual.
3. **`key`:** permite que React identifique los elementos de la lista.

Además, `flex flex-wrap gap-2` permite que las etiquetas se distribuyan horizontalmente y pasen a la siguiente línea si el espacio disponible no es suficiente.

El resultado es una tarjeta reutilizable y adaptable.

---

## 9. Desarrollo de la sección Descubrir

La funcionalidad principal implementada hasta el momento está en `src/pages/Discover.jsx`.

La página importa los datos, el componente de tarjeta y los iconos necesarios:

```jsx
import { useState } from "react";
import {
  Heart,
  X,
  Star,
  RotateCcw,
  HandHeart,
  SlidersHorizontal,
} from "lucide-react";

import { bailarines } from "../data/bailarines";
import ProfileCard from "../components/ProfileCard";
```

Cada importación tiene una responsabilidad:

- `useState` administra el estado local de la página.
- Los iconos representan acciones de la interfaz.
- `bailarines` proporciona los perfiles de ejemplo.
- `ProfileCard` muestra el perfil seleccionado.

### 9.1. Estado de los filtros

Se estableció un objeto con los valores iniciales:

```jsx
const filtrosIniciales = {
  sexo: "Todos",
  ciudad: "Todas",
  nivel: "Todos",
  objetivo: "Todos",
  academia: "Todas",
};
```

Los valores `"Todos"` y `"Todas"` significan que no se quiere restringir la búsqueda por ese campo.

Después se inicializa el estado:

```jsx
const [filtros, setFiltros] = useState(filtrosIniciales);
```

`filtros` contiene la selección actual, mientras que `setFiltros` permite actualizarla.

### 9.2. Estado de los perfiles vistos y las acciones

También se declararon estos estados:

```jsx
const [vistos, setVistos] = useState([]);
const [likes, setLikes] = useState([]);
const [destacados, setDestacados] = useState([]);
```

Su función es la siguiente:

- `vistos`: registra los identificadores de los perfiles que ya se han pasado.
- `likes`: registra los identificadores de los perfiles a los que se ha dado «me gusta».
- `destacados`: registra los identificadores de los perfiles marcados con la estrella.

Se utilizan arrays de identificadores en lugar de duplicar todos los datos de cada perfil.

Por ejemplo, si se da «me gusta» al perfil con ID `2`, el estado podría contener:

```js
[2]
```

Estos estados son locales y temporales: todavía no se guardan en una base de datos.

### 9.3. Opciones dinámicas de ciudad y academia

Las opciones de ciudad y academia se obtienen de los datos disponibles.

El objetivo es que, cuando se agreguen nuevos perfiles, los selectores puedan incluir sus ciudades y academias sin tener que escribir manualmente cada opción.

El proceso utiliza operaciones como:

- `map()`, para extraer un campo de cada perfil.
- `Set`, para eliminar valores repetidos.
- `filter(Boolean)`, para excluir valores vacíos.
- El operador spread (`...`), para construir las listas de opciones.

Así, las opciones de los filtros se relacionan con los datos existentes.

### 9.4. Actualización de un filtro

La función `actualizarFiltro(campo, valor)` permite modificar un filtro específico.

Su lógica utiliza una actualización del estado con una función:

```jsx
setFiltros((filtrosAnteriores) => ({
  ...filtrosAnteriores,
  [campo]: valor,
}));
```

Esta operación conserva las selecciones anteriores y actualiza solamente el campo indicado.

Por ejemplo, seleccionar Lima cambia `ciudad`, pero no borra automáticamente el nivel ni el objetivo seleccionados.

El uso de `...filtrosAnteriores` es importante porque evita reemplazar el objeto entero con un único filtro.

### 9.5. Aplicación de los filtros

La lógica de filtrado compara cada perfil con las selecciones del usuario.

Conceptualmente, la regla es:

- Si el filtro tiene el valor general `"Todos"` o `"Todas"`, ese criterio no restringe los resultados.
- Si se selecciona un valor específico, el perfil debe coincidir con ese valor.
- El perfil debe cumplir todos los criterios activos para aparecer en los resultados.

Por ejemplo, seleccionar simultáneamente `Lima` y `Avanzado` debe mostrar solamente a Alex Donet con los datos actuales.

Esta lógica se basa en `filter()`, que genera un nuevo array con los perfiles que cumplen las condiciones.

### 9.6. Selección del perfil actual

Después de filtrar los perfiles, se excluyen aquellos cuyos identificadores ya están en `vistos`.

El concepto es:

```jsx
const perfilesDisponibles = perfilesFiltrados.filter(
  (bailarin) => !vistos.includes(bailarin.id)
);
```

Luego se obtiene el primer perfil disponible:

```jsx
const bailarínActual = perfilesDisponibles[0];
```

Así, la tarjeta muestra un perfil a la vez.

Si se han pasado todos los perfiles que cumplen los filtros, se presenta el estado vacío correspondiente.

### 9.7. Pasar un perfil

La función `pasarPerfil` añade el identificador del perfil actual al estado `vistos`.

Se evita registrar dos veces el mismo ID.

Cuando React actualiza ese estado, vuelve a renderizar la página y se selecciona el siguiente perfil disponible.

### 9.8. Dar «me gusta»

La función `darLike` agrega el identificador del perfil actual a `likes`, evitando duplicados, y también pasa ese perfil para continuar la búsqueda.

Actualmente, esto representa una acción local dentro de la interfaz.

No envía notificaciones, no registra el «me gusta» en un servidor y no genera una conexión mutua real.

### 9.9. Destacar un perfil

La función `destacarPerfil` agrega el ID actual a `destacados` y continúa al siguiente perfil.

Es una acción visual y local, preparada para que más adelante podamos definir qué significa destacar un perfil dentro de la experiencia final.

### 9.10. Reiniciar la búsqueda

Se incorporó una función para restablecer los filtros y limpiar los estados de la sesión local.

El reinicio devuelve los selectores a sus valores iniciales y permite volver a recorrer los perfiles disponibles.

Esto ayuda a probar diferentes combinaciones sin tener que recargar la aplicación manualmente.

---

## 10. Filtros implementados

La sección Descubrir incluye cinco criterios de búsqueda:

| Filtro | Opciones actuales |
|---|---|
| Sexo | Todos, Masculino, Femenino. |
| Ciudad | Todas y las ciudades presentes en los datos. |
| Nivel | Todos, Principiante, Medio, Avanzado. |
| Objetivo | Todos, Práctica, Concursos. |
| Academia | Todas y las academias presentes en los datos. |

### Ejemplos de resultados esperados

| Selección | Resultado |
|---|---|
| Todos los filtros generales | Los tres perfiles, inicialmente. |
| Ciudad: Lima | Alex Donet y Diego. |
| Sexo: Femenino | Valeria. |
| Nivel: Medio | Valeria. |
| Objetivo: Concursos | Alex Donet y Diego. |
| Academia: Todas Sangres | Diego. |
| Ciudad: Lima y nivel: Avanzado | Alex Donet. |

Estos resultados corresponden a los tres perfiles de ejemplo actuales.

Si ya se han pasado perfiles, los resultados visibles pueden variar hasta reiniciar la búsqueda, porque los perfiles vistos se excluyen de la selección actual.

---

## 11. Diseño de la interfaz Descubrir

La interfaz utiliza clases de Tailwind CSS para construir sus elementos.

Entre las clases utilizadas están:

- `flex`: distribuye elementos mediante Flexbox.
- `flex-wrap`: permite que los elementos pasen a otra línea.
- `gap-2`: controla el espacio entre elementos.
- `rounded-2xl`: redondea las esquinas.
- `border`: aplica un borde.
- `shadow-xl`: añade sombra.
- `p-6`: establece el relleno.
- `text-sm`: controla el tamaño del texto.
- `bg-[#fffaf2]`: aplica un color de fondo personalizado.
- `text-[#581f2b]`: aplica el color vino de la marca.

También se incorporaron iconos para las acciones de pasar, dar «me gusta», destacar y reiniciar la búsqueda.

El objetivo es mantener una interfaz consistente con la página de inicio y evitar depender de numerosos archivos CSS independientes.

---

## 12. Estado actual y limitaciones

### Funcionalidades construidas

- Estructura inicial del proyecto React.
- Navegación entre las cuatro rutas principales.
- Identidad visual y estilos globales.
- Página de inicio.
- Datos de ejemplo de bailarines.
- Componente reutilizable para las tarjetas.
- Visualización de sexo, nivel, objetivo y academia en el mismo bloque de etiquetas.
- Filtros por sexo, ciudad, nivel, objetivo y academia.
- Selección de un perfil disponible a la vez.
- Acciones locales de pasar, dar «me gusta» y destacar.
- Reinicio de la búsqueda.

### Funcionalidades pendientes

- Registrar usuarios reales.
- Autenticación y gestión de cuentas.
- Base de datos para almacenar perfiles.
- Persistencia de «me gusta», destacados y perfiles vistos.
- Sistema de conexiones mutuas.
- Filtros por edad mínima y máxima.
- Edición del perfil personal.
- Carga de fotografías de usuarios.
- Paginación o carga progresiva de perfiles.
- Validaciones y gestión de errores.
- Diseño responsive revisado en dispositivos reales.
- Medidas de seguridad y protección de datos personales.

Actualmente, los datos y acciones de Descubrir se manejan en el navegador. Si se recarga la página, los estados locales se reinician y no se conserva un registro permanente de las acciones.

---

## 13. Próximos pasos recomendados

Para continuar de forma ordenada, propongo esta secuencia:

**Etapa 1 — Mejorar Descubrir**

- Comprobar todas las combinaciones de filtros.
- Añadir filtros de edad mínima y máxima.
- Verificar que el estado vacío funcione correctamente.
- Revisar la visualización en móviles y escritorio.

**Etapa 2 — Completar la experiencia de los perfiles**

- Diseñar la página Perfil.
- Permitir editar la información personal.
- Definir las validaciones para los datos del usuario.

**Etapa 3 — Desarrollar las conexiones**

- Definir qué ocurre cuando dos usuarios se dan «me gusta».
- Mostrar las conexiones mutuas en Matches.
- Decidir qué acciones puede realizar cada usuario.

**Etapa 4 — Incorporar persistencia**

- Diseñar el modelo de datos.
- Elegir una solución de backend y base de datos.
- Guardar los perfiles y las interacciones.
- Conectar el frontend con los datos persistentes.

**Etapa 5 — Preparar una primera versión publicable**

- Probar los flujos completos.
- Revisar accesibilidad y diseño responsive.
- Gestionar errores.
- Proteger los datos y validar las operaciones del servidor.
- Desplegar la aplicación.

---

## 14. Resumen técnico para retomar el proyecto

Al regresar al desarrollo, el punto de partida es `src/pages/Discover.jsx`.

Antes de introducir nuevas funcionalidades, conviene comprobar:

1. Que el servidor de Vite arranque correctamente.
2. Que `/descubrir` muestre los perfiles.
3. Que los cinco filtros funcionen de manera independiente y combinada.
4. Que las etiquetas de sexo, nivel, objetivo y academia aparezcan juntas en `ProfileCard.jsx`.
5. Que pasar un perfil o dar «me gusta» cambie el perfil mostrado.
6. Que reiniciar la búsqueda restaure los estados locales.
7. Que la imagen local de Alex exista en `public/img/alex.jfif`.

**Punto de continuación:** mejorar la sección Descubrir y añadir el filtro de edad mínima y máxima, antes de avanzar hacia conexiones reales y almacenamiento persistente.

Esta documentación describe el diseño y la lógica que hemos establecido hasta ahora. El comportamiento final debe comprobarse ejecutando la aplicación y probando cada flujo en el navegador.
