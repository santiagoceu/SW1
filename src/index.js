// ---------------------------------------------------------------
// SineKerido - Menú principal
// ---------------------------------------------------------------
// Los datos de abajo son de ejemplo (PLACEHOLDER). Cuando tengas
// backend, sustituye PELICULAS y MENUS por una llamada fetch a tu
// API. Si un elemento trae "imagen" (URL), se usa; si no, se genera
// una imagen de relleno con el título.
// ---------------------------------------------------------------

const PELICULAS = [
  { id: "p1", titulo: "Noche de Estrellas", genero: "Aventura", imagen: null, hue: 350 },
  { id: "p2", titulo: "El Último Tren", genero: "Suspense", imagen: null, hue: 210 },
  { id: "p3", titulo: "Risas en Familia", genero: "Comedia", imagen: null, hue: 45 },
  { id: "p4", titulo: "Más Allá del Mar", genero: "Drama", imagen: null, hue: 170 },
  { id: "p5", titulo: "Código Rojo", genero: "Acción", imagen: null, hue: 10 },
  { id: "p6", titulo: "La Casa del Bosque", genero: "Terror", imagen: null, hue: 280 },
];

const MENUS = [
  { id: "m1", titulo: "Menú Clásico", descripcion: "Palomitas medianas y refresco mediano.", precio: 7.5, imagen: null, hue: 30 },
  { id: "m2", titulo: "Menú Pareja", descripcion: "Palomitas grandes, dos refrescos y nachos con queso.", precio: 13.9, imagen: null, hue: 340 },
  { id: "m3", titulo: "Menú Familiar", descripcion: "Dos palomitas grandes, cuatro refrescos y golosinas.", precio: 21.5, imagen: null, hue: 140 },
  { id: "m4", titulo: "Menú Dulce", descripcion: "Palomitas dulces, refresco y chocolatina.", precio: 8.9, imagen: null, hue: 300 },
];

const CLAVE_SESION = "sk_sesion";
const CLAVE_USUARIO = "sk_usuario";
const CLAVE_PEDIDO = "sk_pedido";

const $ = (id) => document.getElementById(id);

// ----- Imagen de relleno (SVG generado) -----
function imagenRelleno(titulo, hue) {
  const inicial = titulo.trim().charAt(0).toUpperCase();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="hsl(${hue},70%,45%)"/>` +
    `<stop offset="1" stop-color="hsl(${(hue + 40) % 360},60%,15%)"/>` +
    `</linearGradient></defs>` +
    `<rect width="200" height="300" fill="url(#g)"/>` +
    `<text x="100" y="175" font-family="Arial, sans-serif" font-size="110" font-weight="700" ` +
    `fill="rgba(255,255,255,0.85)" text-anchor="middle">${inicial}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

// ----- Crear una tarjeta (película = enlace, menú = botón) -----
function crearTarjeta(item, { tipo }) {
  const tarjeta = document.createElement(tipo === "pelicula" ? "a" : "button");
  tarjeta.className = "tarjeta";

  if (tipo === "pelicula") {
    tarjeta.href = "asientos.html?pelicula=" + encodeURIComponent(item.id);
    tarjeta.title = "Elegir asientos para " + item.titulo;
  } else {
    tarjeta.type = "button";
    tarjeta.title = "Ver " + item.titulo;
  }

  const marco = document.createElement("div");
  marco.className = "tarjeta-img";
  const img = document.createElement("img");
  img.src = item.imagen || imagenRelleno(item.titulo, item.hue);
  img.alt = item.titulo;
  img.loading = "lazy";
  marco.appendChild(img);

  const titulo = document.createElement("span");
  titulo.className = "tarjeta-titulo";
  titulo.textContent = item.titulo;

  const sub = document.createElement("span");
  sub.className = "tarjeta-sub";
  sub.textContent = tipo === "pelicula" ? item.genero : formatearPrecio(item.precio);

  tarjeta.append(marco, titulo, sub);
  return tarjeta;
}

function formatearPrecio(valor) {
  return valor.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

// ----- Pintar las listas -----
function pintarListas() {
  const listaPelis = $("lista-peliculas");
  const listaMenus = $("lista-menus");

  PELICULAS.forEach((p) => listaPelis.appendChild(crearTarjeta(p, { tipo: "pelicula" })));

  MENUS.forEach((m) => {
    const tarjeta = crearTarjeta(m, { tipo: "menu" });
    tarjeta.addEventListener("click", () => abrirMenu(m));
    listaMenus.appendChild(tarjeta);
  });
}

// ----- Aviso flotante -----
let temporizadorToast;
function mostrarToast(texto) {
  const toast = $("toast");
  toast.textContent = texto;
  toast.classList.add("visible");
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => toast.classList.remove("visible"), 3000);
}

// ----- Detalle de un menú -----
let menuActual = null;

function abrirMenu(menu) {
  menuActual = menu;
  $("menu-titulo").textContent = menu.titulo;
  $("menu-descripcion").textContent = menu.descripcion;
  $("menu-precio").textContent = formatearPrecio(menu.precio);
  $("dialogo-menu").showModal();
}

$("menu-cerrar").addEventListener("click", () => $("dialogo-menu").close());

$("menu-anadir").addEventListener("click", () => {
  if (!menuActual) return;

  let pedido = [];
  try {
    pedido = JSON.parse(localStorage.getItem(CLAVE_PEDIDO)) || [];
  } catch {}
  pedido.push({ id: menuActual.id, titulo: menuActual.titulo, precio: menuActual.precio });
  localStorage.setItem(CLAVE_PEDIDO, JSON.stringify(pedido));

  $("dialogo-menu").close();
  mostrarToast(menuActual.titulo + " añadido al pedido.");
});

// Cerrar al pulsar fuera de la ventana
$("dialogo-menu").addEventListener("click", (e) => {
  if (e.target === $("dialogo-menu")) $("dialogo-menu").close();
});

// ----- Icono de usuario: login o perfil según la sesión -----
function configurarIconoUsuario() {
  const enlace = $("enlace-usuario");
  const haySesion = !!localStorage.getItem(CLAVE_SESION);

  if (!haySesion) return; // por defecto apunta a login.html

  enlace.href = "perfilusuario.html";
  enlace.title = "Mi perfil";
  enlace.setAttribute("aria-label", "Mi perfil");

  try {
    const usuario = JSON.parse(localStorage.getItem(CLAVE_USUARIO));
    if (usuario && usuario.foto) {
      enlace.style.backgroundImage = `url("${usuario.foto}")`;
      enlace.classList.add("con-foto");
    }
  } catch {}
}

// ----- Inicio -----
pintarListas();
configurarIconoUsuario();
