(function () {
  const selectEspacio = document.getElementById("espacio");

  if (!selectEspacio) {
    return;
  }

  const espacios = [
    { nombre: "Sala A", estado: "libre" },
    { nombre: "Sala B", estado: "ocupado" },
    { nombre: "Mesa 1", estado: "libre" },
    { nombre: "Mesa 2", estado: "ocupado" },
    { nombre: "Cubículo 1", estado: "libre" },
    { nombre: "Cubículo 2", estado: "libre" },
  ];

  const disponibles = espacios.filter(function (espacio) {
    return espacio.estado === "libre";
  });

  selectEspacio.innerHTML = "";

  const opcionInicial = document.createElement("option");
  opcionInicial.value = "";
  opcionInicial.textContent = "Seleccionar espacio...";
  opcionInicial.selected = true;
  selectEspacio.appendChild(opcionInicial);

  disponibles.forEach(function (espacio) {
    const opcion = document.createElement("option");
    opcion.value = espacio.nombre;
    opcion.textContent = espacio.nombre + " (Disponible)";
    selectEspacio.appendChild(opcion);
  });
})();
