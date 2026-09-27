
// Estado

let pokemonList = [];
let fighter1 = null;
let fighter2 = null;

let fighter1HP = 0;
let fighter2HP = 0;

let searchTimer1;
let searchTimer2;

let gameOver = false;


// Elementos del DOM

const pickerScreen = document.getElementById("picker-screen");
const battleScreen = document.getElementById("battle-screen");

const search1 = document.getElementById("search-1");
const search2 = document.getElementById("search-2");

const suggestions1 = document.getElementById("suggestions-1");
const suggestions2 = document.getElementById("suggestions-2");

const selected1 = document.getElementById("selected-1");
const selected2 = document.getElementById("selected-2");

const startBattleBtn = document.getElementById("start-battle-btn");
const playAgainBtn = document.getElementById("play-again-btn");

const pickerMessage = document.getElementById("picker-message");
const battleMessage = document.getElementById("battle-message");

const battleName1 = document.getElementById("battle-name-1");
const battleName2 = document.getElementById("battle-name-2");

const battleSprite1 = document.getElementById("battle-sprite-1");
const battleSprite2 = document.getElementById("battle-sprite-2");

const hpText1 = document.getElementById("hp-text-1");
const hpText2 = document.getElementById("hp-text-2");

const hpFill1 = document.getElementById("hp-fill-1");
const hpFill2 = document.getElementById("hp-fill-2");

const moves1 = document.getElementById("moves-1");
const moves2 = document.getElementById("moves-2");


// API

async function loadPokemonList() {

    pickerMessage.textContent = "Cargando Pokémon...";

    try {

        const response = await fetch(
            "https://pokeapi.co/api/v2/pokemon?limit=1000"
        );

        if (!response.ok) {
            throw new Error("Error al cargar Pokémon.");
        }

        const data = await response.json();

        pokemonList = data.results;

        pickerMessage.textContent = "";

    } catch (error) {

        console.error(error);

        pickerMessage.textContent =
            "No se pudo cargar la lista de Pokémon.";
    }
}


