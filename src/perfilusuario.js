// ---------------------------------------------------------------
// SineKerido - Menú de usuario
// ---------------------------------------------------------------
// Ahora mismo los datos del usuario son de ejemplo. Cuando tengas
// backend, sustituye cargarUsuario(), restablecerPassword() y
// borrarCuenta() por llamadas reales (fetch) a tu API.
// ---------------------------------------------------------------

const POLITICA_PUNTOS =
  "(Ganas 1 punto por cada entrada comprada y puedes canjear 10 puntos por un descuento.)";

const $ = (id) => document.getElementById(id);

const el = {
  foto: $("foto"),
  inputFoto: $("inputFoto"),
  nombre: $("nombre"),
  puntos: $("puntos"),
  politica: $("politica"),
  email: $("email"),
  btnPassword: $("btnPassword"),
  btnBorrar: $("btnBorrar"),
  aviso: $("aviso"),
  dialogo: $("dialogo"),
  dialogoTexto: $("dialogoTexto"),
  dialogoAceptar: $("dialogoAceptar"),
  dialogoCancelar: $("dialogoCancelar"),
};

// ----- Datos del usuario (simulados) -----
function cargarUsuario() {
  const guardado = localStorage.getItem("sk_usuario");
  if (guardado) return JSON.parse(guardado);
  return {
    nombre: "MariaAntonia",
    puntos: 120,
    email: "mariaantonia@gmail.com",
    foto: null, // dataURL de la imagen, o null
  };
}

function guardarUsuario() {
  localStorage.setItem("sk_usuario", JSON.stringify(usuario));
}

let usuario = cargarUsuario();

// ----- Pintar en pantalla -----
function pintar() {
  el.nombre.textContent = usuario.nombre;
  el.puntos.textContent = usuario.puntos;
  el.politica.textContent = POLITICA_PUNTOS;
  el.email.textContent = usuario.email;

  if (usuario.foto) {
    el.foto.style.backgroundImage = `url("${usuario.foto}")`;
    el.foto.classList.add("con-imagen");
  } else {
    el.foto.style.backgroundImage = "";
    el.foto.classList.remove("con-imagen");
  }
}

// ----- Avisos temporales -----
let temporizadorAviso;
function mostrarAviso(texto, esError = false) {
  el.aviso.textContent = texto;
  el.aviso.style.color = esError ? "#b00020" : "#0a6b2d";
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => (el.aviso.textContent = ""), 5000);
}

// ----- Ventana de confirmación (devuelve una promesa) -----
function confirmar(texto) {
  return new Promise((resolve) => {
    el.dialogoTexto.textContent = texto;
    el.dialogo.showModal();

    const cerrar = (resultado) => {
      el.dialogo.close();
      el.dialogoAceptar.onclick = null;
      el.dialogoCancelar.onclick = null;
      el.dialogo.oncancel = null;
      resolve(resultado);
    };

    el.dialogoAceptar.onclick = () => cerrar(true);
    el.dialogoCancelar.onclick = () => cerrar(false);
    el.dialogo.oncancel = () => cerrar(false); // tecla Esc
  });
}

// ----- Foto opcional -----
el.foto.addEventListener("click", () => el.inputFoto.click());

el.inputFoto.addEventListener("change", () => {
  const archivo = el.inputFoto.files[0];
  if (!archivo) return;

  if (!archivo.type.startsWith("image/")) {
    mostrarAviso("El archivo seleccionado no es una imagen.", true);
    return;
  }
  if (archivo.size > 2 * 1024 * 1024) {
    mostrarAviso("La imagen no puede superar los 2 MB.", true);
    return;
  }

  const lector = new FileReader();
  lector.onload = () => {
    usuario.foto = lector.result;
    try {
      guardarUsuario();
    } catch {
      mostrarAviso("No se pudo guardar la foto (imagen demasiado grande).", true);
    }
    pintar();
  };
  lector.readAsDataURL(archivo);
});

// ----- Restablecer contraseña -----
async function restablecerPassword() {
  const ok = await confirmar(
    `Te enviaremos un correo a ${usuario.email} para restablecer tu contraseña. ¿Continuar?`
  );
  if (!ok) return;

  // TODO: reemplazar por la llamada real a tu backend, por ejemplo:
  // await fetch("/api/restablecer-password", { method: "POST" });
  mostrarAviso(`Correo de restablecimiento enviado a ${usuario.email}.`);
}

// ----- Borrar cuenta -----
async function borrarCuenta() {
  const ok = await confirmar(
    "¿Seguro que quieres borrar tu cuenta? Perderás tus puntos y esta acción no se puede deshacer."
  );
  if (!ok) return;

  // TODO: reemplazar por la llamada real a tu backend, por ejemplo:
  // await fetch("/api/cuenta", { method: "DELETE" });
  localStorage.removeItem("sk_usuario");
  document.body.innerHTML =
    '<p style="text-align:center;margin-top:3rem;font-size:1.3rem">' +
    "Tu cuenta ha sido borrada. ¡Hasta pronto!</p>";
}

el.btnPassword.addEventListener("click", restablecerPassword);
el.btnBorrar.addEventListener("click", borrarCuenta);

// ----- Inicio -----
pintar();