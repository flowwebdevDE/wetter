/**
 * Wetter App - Modulare Struktur
 */

/**
 * Eigene Toast-Benachrichtigung anstelle von nativem alert()
 */
window.showToast = (msg, duration = 3000) => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        Object.assign(container.style, {
            position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
            zIndex: '10000', pointerEvents: 'none', width: 'max-content', maxWidth: '80%'
        });
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.textContent = msg;
    Object.assign(toast.style, {
        background: 'rgba(50, 50, 50, 0.95)', color: '#fff', padding: '12px 24px',
        borderRadius: '30px', marginBottom: '10px', fontSize: '0.9rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)', textAlign: 'center', transition: 'opacity 0.4s ease'
    });
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, duration);
};

const WEATHER_CONFIG = {
    text: (code) => {
        const map = {
            0: 'Klarer Himmel', 1: 'Überwiegend klar', 2: 'Teilweise bewölkt', 3: 'Bewölkt',
            45: 'Nebel', 48: 'Reifnebel', 51: 'Leichter Nieselregen', 53: 'Mäßiger Nieselregen',
            55: 'Starker Nieselregen', 61: 'Leichter Regen', 63: 'Mäßiger Regen', 65: 'Starker Regen',
            71: 'Leichter Schneefall', 73: 'Mäßiger Schneefall', 75: 'Starker Schneefall', 77: 'Schneekörner',
            80: 'Leichte Regenschauer', 81: 'Mäßige Regenschauer', 82: 'Starke Regenschauer',
            85: 'Leichte Schneeschauer', 86: 'Starke Schneeschauer', 95: 'Gewitter', 96: 'Gewitter mit Hagel'
        };
        return map[code] || `Unbekannt (${code})`;
    }
};

