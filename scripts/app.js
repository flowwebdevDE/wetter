// --- Wettercode Icons ---

// --- Wettercode Text ---
const weatherText = code => {
    const map = {
        0: 'Klarer Himmel',
        1: 'Überwiegend klar',
        2: 'Teilweise bewölkt',
        3: 'Bewölkt',
        45: 'Nebel',
        48: 'Reifnebel',
        51: 'Leichter Nieselregen',
        53: 'Mäßiger Nieselregen',
        55: 'Starker Nieselregen',
        61: 'Leichter Regen',
        63: 'Mäßiger Regen',
        65: 'Starker Regen',
        71: 'Leichter Schneefall',
        73: 'Mäßiger Schneefall',
        75: 'Starker Schneefall',
        77: 'Schneekörner',
        80: 'Leichte Regenschauer',
        81: 'Mäßige Regenschauer',
        82: 'Starke Regenschauer',
        85: 'Leichte Schneeschauer',
        86: 'Starke Schneeschauer'
    };
    return map[code] || `Unbekannt (${code})`;
};

const iconForCode = c => {
    if (c === 0) return sun(); if (c <= 2) return partly(); if (c === 3) return cloud();
    if (c >= 45 && c <= 48) return fog(); if ((c >= 51 && c <= 67) || (c >= 80 && c <= 86)) return rain(); if (c >= 71 && c <= 77) return snow();
    return cloud();
};
function wrap(x) { 
  return `<svg class="icon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${x}</svg>`; 
}

// ☀ Sonne
const sun = () => wrap(`
  <circle cx="32" cy="32" r="14" fill="#FFDD57"/>
  <!--<g stroke="#FFDD57" stroke-width="4" stroke-linecap="round">
    <line x1="32" y1="6"  x2="32" y2="18"/>
    <line x1="32" y1="46" x2="32" y2="58"/>
    <line x1="6"  y1="32" x2="18" y2="32"/>
    <line x1="46" y1="32" x2="58" y2="32"/>
    <line x1="14" y1="14" x2="22" y2="22"/>
    <line x1="42" y1="42" x2="50" y2="50"/>
    <line x1="14" y1="50" x2="22" y2="42"/>
    <line x1="42" y1="22" x2="50" y2="14"/>
  </g>-->
`);

// 🌤 Teilweise sonnig
const partly = () => wrap(`
  <circle cx="22" cy="22" r="10" fill="#FFDD57"/>
  <path d="M18 44h28a10 10 0 0 0 0-20 16 16 0 0 0-30 6 10 10 0 0 0 2 14z"
        fill="#ddd"/>
`);

// ☁ Wolke
const cloud = () => wrap(`
  <path d="M20 44h28a10 10 0 0 0 0-20 16 16 0 0 0-30 6 10 10 0 0 0 2 14z"
        fill="#ddd"/>
`);

// 🌫 Nebel
const fog = () => wrap(`
  <rect x="10" y="26" width="44" height="6" rx="3" fill="#ccc"/>
  <rect x="8"  y="34" width="48" height="6" rx="3" fill="#cccccc96"/>
  <rect x="12" y="42" width="40" height="6" rx="3" fill="#ccc"/>
`);

// 🌧 Regen
const rain = () => wrap(`
  <path d="M18 30h28a10 10 0 0 0 0-20 16 16 0 0 0-30 6 10 10 0 0 0 2 14z"
        fill="#ddd"/>
  <g stroke="#4af" stroke-width="3" stroke-linecap="round">
    <line x1="24" y1="38" x2="24" y2="52"/>
    <line x1="32" y1="38" x2="32" y2="54"/>
    <line x1="40" y1="38" x2="40" y2="52"/>
  </g>
`);

// ❄ Schnee
const snow = () => wrap(`
  <g stroke="#88c" stroke-width="3" stroke-linecap="round">
    <line x1="32" y1="18" x2="32" y2="46"/>
    <line x1="18" y1="32" x2="46" y2="32"/>
    <line x1="22" y1="22" x2="42" y2="42"/>
    <line x1="22" y1="42" x2="42" y2="22"/>
  </g>
`);


// --- Autocomplete ---
const sb = document.getElementById('searchBox');
const sug = document.getElementById('suggestionsList');
let last = "";

