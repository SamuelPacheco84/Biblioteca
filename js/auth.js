/**
 * Gestión de sesión y acceso por rol (admin | usuario).
 */
const Auth = {
  CLAVE_SESION: "biblioteca_sesion",

  getRutaBase() {
    const ruta = window.location.pathname.replace(/\\/g, "/");
    if (ruta.includes("/usuario/") || ruta.includes("/admin/")) {
      return "../";
    }
    return "";
  },

  obtenerSesion() {
    try {
      const datos = sessionStorage.getItem(this.CLAVE_SESION);
      return datos ? JSON.parse(datos) : null;
    } catch (e) {
      return null;
    }
  },

  guardarSesion(usuario) {
    sessionStorage.setItem(this.CLAVE_SESION, JSON.stringify(usuario));
  },

  cerrarSesion() {
    sessionStorage.removeItem(this.CLAVE_SESION);
    window.location.href = this.getRutaBase() + "login.html";
  },

  getRutaPanel(rol) {
    const base = this.getRutaBase();
    if (rol === "admin") {
      return base + "admin/index.html";
    }
    return base + "usuario/index.html";
  },

  /**
   * Valida credenciales contra la "base de datos" (datos-usuarios.js o API futura).
   */
  async validarCredenciales(usuario, clave) {
    if (typeof DatosUsuarios !== "undefined") {
      return DatosUsuarios.consultarPorCredenciales(usuario, clave);
    }
    return null;
  },

  async iniciarSesion(usuario, clave) {
    const registro = await this.validarCredenciales(usuario, clave);

    if (!registro) {
      return {
        ok: false,
        mensaje: "Usuario o contraseña incorrectos.",
      };
    }

    this.guardarSesion(registro);

    return {
      ok: true,
      redirect: this.getRutaPanel(registro.rol),
    };
  },

  /** Redirige al login si no hay sesión o el rol no coincide. */
  protegerRuta(rolRequerido) {
    const sesion = this.obtenerSesion();

    if (!sesion) {
      window.location.replace(this.getRutaBase() + "login.html");
      return false;
    }

    if (sesion.rol !== rolRequerido) {
      window.location.replace(this.getRutaPanel(sesion.rol));
      return false;
    }

    return true;
  },

  /** En login.html: si ya hay sesión, ir al panel correspondiente. */
  redirigirSiAutenticado() {
    const sesion = this.obtenerSesion();
    if (sesion) {
      window.location.replace(this.getRutaPanel(sesion.rol));
    }
  },

  mostrarNombreEnNav() {
    const sesion = this.obtenerSesion();
    const elemento = document.getElementById("nav-nombre-usuario");
    if (elemento && sesion) {
      elemento.innerHTML =
        '<span class="icono-usuario-lineas" aria-hidden="true"></span>' +
        sesion.nombre;
    }
  },

  enlazarCerrarSesion() {
    const boton = document.getElementById("btn-cerrar-sesion");
    if (boton) {
      boton.addEventListener("click", function (e) {
        e.preventDefault();
        Auth.cerrarSesion();
      });
    }
  },

  actualizarNavPublico() {
    const contenedor = document.getElementById("nav-sesion");
    const enlacePrincipal = document.querySelector(
      '.nav-principal a[data-seccion="home"]'
    );
    if (!contenedor) {
      return;
    }

    const sesion = this.obtenerSesion();
    const base = this.getRutaBase();

    if (sesion) {
      document.body.classList.add("usuario-autenticado");
      if (enlacePrincipal) {
        enlacePrincipal.textContent = "Catalogo";
        enlacePrincipal.setAttribute("href", base + "index.html#catalogo");
      }
      contenedor.innerHTML =
        '<a href="' +
        this.getRutaPanel(sesion.rol) +
        '" class="nav-principal__panel"><span class="icono-usuario-lineas" aria-hidden="true"></span>Mi panel</a>' +
        '<a href="#" id="btn-cerrar-sesion-nav">Cerrar sesión</a>';

      const btn = document.getElementById("btn-cerrar-sesion-nav");
      if (btn) {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          Auth.cerrarSesion();
        });
      }
    } else {
      document.body.classList.remove("usuario-autenticado");
      if (enlacePrincipal) {
        enlacePrincipal.textContent = "Inicio";
        enlacePrincipal.setAttribute("href", base + "index.html");
      }
      contenedor.innerHTML =
        '<a href="' + base + 'index.html#catalogo">Ver Catalogo</a>';
    }
  },
};

(function () {
  const rolRequerido = document.body.getAttribute("data-rol-requerido");
  if (rolRequerido) {
    if (Auth.protegerRuta(rolRequerido)) {
      Auth.mostrarNombreEnNav();
      Auth.enlazarCerrarSesion();
    }
  }

  if (document.body.getAttribute("data-pagina") === "login") {
    Auth.redirigirSiAutenticado();
  }

  if (document.body.getAttribute("data-pagina") === "publica") {
    Auth.actualizarNavPublico();
  }
})();
