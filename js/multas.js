/**
 * Multas por devolución tardía de libros.
 */
const Multas = {
  CLAVE: "biblioteca_multas",

  obtenerTodas() {
    try {
      const datos = localStorage.getItem(this.CLAVE);
      return datos ? JSON.parse(datos) : [];
    } catch (e) {
      return [];
    }
  },

  guardar(lista) {
    localStorage.setItem(this.CLAVE, JSON.stringify(lista));
  },

  limpiarExpiradas() {
    const ahora = Date.now();
    const activas = this.obtenerTodas().filter(function (m) {
      return new Date(m.fechaFin).getTime() > ahora;
    });
    if (activas.length !== this.obtenerTodas().length) {
      this.guardar(activas);
    }
    return activas;
  },

  obtenerMultaActiva(usuario) {
    this.limpiarExpiradas();
    const ahora = Date.now();
    return (
      this.obtenerTodas().find(function (m) {
        return m.usuario === usuario && new Date(m.fechaFin).getTime() > ahora;
      }) || null
    );
  },

  crear(datos) {
    const lista = this.limpiarExpiradas();
    const nueva = {
      id: Date.now(),
      usuario: datos.usuario,
      nombreUsuario: datos.nombreUsuario,
      correo: datos.correo,
      solicitudId: datos.solicitudId,
      libroTitulo: datos.libroTitulo,
      fechaInicio: new Date().toISOString(),
      fechaFin: datos.fechaFin,
    };
    lista.push(nueva);
    this.guardar(lista);
    return nueva;
  },

  tiempoRestante(multa) {
    const diff = new Date(multa.fechaFin).getTime() - Date.now();
    if (diff <= 0) {
      return { totalMs: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 };
    }
    let restante = Math.floor(diff / 1000);
    const dias = Math.floor(restante / 86400);
    restante %= 86400;
    const horas = Math.floor(restante / 3600);
    restante %= 3600;
    const minutos = Math.floor(restante / 60);
    const segundos = restante % 60;
    return { totalMs: diff, dias: dias, horas: horas, minutos: minutos, segundos: segundos };
  },

  textoTiempoRestante(multa) {
    const t = this.tiempoRestante(multa);
    if (t.totalMs <= 0) {
      return "0 días, 0 horas, 0 minutos y 0 segundos";
    }
    return (
      t.dias +
      " días, " +
      t.horas +
      " horas, " +
      t.minutos +
      " minutos y " +
      t.segundos +
      " segundos"
    );
  },
};
