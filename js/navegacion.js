/**
 * Marca el enlace activo en la navegación según la página actual.
 */
(function () {
  const ruta = window.location.pathname.replace(/\\/g, "/");
  const enlaces = document.querySelectorAll(".nav-principal a[data-seccion]");

  enlaces.forEach(function (enlace) {
    const seccion = enlace.getAttribute("data-seccion");
    let activo = false;

    if (seccion === "home" && (ruta.endsWith("/") || ruta.endsWith("/index.html") || ruta.endsWith("biblioteca_2"))) {
      activo = !ruta.includes("/usuario/") && !ruta.includes("/admin/") && !ruta.includes("login.html");
    }
    if (seccion === "login" && ruta.includes("login.html")) {
      activo = true;
    }

    if (activo) {
      enlace.classList.add("activo");
    }
  });
})();
