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
function wrap(x) { return `<svg class="icon" viewBox="0 0 64 64">${x}</svg>` }
const sun = () => wrap('<circle cx="32" cy="32" r="14" fill="#FFDD57"/>');
const partly = () => wrap('<circle cx="26" cy="26" r="10" fill="#FFDD57"/><path d="M16 42c10-10 30-10 40 0" fill="#ddd"/>');
const cloud = () => wrap('<path d="M18 40a10 10 0 0 1 0-20 16 16 0 0 1 32 7 10 10 0 0 1-6 13H20" fill="#ddd"/>');
const fog = () => wrap('<rect x="10" y="30" width="44" height="8" fill="#ccc" rx="3"/>');
const rain = () => wrap('<path d="M16 30c10-10 30-10 40 0" fill="#ddd"/><line x1="26" y1="40" x2="26" y2="52" stroke="#4af" stroke-width="3"/><line x1="36" y1="40" x2="36" y2="54" stroke="#4af" stroke-width="3"/><line x1="46" y1="40" x2="46" y2="52" stroke="#4af" stroke-width="3"/>');
const snow = () => wrap('<text x="20" y="44" font-size="28">❄</text>');

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
    document.getElementById('currentSummary').innerHTML =
        `Jetzt: ${cw.temperature}°C — Wind ${cw.windspeed} km/h — ${weatherText(cw.weathercode)} ${iconForCode(cw.weathercode)}`;

    document.getElementById('details').innerHTML = `Sonnenaufgang: ${data.daily.sunrise[0]} — Sonnenuntergang: ${data.daily.sunset[0]}`;

    const grid = document.getElementById('forecastGrid'); grid.innerHTML = '';
    for (let i = 0; i < data.daily.time.length; i++) {
        const day = document.createElement('div'); day.className = 'day';
        const code = data.daily.weathercode[i];
        day.innerHTML = `
      <div style="font-weight:600">${data.daily.time[i]}</div>
      <div>${iconForCode(code)}</div>
        <div>${weatherText(code)}</div>
        <div>${data.daily.temperature_2m_max[i]}°C / ${data.daily.temperature_2m_min[i]}°C</div>

      <div>${data.daily.precipitation_sum[i]} mm</div>`;
        grid.appendChild(day);
    }
}

// initial
loadWeather(52.52, 13.405, 'Berlin');

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