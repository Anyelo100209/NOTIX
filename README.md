# NOTIX — Tu semestre, bajo control

Proyecto final grupal de JavaScript. Aplicación web para organizar tareas académicas,
con cuentas locales, tablero de avance y recordatorios de entrega.

La aplicación es estática: funciona por completo en el navegador, sin servidor ni base de datos.

## Tecnologías

- HTML5
- CSS3
- JavaScript (sin frameworks ni dependencias)
- `localStorage` y `sessionStorage` para guardar los datos
- Web Crypto API para proteger las contraseñas

No requiere instalación de paquetes ni proceso de compilación.

## Funciones

### Cuentas de usuario

- Crear cuenta con nombre, correo y contraseña de al menos 8 caracteres.
- Iniciar sesión y cerrar sesión.
- Las contraseñas no se guardan en texto plano: se almacena una huella generada con
  PBKDF2, SHA-256, sal aleatoria y 150.000 iteraciones.
- Cada cuenta tiene sus propias tareas, separadas de las demás.

### Gestión de tareas

- Registrar tareas con título, materia, fecha de entrega, prioridad y descripción opcional.
- Editar y eliminar tareas, con confirmación antes de borrar.
- Marcar una tarea como terminada; queda registrada la fecha en que se completó.
- Reabrir una tarea completada si hay que corregir algo.
- Buscar por título o materia en pendientes y en completadas.
- Vaciar el historial de completadas.
- Las tareas vencidas se señalan en la tarjeta.

### Secciones

- **Pendientes**: solo las actividades que faltan por hacer, ordenadas por fecha de entrega.
- **Completadas**: historial de lo terminado, ordenado por fecha de finalización.
- La navegación usa `#pendientes` y `#completadas` mediante los enlaces de cada vista,
  sin recargar la página. Las pestañas del encabezado están ocultas por diseño.

### Avance y recordatorios

- Tarjeta de avance con el porcentaje de tareas completadas y barra de progreso.
- Panel de recordatorios con las entregas vencidas, las de hoy y las de mañana.
- Los recordatorios se actualizan al modificar tareas y se revisan cada minuto.

### Perfil

- Modal de perfil con el correo de la cuenta y el conteo de tareas pendientes y completadas.
- Permite cambiar el nombre visible y definir una meta semanal de tareas.

### Interfaz

- Tema claro y oscuro, con la preferencia guardada entre sesiones.
- Diseño adaptable a celular y computador.

## Cómo ejecutar el proyecto

El proyecto debe servirse por HTTP, no abrirse con doble clic sobre el archivo.
El registro de cuentas usa la Web Crypto API, que los navegadores solo habilitan
en contextos seguros.

1. Abre la carpeta del proyecto en VS Code.
2. Instala la extensión **Live Server**.
3. Haz clic derecho sobre `index.html` y elige **Open with Live Server**.
4. Crea una cuenta y entra con ella.

También puedes usar la versión publicada en GitHub Pages.

## Estructura de archivos

| Archivo | Contenido |
|---|---|
| `index.html` | Pantalla de acceso, agenda, formularios, listados, avance y perfil |
| `estilos.css` | Diseño, componentes, tema oscuro y adaptación a móvil |
| `script.js` | Cuentas, tareas, persistencia, renderizado, recordatorios y perfil |

## Datos guardados en el navegador

| Clave | Contenido |
|---|---|
| `notix_usuarios_demo_v1` | Cuentas registradas, con sal y huella de contraseña |
| `notix_sesion_demo_v1` | Identificador de la sesión activa (`sessionStorage`) |
| `notix_tareas_<id>` | Tareas de cada cuenta |
| `notix_tema_preferido` | Tema claro u oscuro |

## Aviso sobre las cuentas

El sistema de cuentas es una demostración académica. Toda la información se guarda
en el navegador de cada equipo, por lo que:

- No hay sincronización entre dispositivos ni entre navegadores.
- No existe recuperación de contraseña.
- Los datos pueden verse o modificarse desde las herramientas del navegador.

No debe usarse con contraseñas reales ni con información sensible.

## En desarrollo

- **Tablero Kanban**: la interfaz con las columnas *Por hacer*, *En proceso* y
  *Completadas* ya está maquetada, pero todavía no se alimenta con las tareas.
- **Meta semanal**: se puede guardar desde el perfil, pero aún no influye en el
  cálculo de avance ni genera avisos.

## Integrantes

- Anyelo Andrey Palomo Gonzalez
- Yenny Paola Peña
- Mónica Isabel Peña Rodríguez

## Repositorio y despliegue

- Repositorio: https://github.com/Anyelo100209/NOTIX
- Despliegue: https://anyelo100209.github.io/NOTIX/
