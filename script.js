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
let usuarioActivo = null;

// Cada cuenta guarda sus tareas bajo una clave distinta.
function textoFecha(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function fechaEjemplo(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return textoFecha(fecha);
}

/* META SEMANAL */

// La semana académica va de lunes a domingo.
function rangoSemana() {
  const hoy = new Date();
  const diaActual = hoy.getDay();
  const diasDesdeLunes = diaActual === 0 ? 6 : diaActual - 1;

  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - diasDesdeLunes);

  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);

  return { inicio: textoFecha(lunes), fin: textoFecha(domingo) };
}

// Si la cuenta no tiene meta válida, se usan 5 tareas por semana.
function metaSemanal() {
  const valor = Number(usuarioActivo && usuarioActivo.metaSemanal);
  const valida = Number.isInteger(valor) && valor >= 1 && valor <= 100;
  return valida ? valor : 5;
}

// Cuenta las tareas terminadas dentro de la semana en curso.
function avanceSemanal() {
  const semana = rangoSemana();
  const meta = metaSemanal();

  const completadas = tareas.filter(tarea =>
    tarea.completada &&
    tarea.fechaCompletada &&
    tarea.fechaCompletada >= semana.inicio &&
    tarea.fechaCompletada <= semana.fin
  ).length;

  return {
    completadas,
    meta,
    faltan: Math.max(0, meta - completadas),
    porcentaje: Math.min(100, Math.round((completadas / meta) * 100)),
    cumplida: completadas >= meta
  };
}

function claveTareas() {
  return 'notix_tareas_' + usuarioActivo.id;
}

function cargarTareas() {
  try {
    const datos = localStorage.getItem(claveTareas());
    tareas = datos ? JSON.parse(datos) : [];
    if (!Array.isArray(tareas)) tareas = [];
  } catch (error) {
    tareas = [];
  }
}

function guardarTareas() {
  if (usuarioActivo) localStorage.setItem(claveTareas(), JSON.stringify(tareas));
}

function mostrarResumen() {
  const terminadas = tareas.filter(tarea => tarea.completada).length;
  const pendientes = tareas.length - terminadas;
  const porcentaje = tareas.length > 0 ? Math.round((terminadas / tareas.length) * 100) : 0;

  const porcentajeAvance = document.getElementById('porcentajeAvance');
  const progresoRelleno = document.getElementById('progresoRelleno');
  const barraAvance = document.getElementById('barraAvance');
  const menuPendientes = document.getElementById('menuPendientes');
  const menuCompletadas = document.getElementById('menuCompletadas');
  const cantidadCompletadas = document.getElementById('cantidadCompletadas');

  if (porcentajeAvance) porcentajeAvance.textContent = porcentaje + '%';
  if (progresoRelleno) progresoRelleno.style.width = porcentaje + '%';
  if (barraAvance) barraAvance.setAttribute('aria-valuenow', porcentaje);
  if (menuPendientes) menuPendientes.textContent = pendientes;
  if (menuCompletadas) menuCompletadas.textContent = terminadas;
  if (cantidadCompletadas) cantidadCompletadas.textContent = terminadas;
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
  actualizarRecordatorios();

  const botonLimpiar = document.getElementById('botonLimpiar');
  if (botonLimpiar) botonLimpiar.disabled = !tareas.some(tarea => tarea.completada);
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
  if (!usuarioActivo) return;

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
  if (!boton || !usuarioActivo) return;

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
  if (!usuarioActivo || !tareas.some(tarea => tarea.completada)) return;
  if (confirm('¿Quieres eliminar todas las actividades terminadas?')) {
    tareas = tareas.filter(tarea => !tarea.completada);
    limpiarFormulario();
    guardarTareas();
    mostrarTareas();
  }
});

// La agenda se carga solamente después de entrar con una cuenta válida.


// ---------------------------------------------------------------
// Cuentas de demostración: correo + contraseña, guardadas localmente.
// No sustituyen un sistema real de autenticación con servidor.
// ---------------------------------------------------------------
const CLAVE_USUARIOS = 'notix_usuarios_demo_v1';
const CLAVE_SESION = 'notix_sesion_demo_v1';

