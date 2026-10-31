// ---------------------------------------------------------------
// SineKerido - Pago
// ---------------------------------------------------------------
// IMPORTANTE: el pago es una SIMULACIÓN. No se envía ni se guarda
// ningún dato de la tarjeta. En una web real el cobro debe hacerse
// con una pasarela (Stripe, Redsys, PayPal...) y nunca manejando los
// datos de la tarjeta directamente. Sustituye procesarPago() por la
// llamada real a tu backend.
// ---------------------------------------------------------------

const PUNTOS_POR_EURO = 10;      // 10 puntos = 1 € de descuento
const PUNTOS_POR_ENTRADA = 1;    // puntos que se ganan por cada entrada

const CLAVE_SESION = "sk_sesion";
const CLAVE_USUARIO = "sk_usuario";
const CLAVE_PEDIDO = "sk_pedido";     // menús (los añade index.js)
const CLAVE_ENTRADAS = "sk_entradas"; // asientos (los guarda asientos.js)

const $ = (id) => document.getElementById(id);

// Todos los importes se manejan en céntimos para evitar errores de decimales
const aCentimos = (euros) => Math.round(euros * 100);
const formatear = (centimos) =>
  (centimos / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

// ----- Leer datos guardados -----
function leerJSON(clave, porDefecto) {
  try {
    const valor = JSON.parse(localStorage.getItem(clave));
    return valor ?? porDefecto;
  } catch {
    return porDefecto;
  }
}

const entradas = leerJSON(CLAVE_ENTRADAS, null); // { pelicula, asientos:[{row,col}], precio }
const menus = leerJSON(CLAVE_PEDIDO, []);        // [{ id, titulo, precio }]
const haySesion = !!localStorage.getItem(CLAVE_SESION);
const usuario = haySesion ? leerJSON(CLAVE_USUARIO, null) : null;
const puntosDisponibles = usuario && Number.isFinite(usuario.puntos) ? usuario.puntos : 0;

// ----- Líneas del pedido -----
function construirLineas() {
  const lineas = [];

  if (entradas && Array.isArray(entradas.asientos) && entradas.asientos.length > 0) {
    const n = entradas.asientos.length;
    const unidad = aCentimos(entradas.precio);
    lineas.push({
      texto: `Entradas × ${n}`,
      detalle: entradas.asientos.map((a) => `F${a.row}-A${a.col}`).join(", "),
      importe: n * unidad,
    });
  }

  const agrupados = {};
  menus.forEach((m) => {
    if (!agrupados[m.id]) agrupados[m.id] = { titulo: m.titulo, unidad: aCentimos(m.precio), n: 0 };
    agrupados[m.id].n += 1;
  });
  Object.values(agrupados).forEach((g) => {
    lineas.push({ texto: `${g.titulo} × ${g.n}`, detalle: "", importe: g.n * g.unidad });
  });

  return lineas;
}

const lineas = construirLineas();
const subtotal = lineas.reduce((suma, l) => suma + l.importe, 0);
const numEntradas = entradas && entradas.asientos ? entradas.asientos.length : 0;

// ----- Puntos: cálculo del descuento -----
function calcularDescuento() {
  if (!$("usar-puntos").checked || puntosDisponibles <= 0) return { puntos: 0, centimos: 0 };
  const centimosPorPunto = 100 / PUNTOS_POR_EURO; // 10 céntimos
  const maxPuntosUtiles = Math.floor(subtotal / centimosPorPunto);
  const puntos = Math.min(puntosDisponibles, maxPuntosUtiles);
  return { puntos, centimos: puntos * centimosPorPunto };
}

// ----- Pintar precio y resumen (se llama al marcar "Usar mis puntos") -----
function recalcular() {
  const descuento = calcularDescuento();
  const total = subtotal - descuento.centimos;

  const lista = $("resumen");
  lista.textContent = "";

  lineas.forEach((l) => {
    const li = document.createElement("li");
    const izq = document.createElement("span");
    izq.textContent = l.texto;
    if (l.detalle) {
      const small = document.createElement("small");
      small.textContent = l.detalle;
      izq.appendChild(small);
    }
    const der = document.createElement("span");
    der.textContent = formatear(l.importe);
    li.append(izq, der);
    lista.appendChild(li);
  });

  if (descuento.centimos > 0) {
    const li = document.createElement("li");
    li.className = "descuento";
    const izq = document.createElement("span");
    izq.textContent = `Descuento (${descuento.puntos} puntos)`;
    const der = document.createElement("span");
    der.textContent = "− " + formatear(descuento.centimos);
    li.append(izq, der);
    lista.appendChild(li);
  }

  $("precio").textContent = formatear(total);
  $("btn-total").textContent = "· " + formatear(total);
}

// ----- Estado inicial de la parte de puntos -----
function prepararPuntos() {
  $("puntos").textContent = puntosDisponibles;
  const casilla = $("usar-puntos");
  const nota = $("nota-puntos");

  if (!haySesion) {
    casilla.disabled = true;
    nota.textContent = "Inicia sesión para usar tus puntos.";
  } else if (puntosDisponibles <= 0) {
    casilla.disabled = true;
    nota.textContent = "Todavía no tienes puntos disponibles.";
  } else {
    nota.textContent = `${PUNTOS_POR_EURO} puntos = 1 € de descuento.`;
  }
}

// ----- Mensajes -----
function mostrarMensaje(texto) {
  $("mensaje").textContent = texto;
}

// ----- Formato de los campos mientras se escribe -----
$("tarjeta").addEventListener("input", (e) => {
  const digitos = e.target.value.replace(/\D/g, "").slice(0, 19);
  e.target.value = digitos.replace(/(.{4})/g, "$1 ").trim();
});

$("caducidad").addEventListener("input", (e) => {
  let digitos = e.target.value.replace(/\D/g, "").slice(0, 4);
  if (digitos.length >= 3) digitos = digitos.slice(0, 2) + "/" + digitos.slice(2);
  e.target.value = digitos;
});

$("cvv").addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
});

