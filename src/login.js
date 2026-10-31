// ---------------------------------------------------------------
// SineKerido - Login y registro
// ---------------------------------------------------------------
// IMPORTANTE: esto es una SIMULACIÓN sin servidor. Las cuentas se
// guardan en el navegador (localStorage). Cuando tengas backend,
// sustituye registrar() e iniciarSesionConServidor() por llamadas
// reales (fetch) a tu API; la contraseña nunca debe validarse en
// el cliente en una web de verdad.
// ---------------------------------------------------------------

const PAGINA_DESTINO = "perfilusuario.html";
const CLAVE_CUENTAS = "sk_cuentas"; // { "correo": { nombre, hash } }
const CLAVE_SESION = "sk_sesion";   // correo con la sesión iniciada
const CLAVE_USUARIO = "sk_usuario"; // datos que lee perfilusuario.js

const $ = (id) => document.getElementById(id);

const el = {
  form: $("login-form"),
  titulo: $("titulo-formulario"),
  grupoNombre: $("grupo-nombre"),
  grupoPassword2: $("grupo-password2"),
  nombre: $("nombre"),
  email: $("email"),
  password: $("password"),
  password2: $("password2"),
  mensaje: $("mensaje"),
  btnEnviar: $("btn-enviar"),
  textoCambio: $("texto-cambio"),
  enlaceCambio: $("enlace-cambio"),
};

let modoRegistro = false;

// ----- Utilidades -----
async function hashear(texto) {
  if (window.crypto && crypto.subtle) {
    const datos = new TextEncoder().encode(texto);
    const buf = await crypto.subtle.digest("SHA-256", datos);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Alternativa simple si el navegador no ofrece crypto.subtle
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) | 0;
  return "f" + h;
}

function leerCuentas() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_CUENTAS)) || {};
  } catch {
    return {};
  }
}

function guardarCuentas(cuentas) {
  localStorage.setItem(CLAVE_CUENTAS, JSON.stringify(cuentas));
}

function mostrarMensaje(texto, tipo = "error") {
  el.mensaje.textContent = texto;
  el.mensaje.classList.toggle("ok", tipo === "ok");
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ----- Cambiar entre "Iniciar sesión" y "Crear cuenta" -----
function cambiarModo(registro) {
  modoRegistro = registro;
  mostrarMensaje("");

  el.titulo.textContent = registro ? "Crear cuenta" : "Iniciar Sesión";
  el.btnEnviar.textContent = registro ? "Registrarme" : "Entrar";
  el.textoCambio.textContent = registro ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?";
  el.enlaceCambio.textContent = registro ? "Inicia sesión" : "Pulsa aquí";

  el.grupoNombre.hidden = !registro;
  el.grupoPassword2.hidden = !registro;
  el.password.autocomplete = registro ? "new-password" : "current-password";

  if (!registro) {
    el.nombre.value = "";
    el.password2.value = "";
  }
}

el.enlaceCambio.addEventListener("click", (e) => {
  e.preventDefault();
  cambiarModo(!modoRegistro);
});

// ----- Sesión -----
function abrirSesion(email, cuenta) {
  localStorage.setItem(CLAVE_SESION, email);

  // Conserva los datos del perfil si ya eran de este usuario (puntos, foto...)
  let usuario = null;
  try {
    usuario = JSON.parse(localStorage.getItem(CLAVE_USUARIO));
  } catch {}
  if (!usuario || usuario.email !== email) {
    usuario = { nombre: cuenta.nombre, puntos: 0, email, foto: null };
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
  }

  mostrarMensaje("¡Bienvenido/a, " + cuenta.nombre + "! Redirigiendo...", "ok");
  setTimeout(() => (window.location.href = PAGINA_DESTINO), 700);
}

// ----- Registro (sustituir por fetch a tu API) -----
async function registrar(nombre, email, password) {
  const cuentas = leerCuentas();
  if (cuentas[email]) {
    throw new Error("Ya existe una cuenta con ese correo.");
  }
  const cuenta = { nombre, hash: await hashear(email + ":" + password) };
  cuentas[email] = cuenta;
  guardarCuentas(cuentas);
  return cuenta;
}

// ----- Login (sustituir por fetch a tu API) -----
async function iniciarSesionConServidor(email, password) {
  const cuenta = leerCuentas()[email];
  const hash = await hashear(email + ":" + password);
  // Mismo mensaje en ambos casos para no revelar qué correos existen
  if (!cuenta || cuenta.hash !== hash) {
    throw new Error("Correo o contraseña incorrectos.");
  }
  return cuenta;
}

// ----- Envío del formulario -----
el.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  mostrarMensaje("");

  const email = el.email.value.trim().toLowerCase();
  const password = el.password.value;

  if (!emailValido(email)) {
    mostrarMensaje("Introduce un correo válido.");
    el.email.focus();
    return;
  }
  if (!password) {
    mostrarMensaje("Introduce tu contraseña.");
    el.password.focus();
    return;
  }

  el.btnEnviar.disabled = true;
  try {
    if (modoRegistro) {
      const nombre = el.nombre.value.trim();
      if (!nombre) {
        mostrarMensaje("Escribe tu nombre.");
        el.nombre.focus();
        return;
      }
      if (password.length < 6) {
        mostrarMensaje("La contraseña debe tener al menos 6 caracteres.");
        el.password.focus();
        return;
      }
      if (password !== el.password2.value) {
        mostrarMensaje("Las contraseñas no coinciden.");
        el.password2.focus();
        return;
      }
      const cuenta = await registrar(nombre, email, password);
      abrirSesion(email, cuenta);
    } else {
      const cuenta = await iniciarSesionConServidor(email, password);
      abrirSesion(email, cuenta);
    }
  } catch (err) {
    mostrarMensaje(err.message);
    el.password.value = "";
    el.password2.value = "";
  } finally {
    el.btnEnviar.disabled = false;
  }
});