function obtenerUsuarios() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE_USUARIOS) || '[]');
    return Array.isArray(datos) ? datos : [];
  } catch (error) {
    return [];
  }
}

function correoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function cambiarFormularioAcceso(tipo) {
  const registro = tipo === 'registro';
  document.getElementById('formularioIngreso').classList.toggle('oculto', registro);
  document.getElementById('formularioRegistro').classList.toggle('oculto', !registro);
  document.getElementById('verIngreso').classList.toggle('seleccionada', !registro);
  document.getElementById('verRegistro').classList.toggle('seleccionada', registro);
  document.getElementById('verIngreso').setAttribute('aria-pressed', String(!registro));
  document.getElementById('verRegistro').setAttribute('aria-pressed', String(registro));
  document.getElementById('tituloAcceso').textContent = registro ? 'Crea tu cuenta' : 'Inicia sesión';
  document.querySelector('.acceso-ayuda').textContent = registro
    ? 'Registra tus datos para comenzar tu agenda.'
    : 'Ingresa a tu agenda personal.';
  document.getElementById('mensajeIngreso').textContent = '';
  document.getElementById('mensajeRegistro').textContent = '';
}

// El navegador calcula una huella de la contraseña con PBKDF2.
// No se guarda el texto de la contraseña; sigue siendo solo una demo local.
function generarSal() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(numero => numero.toString(16).padStart(2, '0')).join('');
}

async function huellaClave(contrasena, sal) {
  const codificador = new TextEncoder();
  const clave = await crypto.subtle.importKey(
    'raw', codificador.encode(contrasena), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt: codificador.encode(sal),
    iterations: 150000,
    hash: 'SHA-256'
  }, clave, 256);
  return Array.from(new Uint8Array(bits))
    .map(numero => numero.toString(16).padStart(2, '0')).join('');
}

function mensajeAcceso(tipo, texto) {
  document.getElementById(tipo === 'registro' ? 'mensajeRegistro' : 'mensajeIngreso').textContent = texto;
}

function activarUsuario(usuario) {
  usuarioActivo = usuario;
  sessionStorage.setItem(CLAVE_SESION, usuario.id);
  document.getElementById('pantallaAcceso').classList.add('oculto');
  document.getElementById('aplicacion').classList.remove('oculto');
  document.getElementById('usuarioSaludo').textContent = 'Hola, ' + usuario.nombre;
  document.getElementById('formularioIngreso').reset();
  document.getElementById('formularioRegistro').reset();
  limpiarFormulario();
  mensajeFormulario.textContent = '';
  buscador.value = '';
  buscadorCompletadas.value = '';
  cargarTareas();
  // Una sola vez, opcionalmente, trasladar tareas del NOTIX anterior.
  ofrecerImportarTareas();
  mostrarTareas();
  cambiarVista();
}

function ofrecerImportarTareas() {
  if (localStorage.getItem('notix_anteriores_asignadas_v1')) return;
  const antiguas = localStorage.getItem('misTareas');
  if (!antiguas) return;
  try {
    const lista = JSON.parse(antiguas);
    if (!Array.isArray(lista) || !lista.length) return;
    if (confirm('Hay tareas del NOTIX anterior en este navegador. ¿Deseas asignarlas a la cuenta de ' + usuarioActivo.nombre + '?')) {
      tareas = tareas.concat(lista.map(item => ({ ...item, id: Date.now() + Math.floor(Math.random() * 1000000) })));
      guardarTareas();
      localStorage.setItem('notix_anteriores_asignadas_v1', usuarioActivo.id);
    }
  } catch (error) {
    // Si esos datos no son válidos, no se importan.
  }
}

function cerrarSesion() {
  sessionStorage.removeItem(CLAVE_SESION);
  usuarioActivo = null;
  tareas = [];
  limpiarFormulario();
  mensajeFormulario.textContent = '';
  listaTareas.replaceChildren();
  listaCompletadas.replaceChildren();
  document.getElementById('aplicacion').classList.add('oculto');
  document.getElementById('pantallaAcceso').classList.remove('oculto');
  cambiarFormularioAcceso('ingreso');
  window.location.hash = '#pendientes';
  document.getElementById('correoIngreso').focus();
}

