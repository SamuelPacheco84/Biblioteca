/**
 * Tiempos de préstamo y de multa (definidos por el administrador).
 */
const ConfigPrestamos = {
  CLAVE: "biblioteca_config_prestamos",

  _default: {
    prestamoDias: 7,
    prestamoHoras: 0,
    prestamoMinutos: 0,
    prestamoSegundos: 0,
    multaDias: 2,
    multaHoras: 0,
    multaMinutos: 0,
    multaSegundos: 0,
  },

  obtener() {
    try {
      const datos = localStorage.getItem(this.CLAVE);
      if (datos) {
        return { ...this._default, ...JSON.parse(datos) };
      }
    } catch (e) {
      /* default */
    }
    return { ...this._default };
  },

  guardar(config) {
    localStorage.setItem(
      this.CLAVE,
      JSON.stringify({ ...this._default, ...config })
    );
  },

  _msDesdePartes(dias, horas, minutos, segundos) {
    return (
      Number(dias) * 86400000 +
      Number(horas) * 3600000 +
      Number(minutos) * 60000 +
      Number(segundos) * 1000
    );
  },

  msPrestamo() {
    const c = this.obtener();
    return this._msDesdePartes(
      c.prestamoDias,
      c.prestamoHoras,
      c.prestamoMinutos,
      c.prestamoSegundos
    );
  },

  msMulta() {
    const c = this.obtener();
    return this._msDesdePartes(
      c.multaDias,
      c.multaHoras,
      c.multaMinutos,
      c.multaSegundos
    );
  },

  fechaLimiteDesde(ahora) {
    return new Date(ahora.getTime() + this.msPrestamo());
  },

  fechaFinMultaDesde(ahora) {
    return new Date(ahora.getTime() + this.msMulta());
  },
};
