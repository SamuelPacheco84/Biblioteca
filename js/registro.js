(function () {
  const formulario = document.getElementById("formulario-registro");
  const alertaExito = document.getElementById("registro-exito");
  const linkVolver = document.querySelector(".login-volver");
  const botonesOjo = document.querySelectorAll("[data-toggle-password]");

  botonesOjo.forEach(function (boton) {
    boton.addEventListener("click", function () {
      const inputId = boton.getAttribute("data-toggle-password");
      const input = document.getElementById(inputId);

      if (!input) {
        return;
      }

      const visible = input.type === "text";
      input.type = visible ? "password" : "text";

      const icono = boton.querySelector("i");
      if (icono) {
        icono.className = visible ? "fi fi-rr-eye" : "fi fi-rr-eye-crossed";
      }

      boton.setAttribute(
        "aria-label",
        visible ? "Mostrar contraseña" : "Ocultar contraseña"
      );
    });
  });

  function usuarioDesdeCorreo(correo) {
    const parte = correo.split("@")[0] || "usuario";
    return parte.replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase() || "usuario";
  }

  if (formulario && alertaExito) {
    formulario.addEventListener("submit", function (e) {
      e.preventDefault();

      const nombre = document.getElementById("registro-nombre").value.trim();
      const correo = document.getElementById("registro-correo").value.trim();
      const clave = document.getElementById("registro-clave").value;
      const clave2 = document.getElementById("registro-clave2").value;

      if (clave !== clave2) {
        alert("Las contraseñas no coinciden.");
        return;
      }

      if (typeof DatosUsuarios !== "undefined") {
        const resultado = DatosUsuarios.registrarUsuario({
          nombre: nombre,
          correo: correo,
          clave: clave,
          usuario: usuarioDesdeCorreo(correo),
        });

        if (!resultado.ok) {
          alert(resultado.mensaje);
          return;
        }
      }

      formulario.hidden = true;
      if (linkVolver) {
        linkVolver.hidden = true;
      }
      alertaExito.hidden = false;
    });
  }
})();
