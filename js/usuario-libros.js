(function () {
  const input = document.getElementById("buscar-libro");
  const lista = document.getElementById("resultados-libros");
  const estado = document.getElementById("estado-busqueda-libros");
  const btnReservar = document.getElementById("btn-reservar-libro");

  let libroSeleccionado = null;

  if (!input || !lista || !estado || typeof DatosLibros === "undefined") {
    return;
  }

  function normalizar(valor) {
    return valor
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function seleccionarLibro(libro, item) {
    libroSeleccionado = libro;
    lista.querySelectorAll(".resultado-libro").forEach(function (el) {
      el.classList.remove("resultado-libro--activo");
    });
    if (item) {
      item.classList.add("resultado-libro--activo");
    }
    estado.textContent = "Seleccionado: " + libro.titulo;
  }

  function renderResultados(query) {
    const texto = normalizar(query);
    lista.innerHTML = "";
    libroSeleccionado = null;

    if (!texto) {
      estado.textContent = "Escribe para buscar libros por titulo o autor.";
      return;
    }

    const encontrados = DatosLibros.obtenerCatalogo().filter(function (libro) {
      const titulo = normalizar(libro.titulo);
      const autor = normalizar(libro.autor);
      return titulo.includes(texto) || autor.includes(texto);
    });

    if (encontrados.length === 0) {
      estado.textContent = "No se encontraron coincidencias.";
      return;
    }

    estado.textContent =
      encontrados.length + ' libro(s) encontrado(s). Haz clic en uno para seleccionarlo.';

    encontrados.forEach(function (libro) {
      const item = document.createElement("li");
      item.className = "resultado-libro";
      const disp = DatosLibros.estaDisponibleParaPrestamo(libro);
      item.innerHTML =
        "<strong>" +
        libro.titulo +
        "</strong>" +
        '<span class="resultado-libro__meta">Autor: ' +
        libro.autor +
        " · " +
        libro.anio +
        " · " +
        DatosLibros.etiquetaDisponibilidad(libro) +
        " · Ejemplares: " +
        libro.disponibles +
        "</span>";
      if (!disp) {
        item.classList.add("resultado-libro--no-disponible");
      }
      item.addEventListener("click", function () {
        seleccionarLibro(libro, item);
      });
      lista.appendChild(item);
    });
  }

  input.addEventListener("input", function (e) {
    renderResultados(e.target.value);
  });

  if (btnReservar && typeof Solicitudes !== "undefined" && typeof Auth !== "undefined") {
    btnReservar.addEventListener("click", function () {
      const sesion = Auth.obtenerSesion();
      if (!sesion) {
        return;
      }

      if (typeof Multas !== "undefined") {
        const multa = Multas.obtenerMultaActiva(sesion.usuario);
        if (multa) {
          alert(
            "Tienes una multa debido a que no entregaste un libro a tiempo.\n\n" +
              "Tiempo restante para que la multa finalice:\n" +
              Multas.textoTiempoRestante(multa) +
              "."
          );
          return;
        }
      }

      if (!libroSeleccionado) {
        const texto = input.value.trim();
        if (!texto) {
          alert("Busca y selecciona un libro de la lista.");
          return;
        }
        alert("Selecciona un libro de los resultados antes de reservar.");
        return;
      }

      if (!DatosLibros.estaDisponibleParaPrestamo(libroSeleccionado)) {
        alert("Este libro no está disponible para reserva en este momento.");
        return;
      }

      if (!sesion.correo) {
        alert("Tu cuenta no tiene correo registrado. Actualiza tu registro.");
        return;
      }

      Solicitudes.agregar({
        tipo: "libro",
        nombreUsuario: sesion.nombre,
        usuario: sesion.usuario,
        correo: sesion.correo,
        libroId: libroSeleccionado.id,
        libroTitulo: libroSeleccionado.titulo,
        libroAutor: libroSeleccionado.autor,
        libroAnio: libroSeleccionado.anio,
        devuelto: false,
      });

      alert(
        "Solicitud de libro enviada al administrador. Recibirás respuesta por correo."
      );
      if (typeof window.actualizarMisReservas === "function") {
        window.actualizarMisReservas();
      }
      libroSeleccionado = null;
      input.value = "";
      lista.innerHTML = "";
      estado.textContent = "Solicitud enviada. Puedes buscar otro libro.";
    });
  }
})();