async function fetchPokemon(name) {

    try {

        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${name}`
        );

        if (!response.ok) {
            throw new Error("Pokémon no encontrado.");
        }

        return await response.json();

    } catch (error) {

        console.error(error);

        return null;
    }
}


// Search

function searchPokemon(text, container, fighterNumber) {

    const searchText = text.toLowerCase().trim();

    container.innerHTML = "";

    if (searchText === "") {
        return;
    }

    const matches = pokemonList
        .filter(pokemon => pokemon.name.includes(searchText))
        .slice(0, 8);

    if (matches.length === 0) {

        container.textContent =
            "No se encontraron Pokémon.";

        return;
    }

    matches.forEach(pokemon => {

        const button = document.createElement("button");

        button.textContent = pokemon.name;
        button.classList.add("suggestion");

        button.addEventListener("click", () => {
            selectPokemon(pokemon.name, fighterNumber);
        });

        container.appendChild(button);
    });
}


// Seleccionar pokemon

async function selectPokemon(name, fighterNumber) {

    pickerMessage.textContent = "Cargando Pokémon...";

    const pokemon = await fetchPokemon(name);

    if (!pokemon) {

        pickerMessage.textContent =
            "No se encontró ese Pokémon.";

        return;
    }

    if (fighterNumber === 1) {

        fighter1 = pokemon;

        renderSelectedPokemon(
            fighter1,
            selected1
        );

        search1.value = pokemon.name;
        suggestions1.innerHTML = "";

    } else {

        fighter2 = pokemon;

        renderSelectedPokemon(
            fighter2,
            selected2
        );

        search2.value = pokemon.name;
        suggestions2.innerHTML = "";
    }

    pickerMessage.textContent = "";

    updateStartButton();
}



// Mostrat pokeon seleccionado

function renderSelectedPokemon(pokemon, container) {

    container.innerHTML = "";

    const image = document.createElement("img");

    image.src = pokemon.sprites.front_default;
    image.alt = pokemon.name;

    const name = document.createElement("p");

    name.textContent = pokemon.name.toUpperCase();

    container.appendChild(image);
    container.appendChild(name);
}



// Boton comenzar 

function updateStartButton() {

    startBattleBtn.disabled =
        !(fighter1 && fighter2);
}


// Batalla

function startBattle() {

    gameOver = false;

    fighter1HP = getPokemonHP(fighter1);
    fighter2HP = getPokemonHP(fighter2);

    pickerScreen.classList.add("hidden");
    battleScreen.classList.remove("hidden");

    battleMessage.textContent = "";

    renderBattlePokemon(fighter1, 1);
    renderBattlePokemon(fighter2, 2);
}


// HP

function getPokemonHP(pokemon) {

    const hpStat = pokemon.stats.find(
        stat => stat.stat.name === "hp"
    );

    return hpStat.base_stat;
}


// Mostrar Pokemon en la Batalla

function renderBattlePokemon(pokemon, fighterNumber) {

    if (fighterNumber === 1) {

        battleName1.textContent =
            pokemon.name.toUpperCase();

        battleSprite1.src =
            pokemon.sprites.front_default;

        battleSprite1.alt =
            pokemon.name;

        renderMoves(pokemon, moves1, 1);

        updateHP(1);

    } else {

        battleName2.textContent =
            pokemon.name.toUpperCase();

        battleSprite2.src =
            pokemon.sprites.back_default;

        battleSprite2.alt =
            pokemon.name;

        renderMoves(pokemon, moves2, 2);

        updateHP(2);
    }
}


// Movimientos


function renderMoves(pokemon, container, fighterNumber) {

    container.innerHTML = "";

    pokemon.moves.slice(0, 4).forEach(moveData => {

        const button = document.createElement("button");

        button.textContent = moveData.move.name;

        button.addEventListener("click", () => {
            attack(fighterNumber);
        });

        container.appendChild(button);
    });
}


// Ataque

function attack(attackingFighter) {

    if (gameOver) {
        return;
    }

    const damage =
        Math.floor(Math.random() * 20) + 1;

    if (attackingFighter === 1) {

        fighter2HP -= damage;

        if (fighter2HP < 0) {
            fighter2HP = 0;
        }

        updateHP(2);

        battleMessage.textContent =
            `${fighter1.name.toUpperCase()} hizo ${damage} de daño.`;

        if (fighter2HP === 0) {
            endBattle(fighter1.name);
        }

    } else {

        fighter1HP -= damage;

        if (fighter1HP < 0) {
            fighter1HP = 0;
        }

        updateHP(1);

        battleMessage.textContent =
            `${fighter2.name.toUpperCase()} hizo ${damage} de daño.`;

        if (fighter1HP === 0) {
            endBattle(fighter2.name);
        }
    }
}


// Actualizar HP

function updateHP(fighterNumber) {

    if (fighterNumber === 1) {

        const maxHP = getPokemonHP(fighter1);

        hpText1.textContent =
            `${fighter1HP} / ${maxHP}`;

        hpFill1.style.width =
            `${(fighter1HP / maxHP) * 100}%`;

    } else {

        const maxHP = getPokemonHP(fighter2);

        hpText2.textContent =
            `${fighter2HP} / ${maxHP}`;

        hpFill2.style.width =
            `${(fighter2HP / maxHP) * 100}%`;
    }
}



// Final de la batalla


function endBattle(winnerName) {

    gameOver = true;

    battleMessage.textContent =
        ` ${winnerName.toUpperCase()} ganó la batalla!`;
}


// Reiniciar

function resetGame() {

    fighter1 = null;
    fighter2 = null;

    fighter1HP = 0;
    fighter2HP = 0;

    gameOver = false;

    search1.value = "";
    search2.value = "";

    suggestions1.innerHTML = "";
    suggestions2.innerHTML = "";

    selected1.innerHTML = "";
    selected2.innerHTML = "";

    pickerMessage.textContent = "";

    startBattleBtn.disabled = true;

    battleMessage.textContent = "";

    battleScreen.classList.add("hidden");
    pickerScreen.classList.remove("hidden");
}



// Debounce


search1.addEventListener("input", () => {

    clearTimeout(searchTimer1);

    searchTimer1 = setTimeout(() => {

        searchPokemon(
            search1.value,
            suggestions1,
            1
        );

    }, 300);
});


search2.addEventListener("input", () => {

    clearTimeout(searchTimer2);

    searchTimer2 = setTimeout(() => {

        searchPokemon(
            search2.value,
            suggestions2,
            2
        );

    }, 300);
});


// Eventos
startBattleBtn.addEventListener(
    "click",
    startBattle
);

playAgainBtn.addEventListener(
    "click",
    resetGame
);


// Inicio


loadPokemonList();