const UI_ICONS = {
    wrap: (inner, size = 64) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`,
    sun: () => UI_ICONS.wrap(`<circle cx="32" cy="32" r="14" fill="#FFDD57"/>`),
    moon: () => UI_ICONS.wrap(`<path d="M48 42a16 16 0 1 1-16-30 12 12 0 0 0 16 30z" fill="#F4F4F4"/>`),
    partly: (isNight) => UI_ICONS.wrap(`${isNight ? '<path d="M40 30a12 12 0 1 1-12-22 8 8 0 0 0 12 22z" fill="#F4F4F4"/>' : '<circle cx="22" cy="22" r="10" fill="#FFDD57"/>'}<path d="M18 44h28a10 10 0 0 0 0-20 16 16 0 0 0-30 6 10 10 0 0 0 2 14z" fill="#ddd"/>`),
    cloud: () => UI_ICONS.wrap(`<path d="M20 44h28a10 10 0 0 0 0-20 16 16 0 0 0-30 6 10 10 0 0 0 2 14z" fill="#ddd"/>`),
    fog: () => UI_ICONS.wrap(`<rect x="10" y="26" width="44" height="6" rx="3" fill="#ccc"/><rect x="8" y="34" width="48" height="6" rx="3" fill="#aaa"/><rect x="12" y="42" width="40" height="6" rx="3" fill="#ccc"/>`),
    rain: () => UI_ICONS.wrap(`<path d="M18 30h28a10 10 0 0 0 0-20 16 16 0 0 0-30 6 10 10 0 0 0 2 14z" fill="#ddd"/><g stroke="#4af" stroke-width="3" stroke-linecap="round"><line x1="24" y1="38" x2="24" y2="52"/><line x1="32" y1="38" x2="32" y2="54"/><line x1="40" y1="38" x2="40" y2="52"/></g>`),
    snow: () => UI_ICONS.wrap(`<g stroke="#fff" stroke-width="3" stroke-linecap="round"><line x1="32" y1="18" x2="32" y2="46"/><line x1="18" y1="32" x2="46" y2="32"/><line x1="22" y1="22" x2="42" y2="42"/><line x1="22" y1="42" x2="42" y2="22"/></g>`),
    storm: () => UI_ICONS.wrap(`<path d="M18 30h28a10 10 0 0 0 0-20 16 16 0 0 0-30 6 10 10 0 0 0 2 14z" fill="#999"/><path d="M30 35l-4 10h6l-4 10" stroke="#FFDD57" stroke-width="3" fill="none" stroke-linejoin="round"/>`),
    sunrise: () => UI_ICONS.wrap(`<path d="M32 40V28M18 34l3-3m22 3l-3-3M32 20a10 10 0 100 20 10 10 0 000-20zM10 48h44" stroke="#FFDD57" stroke-width="3" stroke-linecap="round"/>`, 24),
    sunset: () => UI_ICONS.wrap(`<path d="M32 28v12M18 34l3 3m22-3l-3 3M32 44a10 10 0 110-20 10 10 0 010 20zM10 48h44" stroke="#FF8C00" stroke-width="3" stroke-linecap="round"/>`, 24),
    frost: () => UI_ICONS.wrap(`<path d="M32 12l20 36H12L32 12z" stroke="#fff" stroke-width="3"/><path d="M32 24v10m0 6h.01" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`, 24),
    navToday: () => UI_ICONS.wrap(`<circle cx="32" cy="28" r="12" stroke="currentColor" stroke-width="3"/><path d="M12 48h40" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`, 28),
    navForecast: () => UI_ICONS.wrap(`<path d="M12 48V20M32 48V32M52 48V40" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`, 28),
    navDetails: () => UI_ICONS.wrap(`<path d="M10 20h44M10 32h44M10 44h24" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`, 28),
    navInfo: () => UI_ICONS.wrap(`<circle cx="32" cy="22" r="4" fill="currentColor"/><path d="M32 28v16M24 44h16" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`, 28),
    featureLoc: () => UI_ICONS.wrap(`<path d="M32 10c-6.6 0-12 5.4-12 12 0 10 12 24 12 24s12-14 12-24c0-6.6-5.4-12-12-12zm0 16c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" fill="currentColor"/>`, 32),
    featureChart: () => UI_ICONS.wrap(`<path d="M12 48h40M20 48V32M32 48V16M46 48V38" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`, 32),
    featureSave: () => UI_ICONS.wrap(`<path d="M16 14h26l8 8v28H16V14zm8 0v12h16V14M24 50V34h16v16" stroke="currentColor" stroke-width="4" fill="none"/>`, 32),
    featureMobile: () => UI_ICONS.wrap(`<path d="M20 10h24a4 4 0 0 1 4 4v36a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z" stroke="currentColor" stroke-width="4" fill="none"/><circle cx="32" cy="46" r="2" fill="currentColor"/>`, 32)
};

const iconForCode = (c, isNight = false) => {
    if (c === 0) return isNight ? UI_ICONS.moon() : UI_ICONS.sun();
    if (c <= 2) return UI_ICONS.partly(isNight);
    if (c === 3) return UI_ICONS.cloud();
    if (c >= 45 && c <= 48) return UI_ICONS.fog();
    if ((c >= 51 && c <= 67) || (c >= 80 && c <= 86)) return UI_ICONS.rain();
    if (c >= 71 && c <= 77) return UI_ICONS.snow();
    if (c >= 95) return UI_ICONS.storm();
    return UI_ICONS.cloud();
};

const weatherText = WEATHER_CONFIG.text;

let searchDebounce = "";

/**
 * Geolocation Helper - Optimiert für Capacitor/Mobile
 */
const getPosition = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error("Geolocation wird nicht unterstützt"));
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true, // Wichtig für mobiles GPS
            timeout: 10000,           // Verhindert endloses Warten
            maximumAge: 0             // Keine veralteten Cache-Daten
        });
    });
};

/**
 * Liefert den vom User gespeicherten Standardort oder Stuttgart als harten Fallback
 */
const getFallbackLocation = () => {
    try {
        const saved = localStorage.getItem('weather_app_default');
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.error("Fehler beim Lesen des Standardorts", e);
    }
    return { lat: 48.7758, lon: 9.1829, label: "Stuttgart" };
};

const App = {
    init() {
        const sb = document.getElementById('searchBox');
        const sug = document.getElementById('suggestionsList');
        const geoBtn = document.getElementById('geoBtn');

        if (sb) {
            sb.addEventListener('input', async () => {
                const q = sb.value.trim(); 
                if (q.length < 2) { sug.innerHTML = ''; return; } 
                if (q === searchDebounce) return; searchDebounce = q;
                const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=de`;
                try {
                    const r = await fetch(url); const j = await r.json(); sug.innerHTML = ''; if (!j.results) return;
                    j.results.forEach(loc => {
                        const item = document.createElement('div');
                        item.className = 'suggestion-item';
                        const region = (loc.admin1 && loc.admin1 !== loc.name) ? `${loc.admin1}, ` : "";
                        const fullName = `${loc.name}, ${region}${loc.country}`;
                        item.innerHTML = `<strong>${loc.name}</strong><br><small>${region}${loc.country}</small>`;
                        item.onclick = () => {
                            sug.innerHTML = ''; 
                            sb.value = fullName; 
                            App.fetchFullWeather(loc.latitude, loc.longitude, fullName);
                        };
                        sug.appendChild(item);
                    });
                } catch (e) { console.error(e); }
            });
        }

        if (geoBtn) {
            geoBtn.onclick = async () => {
                try {
                    const p = await getPosition();
                    App.fetchFullWeather(p.coords.latitude, p.coords.longitude, "Mein Standort");
                } catch (e) { showToast("Standort nicht erlaubt oder nicht gefunden."); }
            };
        }

        // Icons in die Navigation einfügen
        document.getElementById('nav-icon-today').innerHTML = UI_ICONS.navToday();
        document.getElementById('nav-icon-forecast').innerHTML = UI_ICONS.navForecast();
        document.getElementById('nav-icon-details').innerHTML = UI_ICONS.navDetails();
        document.getElementById('nav-icon-info').innerHTML = UI_ICONS.navInfo();
        
        if (document.getElementById('info-app-icon')) document.getElementById('info-app-icon').innerHTML = UI_ICONS.sun();

        // Feature Icons in Info Tab injizieren
        const infoIcons = {
            'info-icon-loc': UI_ICONS.featureLoc(),
            'info-icon-chart': UI_ICONS.featureChart(),
            'info-icon-save': UI_ICONS.featureSave(),
            'info-icon-mobile': UI_ICONS.featureMobile()
        };
        Object.entries(infoIcons).forEach(([id, svg]) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = svg;
        });

        // Event Listener für die Bottom Navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.nav-item, .tab-content').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(btn.dataset.tab).classList.add('active');
                window.scrollTo(0, 0);
            };
        });
    },

    async fetchFullWeather(lat, lon, label) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,sunrise,sunset&timezone=auto`;
        try {
            const data = await fetchWithCache(url, 'currentWeatherCache'); // Nutze fetchWithCache
            this.render(data, lat, lon, label);
            Specials.loadDashboard(lat, lon, label);
        } catch (e) { 
            console.error("Wetter-Ladefehler", e);
            const fb = getFallbackLocation();
            // Nur Fallback laden, wenn wir nicht bereits versuchen, den Fallback-Ort zu laden (Endlosschleife verhindern)
            if (lat !== fb.lat || lon !== fb.lon) {
                App.fetchFullWeather(fb.lat, fb.lon, fb.label);
            }
        }
    },

    render(data, lat, lon, label) {
        document.getElementById('weather').style.display = 'block';
        document.getElementById('placeName').textContent = label || `${lat.toFixed(3)},${lon.toFixed(3)}`;
        const cw = data.current_weather;

        document.getElementById('icon').innerHTML = iconForCode(cw.weathercode);
        document.getElementById('temp').innerHTML = `${cw.temperature}°C`;
        document.getElementById('currentSummary').innerHTML = `<strong>${weatherText(cw.weathercode)}</strong><br>Wind: ${cw.windspeed} km/h`;

        // Standardort-Button Logik
        const saveBtn = document.getElementById('saveDefaultBtn');
        if (saveBtn) {
            saveBtn.style.display = 'block';
            saveBtn.onclick = () => {
                localStorage.setItem('weather_app_default', JSON.stringify({ lat, lon, label }));
                showToast(`${label} wurde als Standardort gespeichert.`);
            };
        }

        const sunrise = data.daily.sunrise[0].split("T")[1];
        const sunset = data.daily.sunset[0].split("T")[1];
        let detailsHTML = `<div class="sun-info"><span>${UI_ICONS.sunrise()} ${sunrise}</span> <span>${UI_ICONS.sunset()} ${sunset}</span></div>`;

        if (data.daily.temperature_2m_min[1] <= 0) {
            detailsHTML += `<div class="warning">${UI_ICONS.frost()} Frostwarnung: Auto abdecken!</div>`;
        }
        document.getElementById('details').innerHTML = detailsHTML;

        const grid = document.getElementById('dailyForecastGrid'); // Umbenannt für Klarheit
        grid.innerHTML = '';

        for (let i = 0; i < data.daily.time.length; i++) {
            const day = document.createElement('div');
            day.className = 'day';
            const code = data.daily.weathercode[i];
            const date = new Date(data.daily.time[i]);
            const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' });
            const dateStr = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
            day.innerHTML = `
                <div style="font-weight:600">${dayName}</div>
                <div style="font-size:0.75rem; opacity:0.7;">${dateStr}</div>
                <div>${iconForCode(code)}</div>
                <div style="font-size:0.8rem">${weatherText(code)}</div>
                <div style="margin-top:5px"><strong>${data.daily.temperature_2m_max[i]}°</strong> <span style="opacity:0.6">${data.daily.temperature_2m_min[i]}°</span></div>
                <div style="font-size:0.7rem; color:#4af">${data.daily.precipitation_sum[i]} mm</div>`;
            
            day.style.cursor = 'pointer';
            day.onclick = () => {
                App.showDayDetails({
                    dateISO: data.daily.time[i],
                    date: date.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' }),
                    code: code,
                    max: data.daily.temperature_2m_max[i],
                    min: data.daily.temperature_2m_min[i],
                    rain: data.daily.precipitation_sum[i],
                    sunrise: data.daily.sunrise[i].split("T")[1],
                    sunset: data.daily.sunset[i].split("T")[1]
                }, lat, lon);
            };
            grid.appendChild(day);
        }
        
        renderDailyOverview(lat, lon, data.daily.sunrise[0], data.daily.sunset[0]);
    },

    async showDayDetails(d, lat, lon) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

        const content = document.createElement('div');
        content.className = 'modal-content card';
        content.style.marginTop = '0';
        content.innerHTML = `
            <div style="text-align:right; margin-bottom:-10px"><span style="cursor:pointer; font-size:2rem; line-height:1; opacity:0.6" onclick="this.closest('.modal-overlay').remove()">&times;</span></div>
            <h2 style="margin-top:0; font-size: 1.4rem; text-align:center">${d.date}</h2>
            <div style="text-align:center; margin: 25px 0;">
                <div class="modal-icon">${iconForCode(d.code)}</div>
                <div style="font-size:1.3rem; font-weight:bold; margin-top:10px">${weatherText(d.code)}</div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="card" style="margin:0; padding:15px; text-align:center; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
                    <small style="opacity:0.7">Max</small><br><strong style="font-size:1.2rem">${d.max}°C</strong>
                </div>
                <div class="card" style="margin:0; padding:15px; text-align:center; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
                    <small style="opacity:0.7">Min</small><br><strong style="font-size:1.2rem">${d.min}°C</strong>
                </div>
                <div class="card" style="margin:0; padding:15px; text-align:center; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
                    <small style="opacity:0.7">Niederschlag</small><br><strong>${d.rain} mm</strong>
                </div>
                <div class="card" style="margin:0; padding:15px; text-align:center; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
                    <small style="opacity:0.7">Sonne</small><br><small style="font-weight:bold">${d.sunrise} - ${d.sunset}</small>
                </div>
            </div>
            <h3 style="margin: 25px 0 10px; font-size: 1.1rem; text-align:center; opacity:0.9">Stündlicher Verlauf</h3>
            <div class="modal-hourly-grid">
                <div style="grid-column: 1/-1; text-align:center; padding:20px; opacity:0.6;">Lade stündliche Daten...</div>
            </div>
        `;
        overlay.appendChild(content);
        document.body.appendChild(overlay);

        // Stündliche Daten nachladen/aus Cache holen
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,weathercode,windspeed_10m&timezone=auto`;
            const hourlyData = await fetchWithCache(url, 'hourlyWeatherCache');
            const grid = content.querySelector('.modal-hourly-grid');
            grid.innerHTML = '';

            hourlyData.hourly.time.forEach((t, i) => {
                if (t.startsWith(d.dateISO)) {
                    const hour = t.split('T')[1];
                    const isNight = hour < d.sunrise || hour > d.sunset;
                    const code = hourlyData.hourly.weathercode[i];
                    const windSpeed = hourlyData.hourly.windspeed_10m[i];
                    const windStyle = windSpeed >= 50 ? 'color:#ff4444; font-weight:bold;' : 'opacity:0.8;';
                    const hourItem = document.createElement('div');
                    hourItem.className = 'modal-hour';
                    hourItem.innerHTML = `
                        <div style="font-weight:bold; font-size:0.8rem">${hour}</div>
                        <div class="mini-icon">${iconForCode(code, isNight)}</div>
                        <div style="font-weight:bold">${hourlyData.hourly.temperature_2m[i]}°</div>
                        <div style="font-size:0.65rem; ${windStyle}">${windSpeed} km/h</div>
                        <div style="font-size:0.65rem; color:#4af">${hourlyData.hourly.precipitation[i]}mm</div>
                    `;
                    grid.appendChild(hourItem);
                }
            });
        } catch (e) {
            content.querySelector('.modal-hourly-grid').innerHTML = '<div style="grid-column:1/-1; opacity:0.5">Stündliche Daten nicht verfügbar.</div>';
        }
    }
};

