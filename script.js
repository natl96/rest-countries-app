// Datos globales
let allCountries = [];
let currentDetail = null;

// Elementos DOM
const grid = document.getElementById('countries-grid');
const searchInput = document.getElementById('search-input');
const regionFilter = document.getElementById('region-filter');
const detailView = document.getElementById('detail-view');
const detailContent = document.getElementById('detail-content');
const backBtn = document.getElementById('back-btn');
const themeBtn = document.getElementById('theme-toggle');

// Cargar tema guardado
function loadTheme() {
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark');
        themeBtn.innerHTML = `<span id="theme-icon">☀️</span> Modo Claro`;
    } else {
        themeBtn.innerHTML = `<span id="theme-icon">🌙</span> Modo Oscuro`;
    }
}

// Cambiar tema
themeBtn.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeBtn.innerHTML = isDark
        ? `<span id="theme-icon">☀️</span> Modo Claro`
        : `<span id="theme-icon">🌙</span> Modo Oscuro`;
});

// Cargar datos desde data.json (ya en español)
async function fetchCountries() {
    try {
        const res = await fetch('data.json');
        allCountries = await res.json();
        renderCountries(allCountries);
    } catch (error) {
        console.error('Error al cargar data.json:', error);
        grid.innerHTML = `<p style="color:red; grid-column:1/-1; text-align:center; padding:40px;">Error al cargar los datos. Inténtalo más tarde.</p>`;
    }
}

// Renderizar tarjetas
function renderCountries(countries) {
    grid.innerHTML = '';
    if (countries.length === 0) {
        grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:40px;">No se encontraron países.</p>`;
        return;
    }
    countries.forEach(country => {
        const card = document.createElement('div');
        card.className = 'country-card';
        card.innerHTML = `
            <img src="${country.flags.png}" alt="Bandera de ${country.name}">
            <div class="country-info">
                <h3>${country.name}</h3>
                <p><strong>Población:</strong> ${country.population.toLocaleString('es-ES')}</p>
                <p><strong>Región:</strong> ${country.region}</p>
                <p><strong>Capital:</strong> ${country.capital || 'N/D'}</p>
            </div>
        `;
        card.addEventListener('click', () => showDetail(country));
        grid.appendChild(card);
    });
}

// Mostrar detalle
function showDetail(country) {
    currentDetail = country;
    grid.style.display = 'none';
    detailView.style.display = 'block';

    const idiomas = country.languages.map(l => l.name).join(', ');
    const monedas = country.currencies.map(c => c.name).join(', ');

    let bordersHTML = '<div class="border-countries"><strong>Países Fronterizos:</strong> ';
    if (country.borders && country.borders.length > 0) {
        bordersHTML += country.borders.map(code => {
            const vecino = allCountries.find(c => c.alpha3Code === code);
            return vecino ? `<button onclick="showBorder('${code}')">${vecino.name}</button>` : '';
        }).filter(Boolean).join('');
    } else {
        bordersHTML += 'Ninguno';
    }
    bordersHTML += '</div>';

    detailContent.innerHTML = `
        <img src="${country.flags.png}" alt="Bandera de ${country.name}">
        <div class="detail-info">
            <h2>${country.name}</h2>
            <div class="detail-row"><strong>Nombre Nativo:</strong> ${country.nativeName || country.name}</div>
            <div class="detail-row"><strong>Población:</strong> ${country.population.toLocaleString('es-ES')}</div>
            <div class="detail-row"><strong>Región:</strong> ${country.region}</div>
            <div class="detail-row"><strong>Subregión:</strong> ${country.subregion || 'N/D'}</div>
            <div class="detail-row"><strong>Capital:</strong> ${country.capital || 'N/D'}</div>
            <div class="detail-row"><strong>Dominio de nivel superior:</strong> ${country.topLevelDomain ? country.topLevelDomain[0] : 'N/D'}</div>
            <div class="detail-row"><strong>Monedas:</strong> ${monedas}</div>
            <div class="detail-row"><strong>Idiomas:</strong> ${idiomas}</div>
            ${bordersHTML}
        </div>
    `;
}

window.showBorder = function(code) {
    const country = allCountries.find(c => c.alpha3Code === code);
    if (country) showDetail(country);
};

backBtn.addEventListener('click', () => {
    detailView.style.display = 'none';
    grid.style.display = 'grid';
    filterCountries();
});

function filterCountries() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedRegion = regionFilter.value;

    const regionMap = {
        'Africa': 'África', 'Americas': 'América',
        'Asia': 'Asia', 'Europe': 'Europa', 'Oceania': 'Oceanía',
    };

    let filtered = allCountries;
    if (searchTerm) {
        filtered = filtered.filter(c => c.name.toLowerCase().includes(searchTerm));
    }
    if (selectedRegion) {
        const regionES = regionMap[selectedRegion] || selectedRegion;
        filtered = filtered.filter(c => c.region === regionES);
    }
    renderCountries(filtered);
}

searchInput.addEventListener('input', filterCountries);
regionFilter.addEventListener('change', filterCountries);

// Inicializar
loadTheme();
fetchCountries();
