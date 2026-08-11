/**
 * Catálogo de libros (localStorage — reemplazable por BD/API).
 */
const DatosLibros = {
  CLAVE: "biblioteca_catalogo",
  CLAVE_VERSION: "biblioteca_catalogo_version",
  VERSION: 2,

  CATEGORIAS: [
    "Acción",
    "Aventura",
    "Ciencia ficción",
    "Drama",
    "Educativo",
    "Fantasía",
    "Historia",
    "Infantil",
    "Novela",
    "Romance",
    "Suspenso",
    "Terror",
  ],

  PUBLICOS: ["Niños", "Adolescentes", "Adultos", "Docentes"],

  _catalogoInicial: [
    {
      id: 1,
      titulo: "Cien años de soledad",
      autor: "Gabriel Garcia Marquez",
      anio: 1967,
      categoria: "Novela",
      publico: "Adultos",
      disponibles: 3,
      disponible: true,
    },
    {
      id: 2,
      titulo: "El amor en los tiempos del colera",
      autor: "Gabriel Garcia Marquez",
      anio: 1985,
      categoria: "Romance",
      publico: "Adultos",
      disponibles: 2,
      disponible: true,
    },
    {
      id: 3,
      titulo: "Don Quijote de la Mancha",
      autor: "Miguel de Cervantes",
      anio: 1605,
      categoria: "Aventura",
      publico: "Adolescentes",
      disponibles: 1,
      disponible: true,
    },
    {
      id: 4,
      titulo: "El Principito",
      autor: "Antoine de Saint-Exupery",
      anio: 1943,
      categoria: "Infantil",
      publico: "Niños",
      disponibles: 4,
      disponible: true,
    },
    {
      id: 5,
      titulo: "Harry Potter y la piedra filosofal",
      autor: "J.K. Rowling",
      anio: 1997,
      categoria: "Fantasía",
      publico: "Adolescentes",
      disponibles: 3,
      disponible: true,
    },
    {
      id: 6,
      titulo: "Metodologías activas en el aula",
      autor: "María López",
      anio: 2022,
      categoria: "Educativo",
      publico: "Docentes",
      disponibles: 2,
      disponible: true,
    },
    {
      id: 7,
      titulo: "Drácula",
      autor: "Bram Stoker",
      anio: 1897,
      categoria: "Terror",
      publico: "Adultos",
      disponibles: 2,
      disponible: true,
    },
    {
      id: 8,
      titulo: "Mad Max: Camino de furia — Novela",
      autor: "George Miller",
      anio: 2015,
      categoria: "Acción",
      publico: "Adultos",
      disponibles: 1,
      disponible: true,
    },
    {
      id: 9,
      titulo: "Dune",
      autor: "Frank Herbert",
      anio: 1965,
      categoria: "Ciencia ficción",
      publico: "Adultos",
      disponibles: 2,
      disponible: true,
    },
  ],

  normalizar(valor) {
    return String(valor || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  },

  _normalizarLibro(libro) {
    return {
      ...libro,
      categoria: libro.categoria || "General",
      publico: libro.publico || "Adultos",
    };
  },

  _migrarCatalogo(catalogo) {
    const ids = new Set(catalogo.map(function (libro) {
      return libro.id;
    }));

    this._catalogoInicial.forEach(function (libro) {
      if (!ids.has(libro.id)) {
        catalogo.push(Object.assign({}, libro));
      }
    });

    return catalogo.map(this._normalizarLibro.bind(this));
  },

  cargarOpcionesFiltro(selectCategoria, selectPublico) {
    if (selectCategoria) {
      while (selectCategoria.options.length > 1) {
        selectCategoria.remove(1);
      }

      this.CATEGORIAS.forEach(function (categoria) {
        const option = document.createElement("option");
        option.value = categoria;
        option.textContent = categoria;
        selectCategoria.appendChild(option);
      });
    }

    if (selectPublico) {
      while (selectPublico.options.length > 1) {
        selectPublico.remove(1);
      }

      this.PUBLICOS.forEach(function (publico) {
        const option = document.createElement("option");
        option.value = publico;
        option.textContent = publico;
        selectPublico.appendChild(option);
      });
    }
  },

  filtrarCatalogo(criterios) {
    const texto = this.normalizar(criterios && criterios.texto);
    const categoria = (criterios && criterios.categoria) || "";
    const publico = (criterios && criterios.publico) || "";

    return this.obtenerCatalogo().filter(function (libro) {
      const titulo = DatosLibros.normalizar(libro.titulo);
      const autor = DatosLibros.normalizar(libro.autor);

      const coincideBusqueda =
        !texto || titulo.includes(texto) || autor.includes(texto);

      const coincideCategoria = !categoria || libro.categoria === categoria;

      const coincidePublico = !publico || libro.publico === publico;

      return coincideBusqueda && coincideCategoria && coincidePublico;
    });
  },

  obtenerCatalogo() {
    let catalogo = null;

    try {
      const datos = localStorage.getItem(this.CLAVE);

      if (datos) {
        catalogo = JSON.parse(datos);
      }
    } catch (e) {
      catalogo = null;
    }

    if (!catalogo) {
      this.guardar(this._catalogoInicial.slice());
      localStorage.setItem(this.CLAVE_VERSION, String(this.VERSION));
      return this._catalogoInicial.map(this._normalizarLibro.bind(this));
    }

    const version = Number(localStorage.getItem(this.CLAVE_VERSION) || 0);

    if (version < this.VERSION) {
      catalogo = this._migrarCatalogo(catalogo);
      this.guardar(catalogo);
      localStorage.setItem(this.CLAVE_VERSION, String(this.VERSION));
    }

    return catalogo.map(this._normalizarLibro.bind(this));
  },

  guardar(catalogo) {
    localStorage.setItem(this.CLAVE, JSON.stringify(catalogo));
  },

  agregar(datos) {
    const catalogo = this.obtenerCatalogo();

    const nuevo = {
      id: Date.now(),

      titulo: datos.titulo.trim(),

      autor: datos.autor.trim(),

      anio: Number(datos.anio),

      categoria: datos.categoria || "General",

      publico: datos.publico || "General",

      disponibles: Number(datos.disponibles),

      disponible: datos.disponible !== false,
    };

    catalogo.unshift(nuevo);

    this.guardar(catalogo);

    return nuevo;
  },

  eliminar(id) {
    const catalogo = this.obtenerCatalogo().filter(function (l) {
      return l.id !== id;
    });

    this.guardar(catalogo);
  },

  actualizar(id, cambios) {
    const catalogo = this.obtenerCatalogo();

    const idx = catalogo.findIndex(function (l) {
      return l.id === id;
    });

    if (idx === -1) {
      return null;
    }

    catalogo[idx] = {
      ...catalogo[idx],
      ...cambios,
    };

    this.guardar(catalogo);

    return catalogo[idx];
  },

  alternarDisponible(id) {
    const libro = this.obtenerCatalogo().find(function (l) {
      return l.id === id;
    });

    if (!libro) {
      return null;
    }

    return this.actualizar(id, {
      disponible: !libro.disponible,
    });
  },

  tieneEjemplares(libro) {
    return Number(libro.disponibles) > 0;
  },

  estaDisponibleParaPrestamo(libro) {
    return libro.disponible !== false && this.tieneEjemplares(libro);
  },

  etiquetaDisponibilidad(libro) {
    if (!this.estaDisponibleParaPrestamo(libro)) {
      return "No disponible";
    }

    return "Disponible";
  },

  descontarEjemplar(libroId) {
    const libro = this.obtenerCatalogo().find(function (l) {
      return l.id === libroId;
    });

    if (!libro) {
      return {
        ok: false,
        mensaje: "Libro no encontrado.",
      };
    }

    if (Number(libro.disponibles) <= 0) {
      return {
        ok: false,
        mensaje: "No hay ejemplares disponibles.",
      };
    }

    const nuevos = Number(libro.disponibles) - 1;

    this.actualizar(libroId, {
      disponibles: nuevos,
      disponible: nuevos > 0 ? libro.disponible !== false : false,
    });

    return {
      ok: true,
    };
  },

  devolverEjemplar(libroId) {
    const libro = this.obtenerCatalogo().find(function (l) {
      return l.id === libroId;
    });

    if (!libro) {
      return {
        ok: false,
        mensaje: "Libro no encontrado.",
      };
    }

    const nuevos = Number(libro.disponibles) + 1;

    this.actualizar(libroId, {
      disponibles: nuevos,
      disponible: true,
    });

    return {
      ok: true,
    };
  },
};