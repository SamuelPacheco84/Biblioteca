/**
 * Simulación de consulta a la base de datos de credenciales.
 */
const DatosUsuarios = {
  CLAVE_REGISTROS: "biblioteca_usuarios_registro",

  consultarPorCredenciales(usuario, clave) {
    const registro = this._buscarEnTabla(this._tabla, usuario, clave);
    if (registro) {
      return this._mapSesion(registro);
    }

    const registrados = this._obtenerRegistrados();
    const extra = this._buscarEnTabla(registrados, usuario, clave);
    if (extra) {
      return this._mapSesion(extra);
    }

    return null;
  },

  obtenerCorreo(usuario) {
    const base = this._tabla.find(function (f) {
      return f.usuario === usuario;
    });
    if (base && base.correo) {
      return base.correo;
    }

    const registrados = this._obtenerRegistrados();
    const extra = registrados.find(function (f) {
      return f.usuario === usuario;
    });
    return extra ? extra.correo : null;
  },

  registrarUsuario(datos) {
    const lista = this._obtenerRegistrados();
    const existe = lista.some(function (u) {
      return u.usuario === datos.usuario || u.correo === datos.correo;
    });
    if (existe) {
      return { ok: false, mensaje: "Ese usuario o correo ya está registrado." };
    }

    lista.push({
      id: Date.now(),
      usuario: datos.usuario,
      clave: datos.clave,
      nombre: datos.nombre,
      correo: datos.correo,
      rol: "usuario",
      activo: true,
    });
    localStorage.setItem(this.CLAVE_REGISTROS, JSON.stringify(lista));
    return { ok: true };
  },

  _obtenerRegistrados() {
    try {
      const datos = localStorage.getItem(this.CLAVE_REGISTROS);
      return datos ? JSON.parse(datos) : [];
    } catch (e) {
      return [];
    }
  },

  _buscarEnTabla(tabla, usuario, clave) {
    return tabla.find(function (fila) {
      return (
        fila.usuario === usuario &&
        fila.clave === clave &&
        fila.activo === true
      );
    });
  },

  _mapSesion(registro) {
    return {
      id: registro.id,
      usuario: registro.usuario,
      nombre: registro.nombre,
      rol: registro.rol,
      correo: registro.correo || "",
    };
  },

  _tabla: [
    {
      id: 1,
      usuario: "admin",
      clave: "admin123",
      nombre: "Administrador Biblioteca",
      correo: "admin.biblioteca@sena.edu.co",
      rol: "admin",
      activo: true,
    },
    {
      id: 2,
      usuario: "estudiante",
      clave: "estudiante123",
      nombre: "Ana Estudiante",
      correo: "ana.estudiante@sena.edu.co",
      rol: "usuario",
      activo: true,
    },
    {
      id: 3,
      usuario: "docente",
      clave: "docente123",
      nombre: "Carlos Docente",
      correo: "carlos.docente@sena.edu.co",
      rol: "usuario",
      activo: true,
    },
  ],
};
