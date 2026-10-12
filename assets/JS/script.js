// Selecciona el elemento del DOM que controla el filtro de categorías.
const select = document.querySelector(".form-select");

// Referencias al control visual que reemplaza el menú nativo del sistema.
const filterToggle = document.querySelector(".filter-toggle");
const filterOptions = document.querySelector(".filter-options");

// Selecciona el contenedor donde se renderizarán las tarjetas.
const cardsection = document.querySelector(".cards");

// Guarda todas las cartas cargadas para poder filtrarlas sin volver a pedir datos.
let allCards = [];

// Construye las opciones personalizadas a partir del select usado por el filtro.
Array.from(select.options).forEach((option) => {
    // Crea un botón para que la lista use la fuente personalizada en todos los navegadores.
    const optionElement = document.createElement("button");
    // Evita que esta opción envíe un formulario al ser pulsada.
    optionElement.type = "button";
    // Asigna la clase que aplica el estilo visual de cada opción.
    optionElement.className = "filter-option";
    // Informa a tecnologías de asistencia que este botón es una opción de lista.
    optionElement.setAttribute("role", "option");
    // Expone cuál de las opciones corresponde al valor actualmente seleccionado.
    optionElement.setAttribute("aria-selected", option.selected);
    // Conserva el valor que luego se copiará al select de filtrado.
    optionElement.dataset.value = option.value;
    // Usa el texto de la opción original como etiqueta visible.
    optionElement.textContent = option.textContent;
    // Inserta el botón en el menú personalizado.
    filterOptions.append(optionElement);
});

/**
 * Abre o cierra la lista personalizada y mantiene su estado accesible.
 *
 * @param {boolean} isOpen - Indica si la lista debe quedar abierta.
 */
function SetFilterOpen(isOpen) {
    // Oculta o muestra el menú según el estado solicitado.
    filterOptions.hidden = !isOpen;
    // Actualiza el estado accesible que anuncia si el menú está expandido.
    filterToggle.setAttribute("aria-expanded", isOpen);

    if (isOpen) {
        // Busca la opción actual para poner el foco en ella al abrir el menú.
        const selectedOption = filterOptions.querySelector('[aria-selected="true"]');
        // Enfoca la opción seleccionada si se encontró en el menú.
        selectedOption?.focus();
    }
}

/**
 * Selecciona una categoría, sincroniza el select original y actualiza las cartas.
 *
 * @param {HTMLButtonElement} optionElement - Opción elegida en la lista visual.
 */
function ChooseFilterOption(optionElement) {
    // Actualiza el select oculto que utiliza la lógica existente para filtrar cartas.
    select.value = optionElement.dataset.value;
    // Muestra en el botón principal la categoría que eligió el usuario.
    filterToggle.textContent = optionElement.textContent;

    // Actualiza el estado seleccionado de todas las opciones del menú.
    filterOptions.querySelectorAll(".filter-option").forEach((option) => {
        option.setAttribute("aria-selected", option === optionElement);
    });

    // Dispara el evento habitual para volver a dibujar las cartas filtradas.
    select.dispatchEvent(new Event("change"));
    // Cierra la lista y devuelve el foco al botón para seguir navegando.
    SetFilterOpen(false);
    filterToggle.focus();
}

// Abre y cierra el menú personalizado desde el botón del filtro.
filterToggle.addEventListener("click", () => {
    SetFilterOpen(filterOptions.hidden);
});

// Permite abrir el filtro con las flechas además de Enter o la barra espaciadora.
filterToggle.addEventListener("keydown", (event) => {
    // Las flechas abren el menú como alternativa al clic o a Enter/espacio.
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        // Evita que la página se desplace al usar las flechas en el filtro.
        event.preventDefault();
        // Abre la lista y enfoca la opción actualmente seleccionada.
        SetFilterOpen(true);
    }
});

// Selecciona la opción pulsada, sin mostrar el desplegable nativo del sistema.
filterOptions.addEventListener("click", (event) => {
    // Encuentra el botón de opción aunque el clic caiga sobre un elemento interior.
    const optionElement = event.target.closest(".filter-option");

    if (optionElement) {
        // Aplica el valor de la opción pulsada y cierra el menú.
        ChooseFilterOption(optionElement);
    }
});

