const select = document.querySelector(".form-select");
const cardsection = document.querySelector(".cards");
let allCards = [];

function GetCategory(cards, category) {
    if (category === "All") return cards;
    return cards.filter(card => card.type?.includes(category));
}

function RenderCards(cards) {
    cardsection.replaceChildren();

    GetCategory(cards, select.value).forEach(card => {
        const cardElement = document.createElement("article");
        cardElement.className = "card";
        cardElement.style.width = "18rem";

        if (card.imageUrl) {
            const image = document.createElement("img");
            image.src = card.imageUrl;
            image.alt = card.name ?? "Magic: The Gathering card";
            cardElement.append(image);
        }

        const body = document.createElement("div");
        body.className = "card-body";

        const title = document.createElement("h5");
        title.className = "card-title";
        title.textContent = card.name ?? "Unknown card";
        body.append(title);

        const details = [
            ["Coste", card.manaCost],
            ["Tipo", card.type],
            ["Tipos", card.types?.join(", ")],
            ["Color(es)", card.colors?.join(", ")],
            ["Edición", card.setName],
            ["Texto", card.text]
        ];

        details.forEach(([label, value]) => {
            if (!value) return;
            const detail = document.createElement("p");
            detail.className = label === "Texto" ? "card-text" : "";

            if (label !== "Texto") {
                const strong = document.createElement("strong");
                strong.textContent = `${label}: `;
                detail.append(strong);
            }

            detail.append(document.createTextNode(value));
            body.append(detail);
        });

        cardElement.append(body);
        cardsection.append(cardElement);
    });
}

async function LoadCards() {
    try {
        const response = await fetch("https://api.magicthegathering.io/v1/cards");
        if (!response.ok) {
            throw new Error(`La API respondió con el estado ${response.status}.`);
        }

        const data = await response.json();
        if (!Array.isArray(data.cards)) {
            throw new Error("La respuesta de la API no contiene una lista de cartas.");
        }

        const cardsByName = new Map();
        data.cards.forEach(card => {
            const key = card.name?.trim().toLocaleLowerCase();
            if (key && !cardsByName.has(key)) {
                cardsByName.set(key, card);
            }
        });

        allCards = [...cardsByName.values()];
        RenderCards(allCards);
    } catch (error) {
        cardsection.textContent = `No se pudieron cargar las cartas: ${error.message}`;
        console.error(error);
    }
}

select.addEventListener("change", () => RenderCards(allCards));
LoadCards();