// ----- Validaciones -----
function luhnValido(numero) {
  let suma = 0;
  let doble = false;
  for (let i = numero.length - 1; i >= 0; i--) {
    let d = Number(numero[i]);
    if (doble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    suma += d;
    doble = !doble;
  }
  return suma % 10 === 0;
}

function caducidadValida(texto) {
  const m = /^(\d{2})\/(\d{2})$/.exec(texto);
  if (!m) return false;
  const mes = Number(m[1]);
  const anio = 2000 + Number(m[2]);
  if (mes < 1 || mes > 12) return false;
  const hoy = new Date();
  return anio > hoy.getFullYear() || (anio === hoy.getFullYear() && mes >= hoy.getMonth() + 1);
}

function validarTarjeta() {
  const numero = $("tarjeta").value.replace(/\s/g, "");
  if (numero.length < 13 || numero.length > 19 || !luhnValido(numero)) {
    $("tarjeta").focus();
    return "El número de tarjeta no es válido.";
  }
  if (!caducidadValida($("caducidad").value)) {
    $("caducidad").focus();
    return "La fecha de caducidad no es válida o la tarjeta ha caducado.";
  }
  if ($("nombre").value.trim().length < 2) {
    $("nombre").focus();
    return "Escribe el nombre del titular.";
  }
  if (!/^\d{3,4}$/.test($("cvv").value)) {
    $("cvv").focus();
    return "El código CVV debe tener 3 o 4 dígitos.";
  }
  return null;
}

// ----- Pago (sustituir por la llamada real a tu backend / pasarela) -----
function procesarPago() {
  return new Promise((resolve) => setTimeout(resolve, 900));
}

function generarReferencia() {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return "SK-" + Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join("");
}

// ----- Envío del formulario -----
$("form-pago").addEventListener("submit", async (e) => {
  e.preventDefault();
  mostrarMensaje("");

  if (subtotal <= 0) {
    mostrarMensaje("No hay nada en tu pedido.");
    return;
  }

  const descuento = calcularDescuento();
  const total = subtotal - descuento.centimos;

  // Si los puntos cubren todo el importe no hace falta tarjeta
  if (total > 0) {
    const error = validarTarjeta();
    if (error) {
      mostrarMensaje(error);
      return;
    }
  }

  const boton = $("btn-pagar");
  boton.disabled = true;
  try {
    await procesarPago();

    // Actualizar puntos del usuario: se restan los usados y se suman los ganados
    const ganados = numEntradas * PUNTOS_POR_ENTRADA;
    if (usuario) {
      usuario.puntos = puntosDisponibles - descuento.puntos + ganados;
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    }

    // Vaciar el pedido y borrar los datos de la tarjeta de los campos
    localStorage.removeItem(CLAVE_PEDIDO);
    localStorage.removeItem(CLAVE_ENTRADAS);
    $("form-pago").reset();

    mostrarConfirmacion(total, descuento.puntos, ganados);
  } catch {
    mostrarMensaje("No se ha podido completar el pago. Inténtalo de nuevo.");
  } finally {
    boton.disabled = false;
  }
});

function mostrarConfirmacion(total, puntosUsados, puntosGanados) {
  let texto = `Has pagado ${formatear(total)}.`;
  if (puntosUsados > 0) texto += ` Has canjeado ${puntosUsados} puntos.`;
  if (puntosGanados > 0 && haySesion) texto += ` Has ganado ${puntosGanados} puntos.`;

  $("confirmacion-texto").textContent = texto;
  $("confirmacion-ref").textContent = generarReferencia();
  $("seccion-pago").hidden = true;
  $("confirmacion").hidden = false;
}

// ----- Marcar / desmarcar "Usar mis puntos" recalcula el precio -----
$("usar-puntos").addEventListener("change", recalcular);

// ----- Inicio -----
prepararPuntos();
recalcular();

if (subtotal <= 0) {
  mostrarMensaje("Tu pedido está vacío. Elige asientos o un menú desde el menú principal.");
  $("btn-pagar").disabled = true;
}
