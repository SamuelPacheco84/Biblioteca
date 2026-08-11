/**
 * Solicitudes unificadas: docentes, libros y espacios.
 */
const Solicitudes = {
  CLAVE: "biblioteca_solicitudes",
  CLAVE_ANTIGUA: "biblioteca_solicitudes_docente",

  _migrarSiHaceFalta() {
    try {
      const actual = localStorage.getItem(this.CLAVE);
      if (actual) {
        return;
      }
      const antigua = localStorage.getItem(this.CLAVE_ANTIGUA);
      if (!antigua) {
        return;
      }
      const lista = JSON.parse(antigua).map(function (s) {
        return {
          ...s,
          tipo: "biblioteca_docente",
          nombreUsuario: s.docenteNombre,
          usuario: s.docenteUsuario,
          correo: s.correo || "",
        };
      });
      this.guardar(lista);
    } catch (e) {
      /* ignorar */
    }
  },

  obtenerTodas() {
    this._migrarSiHaceFalta();
    try {
      const datos = localStorage.getItem(this.CLAVE);
      return datos ? JSON.parse(datos) : [];
    } catch (e) {
      return [];
    }
  },

  obtenerPorUsuario(usuario) {
    return this.obtenerTodas().filter(function (s) {
      return s.usuario === usuario;
    });
  },

  obtenerPorId(id) {
    return this.obtenerTodas().find(function (s) {
      return s.id === id;
    });
  },

  guardar(lista) {
    localStorage.setItem(this.CLAVE, JSON.stringify(lista));
  },

  agregar(solicitud) {
    const lista = this.obtenerTodas();
    const nueva = {
      id: Date.now(),
      estado: "pendiente",
      fechaSolicitud: new Date().toISOString(),
      motivoRechazo: "",
      ...solicitud,
    };
    lista.unshift(nueva);
    this.guardar(lista);
    return nueva;
  },

  actualizar(id, cambios) {
    const lista = this.obtenerTodas();
    const idx = lista.findIndex(function (s) {
      return s.id === id;
    });
    if (idx === -1) {
      return null;
    }
    lista[idx] = { ...lista[idx], ...cambios };
    this.guardar(lista);
    return lista[idx];
  },

  eliminar(id) {
    const lista = this.obtenerTodas();
    const nuevaLista = lista.filter(function (s) {
      return s.id !== id;
    });
    if (nuevaLista.length === lista.length) {
      return false;
    }
    this.guardar(nuevaLista);
    return true;
  },

  contarPendientes() {
    return this.obtenerTodas().filter(function (s) {
      return s.estado === "pendiente";
    }).length;
  },

  etiquetaTipo(tipo) {
    const mapa = {
      biblioteca_docente: "Biblioteca completa",
      libro: "Reserva de libro",
      espacio: "Reserva de espacio",
    };
    return mapa[tipo] || tipo;
  },

  resumenDetalle(s) {
    if (s.tipo === "biblioteca_docente") {
      return (
        "Biblioteca completa · " +
        s.cantidadSillas +
        " sillas · " +
        this.formatearFecha(s.fechaEvento) +
        (s.necesidades ? " · " + s.necesidades : "")
      );
    }
    if (s.tipo === "libro") {
      return (s.libroTitulo || "Libro") + (s.libroAutor ? " — " + s.libroAutor : "");
    }
    if (s.tipo === "espacio") {
      return (
        (s.espacio || "Espacio") +
        " · " +
        this.formatearFecha(s.fechaEvento) +
        (s.docenteResponsable ? " · Docente: " + s.docenteResponsable : "")
      );
    }
    return "—";
  },

  formatearFecha(valorFecha) {
    if (!valorFecha) {
      return "—";
    }
    const d = new Date(valorFecha);
    if (Number.isNaN(d.getTime())) {
      return String(valorFecha).replace("T", " ");
    }
    return d.toLocaleString("es-CO", {
      dateStyle: "short",
      timeStyle: "short",
    });
  },
};

const SolicitudesBiblioteca = Solicitudes;
