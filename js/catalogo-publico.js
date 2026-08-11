(function () {

  const contenedor = document.getElementById("catalogo-grid");
  const inputBuscar = document.getElementById("buscar-libro");
  const filtroCategoria = document.getElementById("filtro-categoria");
  const filtroPublico = document.getElementById("filtro-publico");


  if (
    !contenedor ||
    !inputBuscar ||
    !filtroCategoria ||
    !filtroPublico ||
    typeof DatosLibros === "undefined"
  ) {
    return;
  }


  // Normaliza texto para ignorar mayúsculas y tildes
  function normalizarTexto(texto) {

    return String(texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  }


  function crearTarjeta(libro) {

    const disponible = DatosLibros.estaDisponibleParaPrestamo(libro);

    const chipClass = disponible
      ? "catalogo-libro__estado--si"
      : "catalogo-libro__estado--no";


    const articulo = document.createElement("article");

    articulo.className = "tarjeta catalogo-libro";


    articulo.innerHTML =

      '<div class="catalogo-libro__portada" aria-hidden="true"></div>' +

      "<h3>" +
      libro.titulo +
      "</h3>" +

      "<p><strong>Autor:</strong> " +
      libro.autor +
      "</p>" +


      "<p><strong>Categoría:</strong> " +
      (libro.categoria || "Sin categoría") +
      "</p>" +


      "<p><strong>Público:</strong> " +
      (libro.publico || "General") +
      "</p>" +


      "<p><strong>Año:</strong> " +
      libro.anio +
      "</p>" +


      '<p class="catalogo-libro__estado ' +
      chipClass +
      '">' +
      DatosLibros.etiquetaDisponibilidad(libro) +
      "</p>" +


      "<p><strong>Ejemplares:</strong> " +
      libro.disponibles +
      "</p>" +


      '<a href="login.html" class="boton boton--primario">' +
      "Ver más" +
      "</a>";


    return articulo;

  }



  function cargarFiltros() {


    const catalogo = DatosLibros.obtenerCatalogo();


    // Limpiar opciones anteriores

    filtroCategoria.innerHTML =
      '<option value="">Todas</option>';


    filtroPublico.innerHTML =
      '<option value="">Todos</option>';



    const categorias = [...new Set(

      catalogo

        .map(libro => libro.categoria)

        .filter(Boolean)

    )].sort();



    categorias.forEach(function (categoria) {


      const option = document.createElement("option");


      option.value = categoria;

      option.textContent = categoria;


      filtroCategoria.appendChild(option);


    });



    const publicos = [...new Set(

      catalogo

        .map(libro => libro.publico)

        .filter(Boolean)

    )].sort();



    publicos.forEach(function (publico) {


      const option = document.createElement("option");


      option.value = publico;

      option.textContent = publico;


      filtroPublico.appendChild(option);


    });


  }





  function coincideBusqueda(libro, texto) {


    if (texto.trim() === "") {

      return true;

    }


    const palabras = normalizarTexto(texto)
      .split(" ")
      .filter(Boolean);



    const informacionLibro = normalizarTexto(

      libro.titulo +
      " " +
      libro.autor

    );



    return palabras.every(function (palabra) {


      return informacionLibro.includes(palabra);


    });


  }





  function renderizar() {


    const texto = inputBuscar.value;


    const categoria = filtroCategoria.value;


    const publico = filtroPublico.value;



    let catalogo = DatosLibros.obtenerCatalogo();



    catalogo = catalogo.filter(function (libro) {



      const coincideTexto =
        coincideBusqueda(libro, texto);



      const coincideCategoria =

        categoria === "" ||

        normalizarTexto(libro.categoria) ===
        normalizarTexto(categoria);



      const coincidePublico =

        publico === "" ||

        normalizarTexto(libro.publico) ===
        normalizarTexto(publico);



      return (

        coincideTexto &&

        coincideCategoria &&

        coincidePublico

      );


    });




    contenedor.innerHTML = "";



    if (catalogo.length === 0) {


      contenedor.innerHTML =

        '<p class="aviso-placeholder">' +

        "No se encontraron libros con esos filtros." +

        "</p>";


      return;

    }





    catalogo.forEach(function (libro) {


      contenedor.appendChild(

        crearTarjeta(libro)

      );


    });


  }





  cargarFiltros();


  renderizar();




  inputBuscar.addEventListener(
    "input",
    renderizar
  );


  filtroCategoria.addEventListener(
    "change",
    renderizar
  );


  filtroPublico.addEventListener(
    "change",
    renderizar
  );



})();