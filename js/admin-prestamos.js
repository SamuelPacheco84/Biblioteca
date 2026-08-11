(function () {
  const formConfig = document.getElementById("form-config-prestamos");
  const estadoConfig = document.getElementById("estado-config-prestamos");
  const tbodyPrestamos = document.getElementById("tabla-prestamos-activos");
  const vacioPrestamos = document.getElementById("prestamos-activos-vacio");
  const tbodyMultas = document.getElementById("tabla-multas-activas");
  const vacioMultas = document.getElementById("multas-activas-vacio");

  let intervalo = null;

  function cargarConfigEnFormulario() {
    const c = ConfigPrestamos.obtener();
    document.getElementById("prestamo-dias").value = c.prestamoDias;
    document.getElementById("prestamo-horas").value = c.prestamoHoras;
    document.getElementById("prestamo-minutos").value = c.prestamoMinutos;
    document.getElementById("prestamo-segundos").value = c.prestamoSegundos;
    document.getElementById("multa-dias").value = c.multaDias;
    document.getElementById("multa-horas").value = c.multaHoras;
    document.getElementById("multa-minutos").value = c.multaMinutos;
    document.getElementById("multa-segundos").value = c.multaSegundos;
  }

  function renderPrestamosActivos() {
    if (!tbodyPrestamos) {
      return;
    }

    const prestamos = Prestamos.obtenerPrestamosLibrosActivos();
    tbodyPrestamos.innerHTML = "";

    if (prestamos.length === 0) {
      if (vacioPrestamos) {
        vacioPrestamos.hidden = false;
      }
      return;
    }

    if (vacioPrestamos) {
      vacioPrestamos.hidden = true;
    }

    prestamos.forEach(function (p) {
      const vencido = Prestamos.estaVencido(p);
      const multaUsuario = Multas.obtenerMultaActiva(p.usuario);
      const fila = document.createElement("tr");

let estadoTexto = "En préstamo";

if (p.devuelto) {
  estadoTexto = '<span class="estado-devuelto">Devuelto</span>';
} else if (p.enMulta || multaUsuario) {
  estadoTexto = "Con multa activa";
} else if (vencido) {
  estadoTexto = "Vencido — sin devolver";
}

let acciones = "";

if (!p.devuelto) {
  acciones =
    '<button type="button" class="boton boton--primario btn-mini" data-devolver="' +
    p.id +
    '">Ya devolvió</button>';

  if (vencido && !multaUsuario && !p.enMulta) {
    acciones +=
      ' <button type="button" class="boton btn-multa btn-mini" data-multa="' +
      p.id +
      '">Multa</button>';
  }
}
      fila.innerHTML =
        "<td>" +
        (p.nombreUsuario || p.usuario) +
        "</td>" +
        "<td>" +
        (p.libroTitulo || "—") +
        "</td>" +
        "<td>" +
        Solicitudes.formatearFecha(p.fechaLimiteDevolucion) +
        "</td>" +
        "<td>" +
        estadoTexto +
        "</td>" +
        '<td class="celda-acciones">' +
        acciones +
        "</td>";
      tbodyPrestamos.appendChild(fila);
    });

    tbodyPrestamos.querySelectorAll("[data-devolver]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = Number(btn.getAttribute("data-devolver"));
        const r = Prestamos.marcarDevuelto(id);
        if (r.ok) {
          alert("Libro marcado como devuelto. Se sumó un ejemplar al catálogo.");
          renderPrestamosActivos();
          renderMultasActivas();
        } else {
          alert(r.mensaje);
        }
      });
    });

    tbodyPrestamos.querySelectorAll("[data-multa]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = Number(btn.getAttribute("data-multa"));
        if (
          !confirm(
            "¿Aplicar multa a este usuario? No podrá reservar libros hasta que termine el tiempo de multa."
          )
        ) {
          return;
        }
        const r = Prestamos.aplicarMulta(id);
        if (r.ok) {
          alert("Multa aplicada correctamente.");
          renderPrestamosActivos();
          renderMultasActivas();
        } else {
          alert(r.mensaje);
        }
      });
    });
  }

  function renderMultasActivas() {
    if (!tbodyMultas) {
      return;
    }

    Multas.limpiarExpiradas();
    const multas = Multas.obtenerTodas().filter(function (m) {
      return Multas.tiempoRestante(m).totalMs > 0;
    });

    tbodyMultas.innerHTML = "";

    if (multas.length === 0) {
      if (vacioMultas) {
        vacioMultas.hidden = false;
      }
      return;
    }

    if (vacioMultas) {
      vacioMultas.hidden = true;
    }

    multas.forEach(function (m) {
      const t = Multas.tiempoRestante(m);
      const fila = document.createElement("tr");
      fila.innerHTML =
        "<td>" +
        (m.nombreUsuario || m.usuario) +
        "</td>" +
        "<td>" +
        (m.libroTitulo || "—") +
        "</td>" +
        "<td>" +
        Solicitudes.formatearFecha(m.fechaFin) +
        "</td>" +
        "<td class=\"celda-tiempo-multa\" data-multa-id=\"" +
        m.id +
        "\">" +
        t.dias +
        " d " +
        t.horas +
        " h " +
        t.minutos +
        " m " +
        t.segundos +
        " s</td>";
      tbodyMultas.appendChild(fila);
    });
  }

  function actualizarTodo() {
    renderPrestamosActivos();
    renderMultasActivas();
  }

  if (formConfig) {
    cargarConfigEnFormulario();
    formConfig.addEventListener("submit", function (e) {
      e.preventDefault();
      ConfigPrestamos.guardar({
        prestamoDias: document.getElementById("prestamo-dias").value,
        prestamoHoras: document.getElementById("prestamo-horas").value,
        prestamoMinutos: document.getElementById("prestamo-minutos").value,
        prestamoSegundos: document.getElementById("prestamo-segundos").value,
        multaDias: document.getElementById("multa-dias").value,
        multaHoras: document.getElementById("multa-horas").value,
        multaMinutos: document.getElementById("multa-minutos").value,
        multaSegundos: document.getElementById("multa-segundos").value,
      });
      if (estadoConfig) {
        estadoConfig.hidden = false;
        estadoConfig.textContent = "Tiempos guardados correctamente.";
      }
    });
  }

  actualizarTodo();
  intervalo = setInterval(actualizarTodo, 1000);

  window.addEventListener("beforeunload", function () {
    if (intervalo) {
      clearInterval(intervalo);
    }
  });
})();