document.getElementById('verIngreso').addEventListener('click', () => cambiarFormularioAcceso('ingreso'));
document.getElementById('verRegistro').addEventListener('click', () => cambiarFormularioAcceso('registro'));
document.getElementById('botonSalir').addEventListener('click', cerrarSesion);

document.getElementById('formularioRegistro').addEventListener('submit', async function(evento) {
  evento.preventDefault();
  const nombre = document.getElementById('nombreRegistro').value.trim();
  const correo = document.getElementById('correoRegistro').value.trim().toLowerCase();
  const contrasena = document.getElementById('claveRegistro').value;
  const confirmacion = document.getElementById('confirmarRegistro').value;
  const boton = document.getElementById('botonRegistrar');

  if (!nombre || !correo || !contrasena || !confirmacion) {
    mensajeAcceso('registro', 'Completa todos los campos para registrarte.');
    return;
  }
  if (!correoValido(correo)) {
    mensajeAcceso('registro', 'Escribe un correo válido que incluya @ y un dominio.');
    return;
  }
  if (contrasena.length < 8) {
    mensajeAcceso('registro', 'La contraseña debe tener mínimo 8 caracteres.');
    return;
  }
  if (contrasena !== confirmacion) {
    mensajeAcceso('registro', 'Las contraseñas no coinciden.');
    return;
  }
  if (obtenerUsuarios().some(usuario => usuario.correo === correo)) {
    mensajeAcceso('registro', 'Este correo ya está registrado en este navegador.');
    return;
  }
  if (!crypto.subtle || !crypto.randomUUID) {
    mensajeAcceso('registro', 'Abre NOTIX con Live Server o GitHub Pages para crear cuentas.');
    return;
  }

  boton.disabled = true;
  mensajeAcceso('registro', 'Creando tu cuenta...');
  try {
    const sal = generarSal();
    const hash = await huellaClave(contrasena, sal);
    const usuario = { id: crypto.randomUUID(), nombre, correo, sal, hash };
    // Si otro formulario se envió entre tanto, volver a verificar duplicados.
    const usuarios = obtenerUsuarios();
    if (usuarios.some(item => item.correo === correo)) {
      mensajeAcceso('registro', 'Este correo ya está registrado.');
      return;
    }
    usuarios.push(usuario);
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
    activarUsuario(usuario);
  } catch (error) {
    mensajeAcceso('registro', 'No se pudo crear la cuenta. Prueba con Live Server o GitHub Pages.');
  } finally {
    boton.disabled = false;
  }
});

document.getElementById('formularioIngreso').addEventListener('submit', async function(evento) {
  evento.preventDefault();
  const correo = document.getElementById('correoIngreso').value.trim().toLowerCase();
  const contrasena = document.getElementById('claveIngreso').value;
  const boton = document.getElementById('botonIngresar');

  if (!correo || !contrasena) {
    mensajeAcceso('ingreso', 'Completa el correo y la contraseña.');
    return;
  }
  if (!correoValido(correo)) {
    mensajeAcceso('ingreso', 'Ingresa un correo válido que incluya @ y un dominio.');
    return;
  }
  const usuario = obtenerUsuarios().find(item => item.correo === correo);
  if (!usuario) {
    mensajeAcceso('ingreso', 'Correo o contraseña incorrectos.');
    return;
  }
  boton.disabled = true;
  mensajeAcceso('ingreso', 'Verificando datos...');
  try {
    const hash = await huellaClave(contrasena, usuario.sal);
    if (hash !== usuario.hash) {
      mensajeAcceso('ingreso', 'Correo o contraseña incorrectos.');
      return;
    }
    activarUsuario(usuario);
  } catch (error) {
    mensajeAcceso('ingreso', 'No se pudieron verificar los datos.');
  } finally {
    boton.disabled = false;
  }
});

// Si recargan la pestaña, conservamos la sesión hasta que la cierren.
const idSesion = sessionStorage.getItem(CLAVE_SESION);
const usuarioGuardado = obtenerUsuarios().find(item => item.id === idSesion);
if (usuarioGuardado) activarUsuario(usuarioGuardado);


// MODO OSCURO: recuerda la preferencia de tema en este navegador.
const CLAVE_TEMA = 'notix_tema_preferido';
const botonTema = document.getElementById('botonTema');
const iconoTema = document.getElementById('iconoTema');
const textoTema = document.getElementById('textoTema');

