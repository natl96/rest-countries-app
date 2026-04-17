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
const themeIcon = document.getElementById('theme-icon');

// Cargar tema
function loadTheme() {
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark');
        themeIcon.textContent = '☀️';
        themeBtn.innerHTML = `<span id="theme-icon">☀️</span> Light Mode`;
    } else {
        themeIcon.textContent = '🌙';
        themeBtn.innerHTML = `<span id="theme-icon">🌙</span> Dark Mode`;
    }
}

// Cambiar tema
themeBtn.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
        themeIcon.textContent = '☀️';
        themeBtn.innerHTML = `<span id="theme-icon">☀️</span> Light Mode`;
    } else {
        themeIcon.textContent = '🌙';
        themeBtn.innerHTML = `<span id="theme-icon">🌙</span> Dark Mode`;
    }
});

// Obtener datos de la API 
async function fetchCountries() {
    try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,population,region,capital,cca3,subregion,tld,currencies,languages,borders');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        allCountries = await res.json();
        renderCountries(allCountries);
    } catch (error) {
        console.error('Error al cargar países:', error);
        grid.innerHTML = `
            <p style="color:red; grid-column:1/-1; text-align:center; padding:40px;">
                ❌ Error al cargar los datos:<br>
                <small>${error.message}</small><br><br>
                Prueba en modo incógnito o desactiva el bloqueador de anuncios.
            </p>`;
    }
}

// Renderizar tarjetas (el resto es igual)
function renderCountries(countries) {
    grid.innerHTML = '';
    if (countries.length === 0) {
        grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:40px;">No se encontraron países</p>`;
        return;
    }
    countries.forEach(country => {
        const card = document.createElement('div');
        card.className = 'country-card';
        card.innerHTML = `
            <img src="${country.flags.png}" alt="${country.name.common}">
            <div class="country-info">
                <h3>${country.name.common}</h3>
                <p><strong>Population:</strong> ${country.population.toLocaleString('es-ES')}</p>
                <p><strong>Region:</strong> ${country.region}</p>
                <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
            </div>
        `;
        card.addEventListener('click', () => showDetail(country));
        grid.appendChild(card);
    });
}

function showDetail(country) { /* ... mismo código de antes ... */ 
    currentDetail = country;
    grid.style.display = 'none';
    detailView.style.display = 'block';
    
    const languages = Object.values(country.languages || {}).join(', ');
    const currencies = Object.values(country.currencies || {}).map(c => c.name).join(', ');
    
    let bordersHTML = '<p><strong>Border Countries:</strong> ';
    if (country.borders && country.borders.length > 0) {
        bordersHTML += country.borders.map(code => {
            const borderCountry = allCountries.find(c => c.cca3 === code);
            return borderCountry 
                ? `<button onclick="showBorder('${code}')">${borderCountry.name.common}</button>` 
                : '';
        }).join('');
    } else {
        bordersHTML += 'None';
    }
    bordersHTML += '</p>';
    
    detailContent.innerHTML = `
        <img src="${country.flags.png}" alt="${country.name.common}">
        <div class="detail-info">
            <h2>${country.name.common}</h2>
            <div class="detail-row"><strong>Native Name:</strong> ${country.name.nativeName ? Object.values(country.name.nativeName)[0].common : country.name.common}</div>
            <div class="detail-row"><strong>Population:</strong> ${country.population.toLocaleString('es-ES')}</div>
            <div class="detail-row"><strong>Region:</strong> ${country.region}</div>
            <div class="detail-row"><strong>Sub Region:</strong> ${country.subregion || 'N/A'}</div>
            <div class="detail-row"><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</div>
            <div class="detail-row"><strong>Top Level Domain:</strong> ${country.tld ? country.tld[0] : 'N/A'}</div>
            <div class="detail-row"><strong>Currencies:</strong> ${currencies}</div>
            <div class="detail-row"><strong>Languages:</strong> ${languages}</div>
            <div class="border-countries">${bordersHTML}</div>
        </div>
    `;
}

window.showBorder = function(cca3) {
    const country = allCountries.find(c => c.cca3 === cca3);
    if (country) showDetail(country);
};

backBtn.addEventListener('click', () => {
    detailView.style.display = 'none';
    grid.style.display = 'grid';
    renderCountries(allCountries);
});

function filterCountries() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedRegion = regionFilter.value;
    let filtered = allCountries;
    if (searchTerm) filtered = filtered.filter(c => c.name.common.toLowerCase().includes(searchTerm));
    if (selectedRegion) filtered = filtered.filter(c => c.region === selectedRegion);
    renderCountries(filtered);
}

searchInput.addEventListener('input', filterCountries);
regionFilter.addEventListener('change', filterCountries);

// Inicializar
loadTheme();
fetchCountries();
