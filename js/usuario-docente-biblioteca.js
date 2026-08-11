(function () {
  const bloque = document.getElementById("bloque-biblioteca-docente");
  const formulario = document.getElementById("formulario-biblioteca-docente");
  const estado = document.getElementById("estado-solicitud-biblioteca");

  if (!bloque || typeof Auth === "undefined") {
    return;
  }

  const sesion = Auth.obtenerSesion();
  const esDocente =
    sesion &&
    (sesion.usuario === "docente" ||
      (sesion.nombre && sesion.nombre.toLowerCase().includes("docente")));

  if (!esDocente) {
    return;
  }

  bloque.hidden = false;

  if (!formulario) {
    return;
  }

  formulario.addEventListener("submit", function (e) {
    e.preventDefault();

    const reservaCompleta = document.getElementById("reservar-toda-biblioteca").checked;
    const fecha = document.getElementById("fecha-biblioteca-docente").value;
    const sillas = document.getElementById("cantidad-sillas").value;
    const necesidades = document.getElementById("otras-necesidades").value.trim();

    if (!reservaCompleta) {
      alert("Marca la opción de reservar toda la biblioteca para enviar la solicitud.");
      return;
    }

    if (!fecha || !sillas) {
      alert("Completa la fecha, hora y la cantidad de sillas.");
      return;
    }

    if (!sesion.correo) {
      alert("Tu cuenta no tiene correo registrado.");
      return;
    }

    Solicitudes.agregar({
      tipo: "biblioteca_docente",
      nombreUsuario: sesion.nombre,
      usuario: sesion.usuario,
      correo: sesion.correo,
      fechaEvento: fecha,
      cantidadSillas: Number(sillas),
      necesidades: necesidades,
      reservaCompleta: true,
    });

    if (estado) {
      estado.hidden = false;
      estado.textContent =
        "Solicitud enviada al administrador. Recibirás respuesta por correo institucional.";
    }

    if (typeof window.actualizarMisReservas === "function") {
      window.actualizarMisReservas();
    }

    formulario.reset();
  });
})();