function aplicarTema(tema) {
  const modoOscuro = tema === 'oscuro';
  document.documentElement.dataset.tema = modoOscuro ? 'oscuro' : 'claro';
  iconoTema.textContent = modoOscuro ? '☀️' : '🌙';
  textoTema.textContent = modoOscuro ? 'Modo claro' : 'Modo oscuro';
  botonTema.setAttribute('aria-label', modoOscuro ? 'Activar modo claro' : 'Activar modo oscuro');
  botonTema.setAttribute('aria-pressed', String(modoOscuro));
}

// Al abrir NOTIX, se recupera el último tema elegido.
const temaGuardado = localStorage.getItem(CLAVE_TEMA) || 'claro';
aplicarTema(temaGuardado);

// Al pulsar el botón, se cambia el tema y se guarda la preferencia.
botonTema.addEventListener('click', function() {
  const temaActual = document.documentElement.dataset.tema;
  const nuevoTema = temaActual === 'oscuro' ? 'claro' : 'oscuro';
  aplicarTema(nuevoTema);
  localStorage.setItem(CLAVE_TEMA, nuevoTema);
});

/* RECORDATORIOS DE NO TIX. */

function actualizarRecordatorios() {
  const panel = document.getElementById("recordatoriosNotix");
  if (!panel) return;

  const hoy = fechaEjemplo(0);
  const manana = fechaEjemplo(1);

  const pendientes = tareas.filter(tarea =>
    !tarea.completada &&
    tarea.fecha &&
    tarea.fecha <= manana
  );

  pendientes.sort((a, b) => a.fecha.localeCompare(b.fecha));

  panel.replaceChildren();

  // El aviso de la meta se muestra siempre, haya entregas próximas o no.
  const avance = avanceSemanal();
  const avisoMeta = document.createElement("div");
  avisoMeta.className = "aviso-meta";

  if (avance.cumplida) {
    avisoMeta.classList.add("aviso-meta-cumplida");
    avisoMeta.textContent =
      '🎉 Meta semanal cumplida: ' + avance.completadas +
      ' de ' + avance.meta + ' tareas.';
  } else if (avance.faltan === 1) {
    avisoMeta.textContent = 'Te falta 1 tarea para tu meta semanal.';
  } else {
    avisoMeta.textContent =
      'Te faltan ' + avance.faltan + ' tareas para tu meta semanal.';
  }

  panel.appendChild(avisoMeta);

  if (pendientes.length === 0) {
    const mensaje = document.createElement("p");
    mensaje.textContent = "¡Estás al día! No tienes entregas próximas.";
    panel.appendChild(mensaje);
    return;
  }

  pendientes.forEach(tarea => {
    const aviso = document.createElement("div");
    aviso.className = "aviso-notix";

    const titulo = document.createElement("strong");
    titulo.textContent = tarea.titulo;

    const estado = document.createElement("span");

    if (tarea.fecha < hoy) {
      estado.textContent = "🔴 Tarea vencida";
    } else if (tarea.fecha === hoy) {
      estado.textContent = "🟠 Entrega hoy";
    } else {
      estado.textContent = "🔵 Entrega mañana";
    }

    aviso.append(titulo, estado);
    panel.appendChild(aviso);
  });
}

// Crear la sección de recordatorios
const seccionRecordatorios = document.createElement("section");
seccionRecordatorios.className = "panel panel-recordatorios";

const tituloRecordatorios = document.createElement("h2");
tituloRecordatorios.textContent = "🔔 Recordatorios de entrega";

const contenidoRecordatorios = document.createElement("div");
contenidoRecordatorios.id = "recordatoriosNotix";

seccionRecordatorios.append(
  tituloRecordatorios,
  contenidoRecordatorios
);

// Colocar la sección dentro de la vista de pendientes.
// Queda debajo del tablero y encima del formulario y el listado.
const bloqueColumnas = document.querySelector('.columnas');
const zonaKanban = document.querySelector('.zona-kanban-avance');

if (bloqueColumnas) {
  bloqueColumnas.parentNode.insertBefore(seccionRecordatorios, bloqueColumnas);
} else if (zonaKanban) {
  zonaKanban.insertAdjacentElement('afterend', seccionRecordatorios);
}

