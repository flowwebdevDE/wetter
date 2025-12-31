console.log("app.js geladen!");

// ================= Wettercode Text =================
const weatherText = code => {
    code = Number(code);
    const map = {
        0:'Klarer Himmel',1:'Überwiegend klar',2:'Teilweise bewölkt',3:'Bewölkt',
        45:'Nebel',48:'Reifnebel',
        51:'Leichter Nieselregen',53:'Mäßiger Nieselregen',55:'Starker Nieselregen',
        56:'Leichter gefrierender Nieselregen',57:'Starker gefrierender Nieselregen',
        61:'Leichter Regen',63:'Mäßiger Regen',65:'Starker Regen',
        66:'Leichter gefrierender Regen',67:'Starker gefrierender Regen',
        71:'Leichter Schneefall',73:'Mäßiger Schneefall',75:'Starker Schneefall',77:'Schneekörner',
        80:'Leichte Regenschauer',81:'Mäßige Regenschauer',82:'Starke Regenschauer',
        85:'Leichte Schneeschauer',86:'Starke Schneeschauer',
        95:'Gewitter',96:'Gewitter mit leichtem Hagel',99:'Gewitter mit starkem Hagel'
    };
    return map[code] ?? `Unbekannt (${code})`;
};

// ================= Icons =================
const wrap = x => `<svg class="icon" viewBox="0 0 64 64">${x}</svg>`;
const sun = () => wrap(`<circle cx="32" cy="32" r="14" fill="#FFDD57"/>`);
const partly = () => wrap(`<circle cx="22" cy="22" r="10" fill="#FFDD57"/><path d="M18 44h28a10 10 0 0 0 0-20 16 16 0 0 0-30 6 10 10 0 0 0 2 14z" fill="#ddd"/>`);
const cloud = () => wrap(`<path d="M20 44h28a10 10 0 0 0 0-20 16 16 0 0 0-30 6 10 10 0 0 0 2 14z" fill="#ddd"/>`);
const fog = () => wrap(`<rect x="10" y="26" width="44" height="6" rx="3" fill="#ccc"/><rect x="8" y="36" width="48" height="6" rx="3" fill="#ccc"/>`);
const rain = () => wrap(`<path d="M18 30h28a10 10 0 0 0 0-20 16 16 0 0 0-30 6 10 10 0 0 0 2 14z" fill="#ddd"/><g stroke="#4af" stroke-width="3"><line x1="24" y1="38" x2="24" y2="54"/><line x1="32" y1="38" x2="32" y2="56"/><line x1="40" y1="38" x2="40" y2="54"/></g>`);
const snow = () => wrap(`<g stroke="#88c" stroke-width="3"><line x1="32" y1="18" x2="32" y2="46"/><line x1="18" y1="32" x2="46" y2="32"/><line x1="22" y1="22" x2="42" y2="42"/><line x1="22" y1="42" x2="42" y2="22"/></g>`);
const storm = () => wrap(`<path d="M18 36h28a10 10 0 0 0 0-20 16 16 0 0 0-30 6 10 10 0 0 0 2 14z" fill="#bbb"/><polygon points="30,38 26,52 34,52" fill="#FFD700"/>`);

const iconForCode = c => {
    c = Number(c);
    if (c === 0) return sun();
    if (c <= 2) return partly();
    if (c === 3) return cloud();
    if (c === 45 || c === 48) return fog();
    if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return rain();
    if ((c >= 71 && c <= 77) || (c >= 85 && c <= 86)) return snow();
    if (c >= 95) return storm();
    return cloud();
};

// ================= Wetter laden =================
async function loadWeather(lat, lon, label) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,sunrise,sunset&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();
    render(data, lat, lon, label);
}

// ================= Render =================
function render(data, lat, lon, label) {
    const weatherEl = document.getElementById('weather');
    if (!weatherEl) {
        console.error("Element #weather fehlt im HTML");
        return;
    }
    weatherEl.style.display = 'block';

    document.getElementById('placeName').textContent =
        label ?? `${lat.toFixed(2)}, ${lon.toFixed(2)}`;

    const cw = data.current_weather;
    document.getElementById('icon').innerHTML = iconForCode(cw.weathercode);
    document.getElementById('temp').textContent = `${cw.temperature}°C`;
    document.getElementById('currentSummary').innerHTML =
        `<strong>${weatherText(cw.weathercode)}<br>Wind ${cw.windspeed} km/h</strong>`;

    renderDailyOverview(data);
    renderForecast(data);
}

// ================= Tagesübersicht =================
function renderDailyOverview(data) {
    const el = document.getElementById('details');
    if (!el) return;

    const code = data.daily.weathercode[0];
    el.innerHTML = `
        <h3>Heute</h3>
        ${iconForCode(code)}
        <p><strong>${weatherText(code)}</strong></p>
        <p>🌡️ ${data.daily.temperature_2m_max[0]}°C /
             ${data.daily.temperature_2m_min[0]}°C</p>
        <p>🌧️ ${data.daily.precipitation_sum[0]} mm</p>
        <p>🌅 ${data.daily.sunrise[0].split("T")[1]}
           🌇 ${data.daily.sunset[0].split("T")[1]}</p>
    `;
}

// ================= 7-Tage Vorschau =================
function renderForecast(data) {
    const grid = document.getElementById('forecastGrid');
    if (!grid) return;

    grid.innerHTML = '';
    for (let i = 1; i < data.daily.time.length; i++) {
        const code = data.daily.weathercode[i];
        const day = document.createElement('div');
        day.className = 'day';
        day.innerHTML = `
            <div><strong>${new Date(data.daily.time[i])
                .toLocaleDateString('de-DE', { weekday: 'short' })}</strong></div>
            ${iconForCode(code)}
            <div>${weatherText(code)}</div>
            <div>${data.daily.temperature_2m_max[i]}° /
                 ${data.daily.temperature_2m_min[i]}°</div>
        `;
        grid.appendChild(day);
    }
}

// ================= Auto-Start =================
window.addEventListener("load", () => {
    navigator.geolocation.getCurrentPosition(
        p => loadWeather(p.coords.latitude, p.coords.longitude, "Mein Standort"),
        () => loadWeather(48.7758, 9.1829, "Stuttgart")
    );
});