// Abwärtskompatibilität für loadWeather
const loadWeather = (lat, lon, label) => App.fetchFullWeather(lat, lon, label); // Beibehalten für externe Aufrufe

// ================= Specials Dashboard =================
const Specials = {
    safeFetchJson: async function(url, cacheKey) { // cacheKey hinzugefügt
        const res = await fetch(url);
        if (!res.ok) throw new Error("HTTP " + res.status);
        return await res.json();
    },
    getSpecialData: async function(lat, lon) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=uv_index,pressure_msl,dewpoint_2m,visibility,snowfall,snow_height&timezone=auto`;
        return this.safeFetchJson(url);
    },
    getValue: function(arr) { return arr && arr.length ? arr[0] : "–"; },
    render: function(data, label) {
        const h = data.hourly || {};
        const html = `            
            <h2 style="margin-top:0; font-size: 1.4rem; text-align:center; opacity:0.9;">Detaillierte Wetterdaten</h2>

            <div class="card details-section">
                <h3 class="details-section-title">Atmosphäre & Sicht</h3>
                <div class="details-grid-layout">
                    <div class="detail-item">UV-Index<br><strong>${this.getValue(h.uv_index)}</strong></div>
                    <div class="detail-item">Luftdruck<br><strong>${this.getValue(h.pressure_msl)} hPa</strong></div>
                    <div class="detail-item">Taupunkt<br><strong>${this.getValue(h.dewpoint_2m)}°C</strong></div>
                    <div class="detail-item">Sichtweite<br><strong>${this.getValue(h.visibility)} m</strong></div>
                </div>
            </div>

            <div class="card details-section">
                <h3 class="details-section-title">Schnee & Eis</h3>
                <div class="details-grid-layout">
                    <div class="detail-item">Schneefall<br><strong>${this.getValue(h.snowfall)} cm</strong></div>
                    <div class="detail-item">Schneehöhe<br><strong>${this.getValue(h.snow_height)} cm</strong></div>
                </div>
            </div>
        `;
        const container = document.getElementById("specialParamsDashboard");
        if (container) container.innerHTML = html;
    },
    loadDashboard: async function(lat, lon, label) {
        if (lat != null && lon != null) {
            await this._loadData(lat, lon, label);
        }
    },
    _loadData: async function(lat, lon, label) {
        try {
            const data = await this.getSpecialData(lat, lon);
            this.render(data, label);
        } catch (e) {
            console.error("Fehler beim Laden der Spezialdaten", e);
            const fb = getFallbackLocation();
            const data = await this.getSpecialData(fb.lat, fb.lon);
            this.render(data, fb.label);
        }
    }
};

window.addEventListener("load", async () => {
    App.init();
    
    // Ladereihenfolge: 1. Gespeicherter Ort -> 2. Geo-Location -> 3. Fallback
    const saved = localStorage.getItem('weather_app_default');
    if (saved) {
        const { lat, lon, label } = JSON.parse(saved);
        App.fetchFullWeather(lat, lon, label);
    } else {
        try {
            const p = await getPosition();
            App.fetchFullWeather(p.coords.latitude, p.coords.longitude, "Mein Standort");
        } catch (e) {
            const fb = getFallbackLocation();
            App.fetchFullWeather(fb.lat, fb.lon, fb.label);
        }
    }
    document.querySelector('.nav-item[data-tab="tab-today"]').click();
});