// Permite recorrer y activar las opciones con el teclado.
filterOptions.addEventListener("keydown", (event) => {
    // Obtiene todos los botones para calcular a cuál mover el foco.
    const options = Array.from(filterOptions.querySelectorAll(".filter-option"));
    // Averigua en qué posición está enfocada la opción actual.
    const currentIndex = options.indexOf(document.activeElement);
    // Guardará la posición de la opción a enfocar al navegar con teclado.
    let nextIndex;

    // La flecha abajo avanza y vuelve al inicio al llegar al final.
    if (event.key === "ArrowDown") {
        nextIndex = (currentIndex + 1) % options.length;
    // La flecha arriba retrocede y vuelve al final al llegar al inicio.
    } else if (event.key === "ArrowUp") {
        nextIndex = (currentIndex - 1 + options.length) % options.length;
    // Home lleva el foco a la primera categoría.
    } else if (event.key === "Home") {
        nextIndex = 0;
    // End lleva el foco a la última categoría.
    } else if (event.key === "End") {
        nextIndex = options.length - 1;
    // Escape cierra el menú y devuelve el foco al botón que lo abre.
    } else if (event.key === "Escape") {
        SetFilterOpen(false);
        filterToggle.focus();
    } else {
        // Deja que el navegador gestione cualquier tecla no contemplada.
        return;
    }

    // Evita el comportamiento predeterminado de las teclas de navegación.
    event.preventDefault();

    if (nextIndex !== undefined) {
        // Mueve el foco a la opción calculada.
        options[nextIndex].focus();
    }
});

/**
 * Filtra la lista de cartas según la categoría elegida por el usuario.
 * Si la opción es "All", devuelve la colección completa.
 *
 * @param {Array} cards - Arreglo de cartas a filtrar.
 * @param {string} category - Categoría seleccionada en el select.
 * @returns {Array} - Cartas que coinciden con la categoría.
 */
function GetCategory(cards, category) {
    // Si se eligió "All", no hace falta aplicar ningún filtro.
    if (category === "All") {
        return cards;
    }

    // Conserva las cartas cuyo tipo contiene la categoría seleccionada.
    return cards.filter((card) => card.type?.includes(category));
}

/**
 * Renderiza todas las cartas dentro del contenedor principal.
 * Se borra el contenido anterior y se crea una tarjeta por carta.
 *
 * @param {Array} cards - Listado de cartas a mostrar.
 */
