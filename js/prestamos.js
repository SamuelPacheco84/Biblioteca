/**
 * Lógica de préstamos de libros: aprobación, devolución y vencimiento.
 */
const Prestamos = {
  obtenerPorId(id) {
    return Solicitudes.obtenerTodas().find(function (s) {
      return s.id === id;
    });
  },

obtenerPrestamosLibrosActivos() {
  return Solicitudes.obtenerTodas().filter(function (s) {
    return (
      s.tipo === "libro" &&
      s.estado === "aprobada"
    );
  });
},
  _buscarLibro(solicitud) {
    const catalogo = DatosLibros.obtenerCatalogo();
    if (solicitud.libroId) {
      return catalogo.find(function (l) {
        return l.id === solicitud.libroId;
      });
    }
    return catalogo.find(function (l) {
      return (
        l.titulo === solicitud.libroTitulo && l.autor === solicitud.libroAutor
      );
    });
  },

  aprobarReservaLibro(solicitudId) {
    const solicitud = this.obtenerPorId(solicitudId);
    if (!solicitud || solicitud.tipo !== "libro") {
      return { ok: false, mensaje: "Solicitud de libro no encontrada." };
    }

    const libro = this._buscarLibro(solicitud);
    if (!libro) {
      return { ok: false, mensaje: "Libro no encontrado en el catálogo." };
    }

    const descuento = DatosLibros.descontarEjemplar(libro.id);
    if (!descuento.ok) {
      return { ok: false, mensaje: descuento.mensaje };
    }

    const ahora = new Date();
    const fechaLimite = ConfigPrestamos.fechaLimiteDesde(ahora);

    Solicitudes.actualizar(solicitudId, {
      estado: "aprobada",
      fechaRespuesta: ahora.toISOString(),
      libroId: libro.id,
      devuelto: false,
      fechaLimiteDevolucion: fechaLimite.toISOString(),
      enMulta: false,
    });

    return { ok: true, solicitud: this.obtenerPorId(solicitudId) };
  },

  marcarDevuelto(solicitudId) {
    const solicitud = this.obtenerPorId(solicitudId);
    if (!solicitud || solicitud.tipo !== "libro") {
      return { ok: false, mensaje: "Préstamo no encontrado." };
    }

    if (solicitud.devuelto) {
      return { ok: false, mensaje: "Este libro ya fue marcado como devuelto." };
    }

    const libro = this._buscarLibro(solicitud);
    if (libro) {
      DatosLibros.devolverEjemplar(libro.id);
    }

    Solicitudes.actualizar(solicitudId, {
      devuelto: true,
      fechaDevolucion: new Date().toISOString(),
    });

    return { ok: true };
  },

  estaVencido(solicitud) {
    if (!solicitud.fechaLimiteDevolucion || solicitud.devuelto) {
      return false;
    }
    return Date.now() > new Date(solicitud.fechaLimiteDevolucion).getTime();
  },

  aplicarMulta(solicitudId) {
    const solicitud = this.obtenerPorId(solicitudId);
    if (!solicitud || solicitud.tipo !== "libro" || solicitud.devuelto) {
      return { ok: false, mensaje: "No se puede aplicar multa a este préstamo." };
    }

    if (!this.estaVencido(solicitud)) {
      return {
        ok: false,
        mensaje: "Aún no vence el plazo de préstamo configurado por el administrador.",
      };
    }

    const multaExistente = Multas.obtenerMultaActiva(solicitud.usuario);
    if (multaExistente) {
      return { ok: false, mensaje: "Este usuario ya tiene una multa activa." };
    }

    const fin = ConfigPrestamos.fechaFinMultaDesde(new Date());
    Multas.crear({
      usuario: solicitud.usuario,
      nombreUsuario: solicitud.nombreUsuario,
      correo: solicitud.correo,
      solicitudId: solicitud.id,
      libroTitulo: solicitud.libroTitulo,
      fechaFin: fin.toISOString(),
    });

    Solicitudes.actualizar(solicitudId, { enMulta: true });

    return { ok: true, fechaFin: fin };
  },
};
