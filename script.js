// NOTIX - Proyecto final de JavaScript
// Trabajamos con arreglos, objetos, funciones, eventos, DOM y localStorage.

const formulario = document.getElementById('formularioTarea');
const listaTareas = document.getElementById('listaTareas');
const listaCompletadas = document.getElementById('listaCompletadas');
const buscador = document.getElementById('buscadorTareas');
const buscadorCompletadas = document.getElementById('buscadorCompletadas');
const botonGuardar = document.getElementById('botonGuardar');
const botonCancelar = document.getElementById('botonCancelar');
const mensajeFormulario = document.getElementById('mensajeFormulario');

let tareas = [];
let tareaEnEdicion = null;

// Mostrar la fecha en el encabezado.
document.getElementById('fechaActual').textContent = new Date().toLocaleDateString('es-CO', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
});

// Estas tareas son solo ejemplos para que se entienda la aplicación al abrirla.
function fechaEjemplo(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function cargarTareas() {
  try {
    const guardadas = localStorage.getItem('misTareas');
    if (guardadas !== null) {
      tareas = JSON.parse(guardadas);
      if (!Array.isArray(tareas)) tareas = [];
    } else {
      tareas = [
        { id: 1, titulo: 'Terminar taller de JavaScript', materia: 'Programación web', fecha: fechaEjemplo(1), prioridad: 'Alta', detalle: 'Revisar la parte de eventos del DOM.', completada: false },
        { id: 2, titulo: 'Repasar HTML y CSS', materia: 'Diseño web', fecha: fechaEjemplo(3), prioridad: 'Media', detalle: '', completada: false },
        { id: 3, titulo: 'Ver la lección de Git', materia: 'Herramientas', fecha: fechaEjemplo(-1), prioridad: 'Baja', detalle: '', completada: true }
      ];
      guardarTareas();
    }
  } catch (error) {
    tareas = [];
  }
}

function guardarTareas() {
  localStorage.setItem('misTareas', JSON.stringify(tareas));
}

function mostrarResumen() {
  const terminadas = tareas.filter(tarea => tarea.completada).length;
  const pendientes = tareas.length - terminadas;
  const porcentaje = tareas.length > 0 ? Math.round((terminadas / tareas.length) * 100) : 0;

  document.getElementById('totalTareas').textContent = tareas.length;
  document.getElementById('tareasPendientes').textContent = pendientes;
  document.getElementById('tareasTerminadas').textContent = terminadas;
  document.getElementById('porcentajeAvance').textContent = porcentaje + '%';
  document.getElementById('progresoRelleno').style.width = porcentaje + '%';
  document.getElementById('barraAvance').setAttribute('aria-valuenow', porcentaje);
  document.getElementById('menuPendientes').textContent = pendientes;
  document.getElementById('menuCompletadas').textContent = terminadas;
  document.getElementById('cantidadCompletadas').textContent = terminadas;
}

function formatoFecha(fechaTexto) {
  const fecha = new Date(fechaTexto + 'T12:00:00');
  return fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fechaVencida(tarea) {
  const hoy = fechaEjemplo(0);
  return !tarea.completada && tarea.fecha < hoy;
}

// Se crean las tarjetas con el DOM. Los textos que escribe el usuario
// se agregan con textContent para mostrarlos como texto normal.
function crearTarjeta(tarea) {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'tarea' + (tarea.completada ? ' terminada' : '');

  tarjeta.innerHTML = `
    <div class="tarea-superior">
      <div>
        <h3></h3>
        <p class="tarea-materia"></p>
      </div>
      <span class="prioridad"></span>
    </div>
    <p class="tarea-detalle oculto"></p>
    <div class="tarea-pie">
      <span class="tarea-fecha"></span>
      <div class="acciones">
        <button type="button" class="accion completar" data-accion="completar"></button>
        <button type="button" class="accion" data-accion="editar">Editar</button>
        <button type="button" class="accion borrar" data-accion="borrar">Eliminar</button>
      </div>
    </div>
  `;

  tarjeta.querySelector('h3').textContent = tarea.titulo;
  tarjeta.querySelector('.tarea-materia').textContent = tarea.materia;

  const prioridad = tarjeta.querySelector('.prioridad');
  prioridad.textContent = tarea.prioridad;
  prioridad.classList.add('prioridad-' + tarea.prioridad.toLowerCase());

  const detalle = tarjeta.querySelector('.tarea-detalle');
  if (tarea.detalle) {
    detalle.textContent = tarea.detalle;
    detalle.classList.remove('oculto');
  }

  const fecha = tarjeta.querySelector('.tarea-fecha');
  fecha.textContent = tarea.completada
    ? '✓ Completada' + (tarea.fechaCompletada ? ' el ' + formatoFecha(tarea.fechaCompletada) : '')
    : '📅 Entrega: ' + formatoFecha(tarea.fecha);
  if (fechaVencida(tarea)) {
    fecha.textContent += ' · Vencida';
    fecha.classList.add('vencida');
  }

  tarjeta.querySelector('.completar').textContent = tarea.completada ? '↩ Reabrir' : '✓ Terminar';
  tarjeta.querySelectorAll('[data-accion]').forEach(boton => {
    boton.dataset.id = tarea.id;
  });

  return tarjeta;
}

// Cada sección muestra solo sus propias tareas.
function mostrarTareas() {
  listaTareas.replaceChildren();
  listaCompletadas.replaceChildren();

  const textoPendientes = buscador.value.toLowerCase().trim();
  const textoCompletadas = buscadorCompletadas.value.toLowerCase().trim();

  const pendientes = tareas.filter(tarea =>
    !tarea.completada && coincideBusqueda(tarea, textoPendientes)
  ).sort((a, b) => a.fecha.localeCompare(b.fecha));

  const terminadas = tareas.filter(tarea =>
    tarea.completada && coincideBusqueda(tarea, textoCompletadas)
  ).sort((a, b) => (b.fechaCompletada || b.fecha).localeCompare(a.fechaCompletada || a.fecha));

  pintarLista(listaTareas, pendientes, 'pendientes', textoPendientes);
  pintarLista(listaCompletadas, terminadas, 'completadas', textoCompletadas);
  mostrarResumen();
  document.getElementById('botonLimpiar').disabled = !tareas.some(tarea => tarea.completada);
}

function coincideBusqueda(tarea, texto) {
  return tarea.titulo.toLowerCase().includes(texto) || tarea.materia.toLowerCase().includes(texto);
}

function pintarLista(contenedor, actividades, tipo, textoBusqueda) {
  if (actividades.length) {
    actividades.forEach(tarea => contenedor.appendChild(crearTarjeta(tarea)));
    return;
  }

  const vacio = document.createElement('div');
  vacio.className = 'vacio';
  const icono = document.createElement('div');
  icono.className = 'vacio-icono';
  icono.textContent = textoBusqueda ? '🔎' : (tipo === 'pendientes' ? '🎉' : '📂');
  const titulo = document.createElement('strong');
  titulo.textContent = textoBusqueda ? 'Sin coincidencias'
    : (tipo === 'pendientes' ? '¡Todo al día!' : 'Todavía no hay tareas completadas');
  const mensaje = document.createElement('p');
  mensaje.textContent = textoBusqueda ? 'Prueba escribiendo otra palabra.'
    : (tipo === 'pendientes' ? 'Agrega una tarea nueva o disfruta de tener todo terminado.'
      : 'Cuando termines una actividad, aparecerá aquí.');
  vacio.append(icono, titulo, mensaje);
  contenedor.appendChild(vacio);
}

// Cambiamos de sección sin recargar la página.
function cambiarVista() {
  const mostrarCompletadas = window.location.hash === '#completadas';
  document.getElementById('vistaPendientes').classList.toggle('oculto', mostrarCompletadas);
  document.getElementById('vistaCompletadas').classList.toggle('oculto', !mostrarCompletadas);

  document.querySelectorAll('.enlace-menu').forEach(enlace => {
    const activo = enlace.dataset.vista === (mostrarCompletadas ? 'completadas' : 'pendientes');
    enlace.classList.toggle('activo', activo);
    if (activo) enlace.setAttribute('aria-current', 'page');
    else enlace.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);
}

function limpiarFormulario() {
  formulario.reset();
  tareaEnEdicion = null;
  botonGuardar.textContent = '+ Guardar actividad';
  botonCancelar.classList.add('oculto');
  document.getElementById('tituloFormulario').textContent = 'Nueva actividad';
}

formulario.addEventListener('submit', function(evento) {
  evento.preventDefault();

  const titulo = document.getElementById('tituloTarea').value.trim();
  const materia = document.getElementById('materiaTarea').value.trim();
  const fecha = document.getElementById('fechaTarea').value;
  const prioridad = document.getElementById('prioridadTarea').value;
  const detalle = document.getElementById('detalleTarea').value.trim();

  if (!titulo || !materia || !fecha) {
    mensajeFormulario.textContent = 'Completa los campos obligatorios.';
    return;
  }

  if (tareaEnEdicion !== null) {
    const tarea = tareas.find(tarea => tarea.id === tareaEnEdicion);
    if (tarea) Object.assign(tarea, { titulo, materia, fecha, prioridad, detalle });
    mensajeFormulario.textContent = 'Actividad actualizada correctamente.';
  } else {
    tareas.push({ id: Date.now(), titulo, materia, fecha, prioridad, detalle, completada: false });
    mensajeFormulario.textContent = 'Actividad guardada correctamente.';
  }

  guardarTareas();
  limpiarFormulario();
  mostrarTareas();
});

botonCancelar.addEventListener('click', function() {
  limpiarFormulario();
  mensajeFormulario.textContent = '';
});

function gestionarAccionTarea(evento) {
  const boton = evento.target.closest('button[data-accion]');
  if (!boton) return;

  const id = Number(boton.dataset.id);
  const tarea = tareas.find(tarea => tarea.id === id);
  if (!tarea) return;

  if (boton.dataset.accion === 'completar') {
    tarea.completada = !tarea.completada;
    if (tarea.completada) tarea.fechaCompletada = fechaEjemplo(0);
    else delete tarea.fechaCompletada;
    guardarTareas();
    mostrarTareas();
  }

  if (boton.dataset.accion === 'editar') {
    tareaEnEdicion = tarea.id;
    document.getElementById('tituloTarea').value = tarea.titulo;
    document.getElementById('materiaTarea').value = tarea.materia;
    document.getElementById('fechaTarea').value = tarea.fecha;
    document.getElementById('prioridadTarea').value = tarea.prioridad;
    document.getElementById('detalleTarea').value = tarea.detalle || '';
    document.getElementById('tituloFormulario').textContent = 'Editar actividad';
    if (window.location.hash === '#completadas') {
      window.location.hash = '#pendientes';
      cambiarVista();
    }
    botonGuardar.textContent = 'Guardar cambios';
    botonCancelar.classList.remove('oculto');
    mensajeFormulario.textContent = '';
    document.getElementById('tituloTarea').focus();
    document.getElementById('formularioTarea').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (boton.dataset.accion === 'borrar') {
    if (confirm('¿Seguro que quieres eliminar esta actividad?')) {
      tareas = tareas.filter(item => item.id !== id);
      if (tareaEnEdicion === id) limpiarFormulario();
      guardarTareas();
      mostrarTareas();
    }
  }
}

listaTareas.addEventListener('click', gestionarAccionTarea);
listaCompletadas.addEventListener('click', gestionarAccionTarea);
buscador.addEventListener('input', mostrarTareas);
buscadorCompletadas.addEventListener('input', mostrarTareas);
window.addEventListener('hashchange', cambiarVista);

document.getElementById('botonLimpiar').addEventListener('click', function() {
  if (!tareas.some(tarea => tarea.completada)) return;
  if (confirm('¿Quieres eliminar todas las actividades terminadas?')) {
    tareas = tareas.filter(tarea => !tarea.completada);
    limpiarFormulario();
    guardarTareas();
    mostrarTareas();
  }
});

cargarTareas();
mostrarTareas();
cambiarVista();
