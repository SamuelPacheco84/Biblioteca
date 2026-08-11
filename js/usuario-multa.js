(function () {
  const aviso = document.getElementById("aviso-multa-usuario");
  let intervalo = null;

  if (!aviso || typeof Auth === "undefined" || typeof Multas === "undefined") {
    return;
  }

  function actualizarAviso() {
    const sesion = Auth.obtenerSesion();
    if (!sesion) {
      aviso.hidden = true;
      return;
    }

    const multa = Multas.obtenerMultaActiva(sesion.usuario);
    if (!multa) {
      aviso.hidden = true;
      return;
    }

    const t = Multas.tiempoRestante(multa);
    if (t.totalMs <= 0) {
      aviso.hidden = true;
      Multas.limpiarExpiradas();
      return;
    }

    aviso.hidden = false;
    aviso.innerHTML =
      "<strong>⚠ Tienes una multa activa</strong><br>" +
      "No entregaste el libro <em>" +
      (multa.libroTitulo || "") +
      "</em> a tiempo. No puedes hacer nuevas reservas de libros hasta que finalice la multa.<br>" +
      "<span class=\"aviso-multa__tiempo\">Tiempo restante: " +
      t.dias +
      " días, " +
      t.horas +
      " horas, " +
      t.minutos +
      " minutos y " +
      t.segundos +
      " segundos</span>";
  }

  actualizarAviso();
  intervalo = setInterval(actualizarAviso, 1000);

  window.addEventListener("beforeunload", function () {
    if (intervalo) {
      clearInterval(intervalo);
    }
  });
})();