sb.addEventListener('input', async () => {
    const q = sb.value.trim(); if (q.length < 2) { sug.innerHTML = ''; return; } if (q === last) return; last = q;
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=de`;
    try {
        const r = await fetch(url); const j = await r.json(); sug.innerHTML = ''; if (!j.results) return;
        j.results.forEach(loc => {
            const d = document.createElement('div'); d.style.padding = '8px'; d.style.cursor = 'pointer';
            d.textContent = `${loc.name}, ${loc.country}`;
            d.onclick = () => { sug.innerHTML = ''; sb.value = d.textContent; loadWeather(loc.latitude, loc.longitude, loc.name); };
            sug.appendChild(d);
        });
    } catch (e) { console.error(e) }
});

// --- Standort Button ---
document.getElementById('geoBtn').onclick = () => {
    navigator.geolocation.getCurrentPosition(p => {
        loadWeather(p.coords.latitude, p.coords.longitude, "Mein Standort");
    }, () => alert("Standort nicht erlaubt"));
};

// --- Wetter laden ---
async function loadWeather(lat, lon, label) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,sunrise,sunset&timezone=auto`;
    const r = await fetch(url); const j = await r.json(); render(j, lat, lon, label);
}

function render(data, lat, lon, label) {
    document.getElementById('weather').style.display = 'block';
    document.getElementById('placeName').textContent = label || `${lat.toFixed(3)},${lon.toFixed(3)}`;
    const cw = data.current_weather;
    document.getElementById('icon').innerHTML = `${iconForCode(cw.weathercode)}`
    document.getElementById('temp').innerHTML =
        `${cw.temperature}°C`;
    document.getElementById('currentSummary').innerHTML =
        `<strong>Wind: ${cw.windspeed} km/h<br>${weatherText(cw.weathercode)}</strong>`;

    const sunrise = data.daily.sunrise[0].split("T")[1];
    const sunset = data.daily.sunset[0].split("T")[1];

    let detailsHTML = `Sonnenaufgang: ${sunrise}<br>Sonnenuntergang: ${sunset}`;

    // Frostwarnung für den nächsten Morgen
    const nextDayMinTemp = data.daily.temperature_2m_min[1];
    if (nextDayMinTemp <= 0) {
        detailsHTML += `<br><br><strong style=" padding: 10px; background: rgba(0, 0, 255, 0.45); border-radius: 25px; color: #ffffffff;">❄️ Frostwarnung: Auto abdecken!</strong>`;
    }

    document.getElementById('details').innerHTML = detailsHTML;

    const grid = document.getElementById('forecastGrid'); grid.innerHTML = '';

    // Styles für horizontale Ansicht
    grid.style.display = 'flex';
    grid.style.overflowX = 'auto';

    for (let i = 0; i < data.daily.time.length; i++) {
        const day = document.createElement('div'); day.className = 'day';
        const code = data.daily.weathercode[i];
        const dayName = new Date(data.daily.time[i]).toLocaleDateString('de-DE', { weekday: 'short' });
        day.innerHTML = `
      <div style="font-weight:600">${dayName}</div>
      <div>${iconForCode(code)}</div>
        <div>${weatherText(code)}</div>
        <div>${data.daily.temperature_2m_max[i]}°C / ${data.daily.temperature_2m_min[i]}°C</div>

      <div>${data.daily.precipitation_sum[i]} mm</div>`;
        grid.appendChild(day);
    }
    
    renderDailyOverview(lat, lon); // <-- Tagesübersicht
}

// initial
navigator.geolocation.getCurrentPosition(
    p => loadWeather(p.coords.latitude, p.coords.longitude, "Mein Standort"),
    // Fallback auf Stuttgart, wenn Standort nicht erlaubt
    () => loadWeather(48.7758, 9.1829, "Stuttgart")
);

// --- PWA Install ---
let deferredPrompt;
const ib = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; ib.style.display = 'block' });
ib.onclick = async () => { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; ib.style.display = 'none' };

// --- Service Worker ---
if ('serviceWorker' in navigator) { navigator.serviceWorker.register('service-worker.js'); }

// --- Offline-Status anzeigen + Timestamp ---
function showOffline(timestamp) {
    const box = document.getElementById('offlineNotice');
    box.style.display = 'block';
    box.textContent = `Offline-Modus – Datenstand: ${timestamp}`;
}

// Override loadWeather to store timestamp
const _loadWeather = loadWeather;
loadWeather = async (lat, lon, label) => {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,sunrise,sunset&timezone=auto`;
        const r = await fetch(url);
        const j = await r.json();
        const stamp = new Date().toLocaleString();
        localStorage.setItem('weatherCache', JSON.stringify({ data: j, lat, lon, label, stamp }));
        document.getElementById('offlineNotice').style.display = 'none';
        render(j, lat, lon, label);
    } catch (e) {
        const cache = localStorage.getItem('weatherCache');
        if (cache) {
            const { data, lat, lon, label, stamp } = JSON.parse(cache);
            showOffline(stamp);
            render(data, lat, lon, label + " (Cache)");
        } else {
            alert('Offline und keine gespeicherten Daten verfügbar.');
        }
    }
};