function RenderCards(cards) {
    // Elimina el contenido previo para evitar duplicados al cambiar el filtro.
    cardsection.replaceChildren();

    // Obtiene solo las cartas que pertenecen a la categoría activa.
    GetCategory(cards, select.value).forEach((card) => {
        // Crea el contenedor principal de cada carta.
        const cardElement = document.createElement("article");
        // Aplica la clase CSS de tarjeta y su ancho fijo de presentación.
        cardElement.className = "card";
        cardElement.style.width = "18rem";

        // Si existe una imagen, la agrega a la tarjeta.
        if (card.imageUrl) {
            // Crea la imagen solo cuando la API proporciona una dirección válida.
            const image = document.createElement("img");
            // Marca la tarjeta y su imagen para activar el panel de información al pasar el cursor.
            cardElement.classList.add("card--has-image");
            image.className = "card-image";
            // Permite revelar los datos de la carta también al enfocar la imagen con el teclado.
            image.tabIndex = 0;
            // Establece la ruta de imagen entregada por la API.
            image.src = card.imageUrl;
            // Añade texto alternativo para accesibilidad o si la imagen no carga.
            image.alt = card.name ?? "Magic: The Gathering card";
            // Añade la imagen antes del bloque de datos de la carta.
            cardElement.append(image);
        }

        // Crea el cuerpo de la tarjeta y el título.
        const body = document.createElement("div");
        // Aplica los estilos de contenido definidos para el interior de la carta.
        body.className = "card-body card-info";

        // Crea el encabezado que presenta el nombre de la carta.
        const title = document.createElement("h5");
        title.className = "card-title";
        // Usa el nombre de la API o un texto alternativo si no está disponible.
        title.textContent = card.name ?? "Unknown card";
        // Inserta el nombre en el cuerpo de la carta.
        body.append(title);

        // Arreglo de detalles que se van a mostrar en la tarjeta.
        const details = [
            ["Coste", card.manaCost],
            ["Tipo", card.type],
            ["Tipos", card.types?.join(", ")],
            ["Color(es)", card.colors?.join(", ")],
            ["Edición", card.setName],
            ["Texto", card.text],
        ];

        // Agrega cada detalle a la tarjeta solo si existe información.
        details.forEach(([label, value]) => {
            // Omite los campos vacíos para no mostrar filas sin información.
            if (!value) {
                return;
            }

            // Crea un párrafo para presentar el dato de la carta.
            const detail = document.createElement("p");
            // Da formato de texto de carta a la descripción de reglas.
            detail.className = label === "Texto" ? "card-text" : "";

            if (label !== "Texto") {
                // Crea una etiqueta en negrita para distinguir el nombre del campo.
                const strong = document.createElement("strong");
                strong.textContent = `${label}: `;
                // Inserta la etiqueta antes del valor.
                detail.append(strong);
            }

            // Inserta el valor como texto para evitar interpretar HTML de la API.
            detail.append(document.createTextNode(value));
            // Añade el párrafo terminado al cuerpo de la carta.
            body.append(detail);
        });

        // Permite fijar o retraer el panel con un clic, además del efecto de hover.
        cardElement.addEventListener("click", () => {
            body.classList.toggle("show");
        });

        // Se agrega el contenido al artículo y luego al contenedor general.
        cardElement.append(body);
        // Añade la tarjeta completa a la cuadrícula de resultados.
        cardsection.append(cardElement);
    });
}

/**
 * Carga las cartas desde la API de Magic: The Gathering.
 * Se elimina información duplicada por nombre y se renderiza el resultado.
 */
async function LoadCards() {
    try {
        // Realiza la petición a la API.
        const response = await fetch("https://api.magicthegathering.io/v1/cards");

        // Verifica si la petición fue exitosa.
        if (!response.ok) {
            // Lanza un error con el código HTTP para mostrar por qué falló la petición.
            throw new Error(`La API respondió con el estado ${response.status}.`);
        }

        // Convierte la respuesta a JSON.
        const data = await response.json();

        // Asegura que el recurso sea una lista de cartas.
        if (!Array.isArray(data.cards)) {
            // Detiene el procesamiento si el formato recibido no contiene cartas.
            throw new Error("La respuesta de la API no contiene una lista de cartas.");
        }

        // Guarda solo una carta por nombre para evitar duplicados.
        // El Map permite consultar con rapidez si un nombre ya fue agregado.
        const cardsByName = new Map();
        data.cards.forEach((card) => {
            // Normaliza el nombre para ignorar espacios externos y diferencias de mayúsculas.
            const key = card.name?.trim().toLocaleLowerCase();

            if (key && !cardsByName.has(key)) {
                // Conserva la primera carta válida de cada nombre.
                cardsByName.set(key, card);
            }
        });

        // Guarda las cartas filtradas en la variable global.
        // Convierte los valores del Map a un arreglo para el renderizado.
        allCards = [...cardsByName.values()];
        // Muestra el primer conjunto de cartas usando el filtro seleccionado.
        RenderCards(allCards);
    } catch (error) {
        // Muestra un mensaje amigable si falla la carga o la validación.
        cardsection.textContent = `No se pudieron cargar las cartas: ${error.message}`;
        // Deja el detalle técnico en la consola para ayudar a diagnosticar el problema.
        console.error(error);
    }
}

// Cuando cambia la categoría seleccionada, se vuelven a renderizar las cartas.
select.addEventListener("change", () => {
    // Redibuja la colección con el valor actualizado del filtro.
    RenderCards(allCards);
});

// Carga inicial de cartas al abrir la página.
LoadCards();
