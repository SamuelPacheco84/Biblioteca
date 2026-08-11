(function () {
  const tbody = document.getElementById("tabla-solicitudes-admin");
  const vacio = document.getElementById("solicitudes-admin-vacio");
  const statPendientes = document.getElementById("stat-reservas-pendientes");
  const statCards = document.querySelectorAll(".stat-card__valor");
  const statPrestamosHoy = document.getElementById("stat-prestamos");
  const statEspacios = document.getElementById("stat-espacios");
  const statLibros = document.getElementById("stat-libros");
  const modal = document.getElementById("modal-rechazo");
  const formRechazo = document.getElementById("form-rechazo-solicitud");
  const motivoInput = document.getElementById("motivo-rechazo");
  const btnCerrarModal = document.getElementById("cerrar-modal-rechazo");

  let solicitudRechazoId = null;

  if (!tbody || typeof Solicitudes === "undefined") {
    return;
  }

  function escapeHtml(texto) {
    return String(texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function abrirModalRechazo(id) {
    solicitudRechazoId = id;
    if (motivoInput) {
      motivoInput.value = "";
    }
    if (modal) {
      modal.hidden = false;
    }
  }

  function cerrarModal() {
    solicitudRechazoId = null;
    if (modal) {
      modal.hidden = true;
    }
  }

  async function procesarAprobacion(id) {
    const previa = Solicitudes.obtenerPorId(id);
    if (!previa) {
      return;
    }

    let solicitud = previa;

    if (previa.tipo === "libro" && typeof Prestamos !== "undefined") {
      const resultadoLibro = Prestamos.aprobarReservaLibro(id);
      if (!resultadoLibro.ok) {
        alert(resultadoLibro.mensaje);
        return;
      }
      solicitud = resultadoLibro.solicitud;
    } else {
      solicitud = Solicitudes.actualizar(id, {
        estado: "aprobada",
        fechaRespuesta: new Date().toISOString(),
      });
    }

    if (!solicitud) {
      return;
    }

    try {
      const resultado = await EnvioCorreo.enviarAprobacion(solicitud);
      if (resultado.aviso) {
        alert(resultado.aviso);
      } else {
        alert("Solicitud aprobada y correo enviado a " + solicitud.correo);
      }
    } catch (err) {
      alert("Solicitud aprobada, pero no se pudo enviar el correo: " + err.message);
    }

    renderizar();
  }

  function procesarEliminacion(id) {
    const eliminada = Solicitudes.eliminar(id);
    if (!eliminada) {
      return;
    }
    renderizar();
  }

  async function procesarRechazo(id, motivo) {
    const solicitud = Solicitudes.actualizar(id, {
      estado: "rechazada",
      motivoRechazo: motivo,
      fechaRespuesta: new Date().toISOString(),
    });
    if (!solicitud) {
      return;
    }

    try {
      const resultado = await EnvioCorreo.enviarRechazo(solicitud, motivo);
      if (resultado.aviso) {
        alert(resultado.aviso);
      } else {
        alert("Solicitud rechazada y correo enviado a " + solicitud.correo);
      }
    } catch (err) {
      alert("Solicitud rechazada, pero no se pudo enviar el correo: " + err.message);
    }

    renderizar();
  }

  function renderizar() {
    const solicitudes = Solicitudes.obtenerTodas();
    const pendientes = Solicitudes.contarPendientes();
    // ======== Estadísticas del panel ========

// Préstamos realizados hoy
const hoy = new Date().toDateString();

const prestamosHoy = solicitudes.filter(function (s) {
  return (
    s.tipo === "libro" &&
    s.estado === "aprobada" &&
    new Date(s.fechaRespuesta).toDateString() === hoy
  );
}).length;

// Espacios ocupados
const espaciosOcupados = solicitudes.filter(function (s) {
  return (
    s.tipo === "espacio" &&
    s.estado === "aprobada"
  );
}).length;

// Libros disponibles
let librosDisponibles = 0;

if (typeof DatosLibros !== "undefined") {
  DatosLibros.obtenerCatalogo().forEach(function(libro){
    librosDisponibles += Number(libro.disponibles || 0);
  });
}

// Actualizar tarjetas
if (statPrestamosHoy) {
  statPrestamosHoy.textContent = prestamosHoy;
}

if (statEspacios) {
  statEspacios.textContent = espaciosOcupados;
}

if (statLibros) {
  statLibros.textContent = librosDisponibles;
}

    if (statPendientes) {
      statPendientes.textContent = String(pendientes);
    }

    tbody.innerHTML = "";

    if (solicitudes.length === 0) {
      if (vacio) {
        vacio.hidden = false;
      }
      return;
    }

    if (vacio) {
      vacio.hidden = true;
    }

    solicitudes.forEach(function (s) {
      const fila = document.createElement("tr");
      const acciones =
        s.estado === "pendiente"
          ? '<button type="button" class="boton boton--primario btn-mini" data-aprobar="' +
            s.id +
            '">Aprobar</button> ' +
            '<button type="button" class="boton boton--secundario btn-mini" data-rechazar="' +
            s.id +
            '">Rechazar</button>'
          : '<span class="texto-suave">—</span>';

      fila.innerHTML =
        "<td>" +
        escapeHtml(Solicitudes.etiquetaTipo(s.tipo)) +
        "</td>" +
        "<td>" +
        escapeHtml(s.nombreUsuario || "—") +
        "</td>" +
        "<td>" +
        escapeHtml(s.correo || "—") +
        "</td>" +
        "<td>" +
        escapeHtml(Solicitudes.resumenDetalle(s)) +
        "</td>" +
        "<td>" +
        escapeHtml(Solicitudes.formatearFecha(s.fechaSolicitud)) +
        "</td>" +
        '<td><span class="badge-estado badge-estado--' +
        s.estado +
        '">' +
        s.estado +
        "</span></td>" +
        "<td class=\"celda-acciones\">" +
        acciones +
        "</td>" +
        "<td class=\"celda-acciones\">" +
        '<button type="button" class="btn-eliminar" data-eliminar="' +
        s.id +
        '" title="Eliminar solicitud" aria-label="Eliminar solicitud">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>' +
        "</button>" +
        "</td>";
      tbody.appendChild(fila);
    });

    tbody.querySelectorAll("[data-aprobar]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = Number(btn.getAttribute("data-aprobar"));
        if (confirm("¿Aprobar esta solicitud y enviar correo al usuario?")) {
          procesarAprobacion(id);
        }
      });
    });

    tbody.querySelectorAll("[data-rechazar]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        abrirModalRechazo(Number(btn.getAttribute("data-rechazar")));
      });
    });

    tbody.querySelectorAll("[data-eliminar]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = Number(btn.getAttribute("data-eliminar"));
        if (confirm("¿Eliminar esta solicitud de forma permanente?")) {
          procesarEliminacion(id);
        }
      });
    });
  }

  if (formRechazo) {
    formRechazo.addEventListener("submit", async function (e) {
      e.preventDefault();
      const motivo = motivoInput ? motivoInput.value.trim() : "";
      if (!motivo) {
        alert("Escribe el motivo del rechazo.");
        return;
      }
      if (!solicitudRechazoId) {
        return;
      }
      await procesarRechazo(solicitudRechazoId, motivo);
      cerrarModal();
    });
  }

  if (btnCerrarModal) {
    btnCerrarModal.addEventListener("click", cerrarModal);
  }

  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        cerrarModal();
      }
    });
  }

  renderizar();
})();
