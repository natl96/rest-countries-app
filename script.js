// Datos globales
let allCountries = [];
let currentDetail = null;

// Traducciones de regiones (para mostrar en español)
const regionesES = {
    'Africa': 'África',
    'Americas': 'América',
    'Asia': 'Asia',
    'Europe': 'Europa',
    'Oceania': 'Oceanía',
    'Polar': 'Polar',
    'Antarctic': 'Antártida'
};

// Traducciones de subregiones
const subregionesES = {
    'Southern Asia': 'Asia del Sur',
    'Northern Europe': 'Europa del Norte',
    'Southern Europe': 'Europa del Sur',
    'Northern Africa': 'África del Norte',
    'Western Africa': 'África Occidental',
    'Eastern Africa': 'África Oriental',
    'Middle Africa': 'África Central',
    'Southern Africa': 'África del Sur',
    'South America': 'América del Sur',
    'North America': 'América del Norte',
    'Central America': 'América Central',
    'Caribbean': 'Caribe',
    'Eastern Asia': 'Asia Oriental',
    'South-Eastern Asia': 'Asia del Sureste',
    'Western Asia': 'Asia Occidental',
    'Central Asia': 'Asia Central',
    'Eastern Europe': 'Europa del Este',
    'Western Europe': 'Europa Occidental',
    'Melanesia': 'Melanesia',
    'Micronesia': 'Micronesia',
    'Polynesia': 'Polinesia',
    'Australia and New Zealand': 'Australia y Nueva Zelanda'
};

// Elementos DOM
const grid = document.getElementById('countries-grid');
const searchInput = document.getElementById('search-input');
const regionFilter = document.getElementById('region-filter');
const detailView = document.getElementById('detail-view');
const detailContent = document.getElementById('detail-content');
const backBtn = document.getElementById('back-btn');
const themeBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

// Obtener nombre en español
function getNombreES(country) {
    return country.translations?.es || country.name;
}

// Cargar tema
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

// Cargar datos
async function fetchCountries() {
    try {
        const res = await fetch('data.json');
        allCountries = await res.json();
        renderCountries(allCountries);
    } catch (error) {
        console.error('Error:', error);
        grid.innerHTML = `<p style="color:red; grid-column:1/-1; text-align:center; padding:40px;">Error al cargar los datos.</p>`;
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
        const nombreES = getNombreES(country);
        const regionES = regionesES[country.region] || country.region;

        const card = document.createElement('div');
        card.className = 'country-card';
        card.innerHTML = `
            <img src="${country.flags.png}" alt="Bandera de ${nombreES}">
            <div class="country-info">
                <h3>${nombreES}</h3>
                <p><strong>Población:</strong> ${country.population.toLocaleString('es-ES')}</p>
                <p><strong>Región:</strong> ${regionES}</p>
                <p><strong>Capital:</strong> ${country.capital || 'N/A'}</p>
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

    const nombreES = getNombreES(country);
    const regionES = regionesES[country.region] || country.region;
    const subregionES = subregionesES[country.subregion] || country.subregion || 'N/A';

    const idiomas = country.languages.map(l => l.name).join(', ');
    const monedas = country.currencies.map(c => c.name).join(', ');

    let borderHTML = '<div class="border-countries"><strong>Países fronterizos:</strong> ';
    if (country.borders?.length > 0) {
        borderHTML += country.borders.map(code => {
            const borderCountry = allCountries.find(c => c.alpha3Code === code);
            return borderCountry 
                ? `<button onclick="showBorder('${code}')">${getNombreES(borderCountry)}</button>` 
                : '';
        }).join('');
    } else {
        borderHTML += 'Ninguno';
    }
    borderHTML += '</div>';

    detailContent.innerHTML = `
        <img src="${country.flags.png}" alt="Bandera de ${nombreES}">
        <div class="detail-info">
            <h2>${nombreES}</h2>
            <div class="detail-row"><strong>Nombre nativo:</strong> ${country.nativeName || nombreES}</div>
            <div class="detail-row"><strong>Población:</strong> ${country.population.toLocaleString('es-ES')}</div>
            <div class="detail-row"><strong>Región:</strong> ${regionES}</div>
            <div class="detail-row"><strong>Subregión:</strong> ${subregionES}</div>
            <div class="detail-row"><strong>Capital:</strong> ${country.capital || 'N/A'}</div>
            <div class="detail-row"><strong>Dominio superior:</strong> ${country.topLevelDomain?.[0] || 'N/A'}</div>
            <div class="detail-row"><strong>Monedas:</strong> ${monedas}</div>
            <div class="detail-row"><strong>Idiomas:</strong> ${idiomas}</div>
            ${borderHTML}
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
    const selectedRegion = regionFilter.value;   // valor en inglés (Africa, Americas...)

    let filtered = allCountries;

    if (searchTerm) {
        filtered = filtered.filter(c => 
            getNombreES(c).toLowerCase().includes(searchTerm)
        );
    }

    if (selectedRegion) {
        filtered = filtered.filter(c => c.region === selectedRegion);
    }

    renderCountries(filtered);
}

searchInput.addEventListener('input', filterCountries);
regionFilter.addEventListener('change', filterCountries);

// Inicializar
loadTheme();
fetchCountries();