// Pintar los avisos con las tareas que ya estén cargadas.
actualizarRecordatorios();

// Revisar periódicamente las fechas
setInterval(actualizarRecordatorios, 60000);

/* PERFIL DEL ESTUDIANTE */

const modalPerfil = document.getElementById("modalPerfil");
const abrirPerfil = document.getElementById("abrirPerfil");
const cerrarPerfil = document.getElementById("cerrarPerfil");
const formularioPerfil = document.getElementById("formularioPerfil");

// Pinta el avance de la meta dentro del perfil.
function mostrarAvanceSemanal() {
  const avance = avanceSemanal();
  const semana = rangoSemana();

  const texto = document.getElementById("perfilMetaTexto");
  const porcentaje = document.getElementById("perfilMetaPorcentaje");
  const barra = document.getElementById("perfilMetaBarra");
  const relleno = document.getElementById("perfilMetaRelleno");
  const rango = document.getElementById("perfilMetaRango");

  if (texto) {
    texto.textContent = avance.cumplida
      ? `🎉 Meta cumplida: ${avance.completadas} de ${avance.meta} tareas`
      : `Meta semanal: ${avance.completadas} de ${avance.meta} tareas`;
  }

  if (porcentaje) porcentaje.textContent = avance.porcentaje + '%';
  if (relleno) relleno.style.width = avance.porcentaje + '%';
  if (barra) barra.setAttribute('aria-valuenow', avance.porcentaje);

  if (rango) {
    rango.textContent =
      'Semana del ' + formatoFecha(semana.inicio) +
      ' al ' + formatoFecha(semana.fin);
  }
}

function mostrarPerfil() {
  if (!usuarioActivo) return;

  document.getElementById("nombrePerfil").value =
    usuarioActivo.nombre;

  document.getElementById("correoPerfil").value =
    usuarioActivo.correo;

  document.getElementById("metaPerfil").value = metaSemanal();

  document.getElementById("perfilCompletadas").textContent =
    tareas.filter(tarea => tarea.completada).length;

  document.getElementById("perfilPendientes").textContent =
    tareas.filter(tarea => !tarea.completada).length;

  mostrarAvanceSemanal();

  document.getElementById("mensajePerfil").textContent = "";

  modalPerfil.classList.remove("oculto");
  document.getElementById("nombrePerfil").focus();
}

abrirPerfil.addEventListener("click", mostrarPerfil);

cerrarPerfil.addEventListener("click", function() {
  modalPerfil.classList.add("oculto");
  abrirPerfil.focus();
});

modalPerfil.addEventListener("click", function(evento) {
  if (evento.target === modalPerfil) {
    modalPerfil.classList.add("oculto");
  }
});

document.addEventListener("keydown", function(evento) {
  if (evento.key === "Escape" &&
      !modalPerfil.classList.contains("oculto")) {
    modalPerfil.classList.add("oculto");
    abrirPerfil.focus();
  }
});

formularioPerfil.addEventListener("submit", function(evento) {
  evento.preventDefault();

  if (!usuarioActivo) return;

  const nombre =
    document.getElementById("nombrePerfil").value.trim();

  const meta =
    Number(document.getElementById("metaPerfil").value);

  if (!nombre || !Number.isInteger(meta) ||
      meta < 1 || meta > 100) {
    document.getElementById("mensajePerfil").textContent =
      "Revisa el nombre y la meta semanal.";
    return;
  }

  const usuarios = obtenerUsuarios();
  const indice = usuarios.findIndex(
    usuario => usuario.id === usuarioActivo.id
  );

  if (indice === -1) return;

  usuarios[indice].nombre = nombre;
  usuarios[indice].metaSemanal = meta;

  localStorage.setItem(
    CLAVE_USUARIOS,
    JSON.stringify(usuarios)
  );

  usuarioActivo = usuarios[indice];

  document.getElementById("usuarioSaludo").textContent =
    "Hola, " + nombre;

  // La nueva meta se refleja de inmediato en el perfil y en los avisos.
  mostrarAvanceSemanal();
  actualizarRecordatorios();

  document.getElementById("mensajePerfil").textContent =
    "✓ Perfil actualizado correctamente";
});
