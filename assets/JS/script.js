const cardsSection = document.querySelector(".cards");
const apiURL = "https://api.magicthegathering.io/v1/cards";

async function getCards() {
    try {
        const res = await fetch(apiURL);
        const data = await res.json();

        // FILTRO: Nos quedamos solo con las cartas que tienen "imageUrl" 
        // para evitar que salgan repetidas o sin imagen.
        const cardsWithImages = data.cards.filter(card => card.imageUrl);

        return cardsWithImages;
    } catch (error) {
        console.error("Error al obtener las cartas:", error);
        return [];
    }
}

async function renderCards() {
    const cards = await getCards();
    let template = "";

    cards.forEach((card) => {
        const cardName = card.name || "Nombre desconocido";
        const manaCost = card.manaCost ? card.manaCost : "Sin coste";
        const text = card.text ? card.text : " ";
        const colors = card.colors ? card.colors.join(", ") : "Incolora";
        const type = card.type || (card.types ? card.types.join(" - ") : "Desconocido");
        const types = card.types ? card.types.join(", ") : "Desconocido";
        const setEdition = card.setName || "Edición desconocida";

        template += `
        <div class="card" style="width: 18rem;">
            <img src="${card.imageUrl}" class="${cardName}" alt="${cardName}">
            <div class="card-body">
            <h5 class="card-title">${cardName}</h5>
            <p><strong>Coste:</strong>${manaCost}</p>
            <p><strong>Tipo:</strong> ${type}</p>
            <p><strong>Tipos:</strong> ${types}</p>
            <p><strong>Color(es):</strong> ${colors}</p>
            <p><strong>Edición:</strong> ${setEdition}</p>
            <p class="card-text">${text}</p>
            <a href="#" class="btn btn-primary">Go somewhere</a>
        </div>
</div>
        `;
    });

    cardsSection.innerHTML = template;
}

renderCards();