(function () {
  const formEspacio = document.getElementById("formulario-reserva-espacio");
  const listaMisReservas = document.getElementById("lista-mis-reservas");
  const vacioMisReservas = document.getElementById("mis-reservas-vacio");

  function renderMisReservas() {
    if (!listaMisReservas || typeof Auth === "undefined" || typeof Solicitudes === "undefined") {
      return;
    }

    const sesion = Auth.obtenerSesion();
    if (!sesion) {
      return;
    }

    const solicitudes = Solicitudes.obtenerPorUsuario(sesion.usuario);
    listaMisReservas.innerHTML = "";

    if (solicitudes.length === 0) {
      if (vacioMisReservas) {
        vacioMisReservas.hidden = false;
      }
      return;
    }

    if (vacioMisReservas) {
      vacioMisReservas.hidden = true;
    }

    solicitudes.forEach(function (s) {
      const li = document.createElement("li");
      li.className = "item-mis-reservas";
      li.innerHTML =
        "<strong>" +
        Solicitudes.etiquetaTipo(s.tipo) +
        '</strong> <span class="badge-estado badge-estado--' +
        s.estado +
        '">' +
        s.estado +
        "</span>" +
        "<p>" +
        Solicitudes.resumenDetalle(s) +
        "</p>" +
        (s.motivoRechazo
          ? '<p class="item-mis-reservas__rechazo"><strong>Motivo:</strong> ' +
            s.motivoRechazo +
            "</p>"
          : "");
      listaMisReservas.appendChild(li);
    });
  }

  window.actualizarMisReservas = renderMisReservas;

  if (formEspacio) {
    formEspacio.addEventListener("submit", function (e) {
      e.preventDefault();

      const sesion = Auth.obtenerSesion();
      const espacio = document.getElementById("espacio").value;
      const fecha = document.getElementById("fecha-reserva").value;
      const docente = document.getElementById("docente").value.trim();

      if (!espacio) {
        alert("Selecciona un espacio disponible.");
        return;
      }

      if (!fecha) {
        alert("Indica fecha y hora de la reserva.");
        return;
      }

      if (!sesion || !sesion.correo) {
        alert("Tu cuenta no tiene correo registrado.");
        return;
      }

      Solicitudes.agregar({
        tipo: "espacio",
        nombreUsuario: sesion.nombre,
        usuario: sesion.usuario,
        correo: sesion.correo,
        espacio: espacio,
        fechaEvento: fecha,
        docenteResponsable: docente,
      });

      alert("Solicitud de espacio enviada al administrador.");
      formEspacio.reset();
      renderMisReservas();
    });
  }

  renderMisReservas();
})();
