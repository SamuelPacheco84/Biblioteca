(function () {
  const formulario = document.getElementById("form-agregar-libro");
  const tbody = document.getElementById("tabla-catalogo-admin");
  const vacio = document.getElementById("catalogo-admin-vacio");

  if (!formulario || !tbody || typeof DatosLibros === "undefined") {
    return;
  }

  function renderizarTabla() {
    const catalogo = DatosLibros.obtenerCatalogo();
    tbody.innerHTML = "";

    if (catalogo.length === 0) {
      if (vacio) {
        vacio.hidden = false;
      }
      return;
    }

    if (vacio) {
      vacio.hidden = true;
    }

    catalogo.forEach(function (libro) {
      const disponible = DatosLibros.estaDisponibleParaPrestamo(libro);

      const fila = document.createElement("tr");

      fila.innerHTML =
        "<td>" +
        libro.titulo +
        "</td>" +
        "<td>" +
        libro.autor +
        "</td>" +
        "<td>" +
        libro.anio +
        "</td>" +
        "<td>" +
        libro.disponibles +
        "</td>" +
        '<td><span class="badge-estado badge-estado--' +
        (disponible ? "aprobada" : "rechazada") +
        '">' +
        DatosLibros.etiquetaDisponibilidad(libro) +
        "</span></td>" +
        '<td class="celda-acciones">' +
        '<button type="button" class="boton boton--secundario btn-mini" data-toggle="' +
        libro.id +
        '">' +
        (libro.disponible !== false
          ? "Marcar no disponible"
          : "Marcar disponible") +
        "</button> " +
        '<button type="button" class="boton boton--secundario btn-eliminar" data-eliminar="' +
        libro.id +
        '">Quitar</button>' +
        "</td>";

      tbody.appendChild(fila);
    });

    tbody.querySelectorAll("[data-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        DatosLibros.alternarDisponible(
          Number(btn.getAttribute("data-toggle"))
        );
        renderizarTabla();
      });
    });

    tbody.querySelectorAll("[data-eliminar]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (confirm("¿Quitar este libro del catálogo?")) {
          DatosLibros.eliminar(
            Number(btn.getAttribute("data-eliminar"))
          );
          renderizarTabla();
        }
      });
    });
  }

  formulario.addEventListener("submit", function (e) {
    e.preventDefault();

    const titulo = document
      .getElementById("libro-titulo")
      .value.trim();

    const autor = document
      .getElementById("libro-autor")
      .value.trim();

    const anio = document
      .getElementById("libro-anio")
      .value;

    const disponibles = document
      .getElementById("libro-disponibles")
      .value;

    const categoria = document
      .getElementById("libro-categoria")
      .value;

    const publico = document
      .getElementById("libro-publico")
      .value;

    if (!titulo || !autor) {
      alert("Nombre del libro y autor son obligatorios.");
      return;
    }

    if (!anio || Number.isNaN(Number(anio))) {
      alert("El año de publicación debe ser un número.");
      return;
    }

    if (!disponibles || Number(disponibles) < 0) {
      alert("Disponibles debe ser un número mayor o igual a 0.");
      return;
    }

    if (!categoria) {
      alert("Seleccione una categoría.");
      return;
    }

    if (!publico) {
      alert("Seleccione el público.");
      return;
    }

    DatosLibros.agregar({
      titulo: titulo,
      autor: autor,
      anio: anio,
      disponibles: disponibles,
      categoria: categoria,
      publico: publico,
      disponible: true,
    });

    formulario.reset();

    renderizarTabla();

    alert("Libro agregado correctamente.");
  });

  renderizarTabla();
})();