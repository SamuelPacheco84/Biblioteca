(function () {
  const formulario = document.getElementById("formulario-login");
  const mensajeError = document.getElementById("login-error");

  if (!formulario) {
    return;
  }

  formulario.addEventListener("submit", async function (e) {
    e.preventDefault();

    const usuario = document.getElementById("login-usuario").value.trim();
    const clave = document.getElementById("login-clave").value;
    const boton = formulario.querySelector('button[type="submit"]');

    mensajeError.hidden = true;
    mensajeError.textContent = "";

    if (!usuario || !clave) {
      mensajeError.textContent = "Completa usuario y contraseña.";
      mensajeError.hidden = false;
      return;
    }

    boton.textContent = "Ingresando...";

    const resultado = await Auth.iniciarSesion(usuario, clave);

    if (resultado.ok) {
      window.location.href = resultado.redirect;
      return;
    }

    mensajeError.textContent = resultado.mensaje;
    mensajeError.hidden = false;
    boton.textContent = "Ingresar";
  });
})();
