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
            position: 'fixed', 
            bottom: '110px', /* Etwas höher wegen der schwebenden Nav */
            left: '50%', transform: 'translateX(-50%)',
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

const notify = (msg, duration) => {
    if (window.showToast) window.showToast(msg, duration);
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
    heat: () => UI_ICONS.wrap(`<path d="M32 12l20 36H12L32 12z" stroke="#ffbb33" stroke-width="3"/><path d="M32 24v10m0 6h.01" stroke="#ffbb33" stroke-width="4" stroke-linecap="round"/>`, 24),
    windWarning: () => UI_ICONS.wrap(`<path d="M32 12l20 36H12L32 12z" stroke="#4af" stroke-width="3"/><path d="M32 24v10m0 6h.01" stroke="#4af" stroke-width="4" stroke-linecap="round"/>`, 24),
    uvWarning: () => UI_ICONS.wrap(`<path d="M32 12l20 36H12L32 12z" stroke="#af7ac5" stroke-width="3"/><path d="M32 24v10m0 6h.01" stroke="#af7ac5" stroke-width="4" stroke-linecap="round"/>`, 24),
    navToday: () => UI_ICONS.wrap(`<circle cx="32" cy="28" r="12" stroke="currentColor" stroke-width="3"/><path d="M12 48h40" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`, 28),
    navForecast: () => UI_ICONS.wrap(`<path d="M12 48V20M32 48V32M52 48V40" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`, 28),
    navDetails: () => UI_ICONS.wrap(`<path d="M10 20h44M10 32h44M10 44h24" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`, 28),
    navFavorites: () => UI_ICONS.wrap(`<path d="M32 12l6 13 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2 6-13z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>`, 28),
    navInfo: () => UI_ICONS.wrap(`<circle cx="32" cy="22" r="4" fill="currentColor"/><path d="M32 28v16M24 44h16" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`, 28),
    home: () => UI_ICONS.wrap(`<path d="M12 30L32 14l20 16v20H38V36H26v14H12V30z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>`, 24),
    star: () => UI_ICONS.wrap(`<path d="M32 12l6 13 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2 6-13z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>`, 24),
    featureLoc: () => UI_ICONS.wrap(`<path d="M32 10c-6.6 0-12 5.4-12 12 0 10 12 24 12 24s12-14 12-24c0-6.6-5.4-12-12-12zm0 16c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" fill="currentColor"/>`, 32),
    featureChart: () => UI_ICONS.wrap(`<path d="M12 48h40M20 48V32M32 48V16M46 48V38" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`, 32),
    featureSave: () => UI_ICONS.wrap(`<path d="M16 14h26l8 8v28H16V14zm8 0v12h16V14M24 50V34h16v16" stroke="currentColor" stroke-width="4" fill="none"/>`, 32),
    featureMobile: () => UI_ICONS.wrap(`<path d="M20 10h24a4 4 0 0 1 4 4v36a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z" stroke="currentColor" stroke-width="4" fill="none"/><circle cx="32" cy="46" r="2" fill="currentColor"/>`, 32),
    featureWind: () => UI_ICONS.wrap(`<path d="M10 24h30a8 8 0 1 0-8-8M10 40h40a8 8 0 1 1-8 8" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`, 32),
    featureAlert: () => UI_ICONS.wrap(`<path d="M32 10L10 50h44L32 10zm0 14v12m0 6h.01" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`, 32),
    featurePrivacy: () => UI_ICONS.wrap(`<path d="M32 10s-16 4-16 14v16c0 10 16 14 16 14s16-4 16-14V24c0-10-16-14-16-14z" stroke="currentColor" stroke-width="4" fill="none"/>`, 32),
    featureTech: () => UI_ICONS.wrap(`<path d="M16 24l-8 8 8 8M48 24l8 8-8 8M36 12l-8 40" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`, 32),
    windArrow: (deg) => UI_ICONS.wrap(`<path d="M32 10l12 40-12-10-12 10z" fill="currentColor" transform="rotate(${deg} 32 32)"/>`, 20),
    detailPressure: () => UI_ICONS.wrap(`<circle cx="32" cy="32" r="20" stroke="currentColor" stroke-width="3"/><path d="M32 32l12-12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="32" r="2" fill="currentColor"/>`, 48),
    detailDewpoint: () => UI_ICONS.wrap(`<path d="M32 12s-12 14-12 22a12 12 0 1 0 24 0c0-8-12-22-12-22z" fill="#4af"/>`, 48),
    detailVisibility: () => UI_ICONS.wrap(`<path d="M10 32s10-14 22-14 22 14 22 14-10 14-22 14-22-14-22-14z" stroke="currentColor" stroke-width="3"/><circle cx="32" cy="32" r="6" fill="currentColor"/>`, 48),
    detailHumidity: () => UI_ICONS.wrap(`<path d="M32 12s-12 14-12 22a12 12 0 1 0 24 0c0-8-12-22-12-22z" fill="#74b9ff"/>`, 48)
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

const STORAGE_KEYS = {
    defaultLocation: "weather_app_default",
    favorites: "weather_app_favorites",
    settings: "weather_app_settings"
};

const CACHE_KEYS = ["currentWeatherCache", "hourlyWeatherCache", "specialsWeatherCache"];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const isNumber = (value) => typeof value === "number" && Number.isFinite(value);
const DEFAULT_SETTINGS = {
    exactTemperature: false,
    windUnit: "kmh",
    glassEffect: true,
    motion: true
};

function readAppSettings() {
    try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || "{}") };
    } catch (e) {
        return { ...DEFAULT_SETTINGS };
    }
}

function writeAppSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ ...readAppSettings(), ...settings }));
}

const formatNumber = (value, digits = 0) => isNumber(value)
    ? value.toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits })
    : "–";
const formatTemp = (value) => {
    const digits = readAppSettings().exactTemperature ? 1 : 0;
    return isNumber(value) ? `${formatNumber(value, digits)}°` : "–";
};
const formatMetric = (value, unit = "", digits = 0) => isNumber(value) ? `${formatNumber(value, digits)}${unit}` : "–";
const formatWind = (kmh) => {
    if (!isNumber(kmh)) return "–";
    const settings = readAppSettings();
    if (settings.windUnit === "ms") return `${formatNumber(kmh / 3.6, 1)} m/s`;
    return `${formatNumber(kmh)} km/h`;
};
const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
}[char]));

function getHourlyIndex(hourly, timezone) {
    if (!hourly || !Array.isArray(hourly.time) || hourly.time.length === 0) return 0;
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone }));
    const times = hourly.time.map(t => new Date(t));
    const exact = times.findIndex(t =>
        t.getFullYear() === now.getFullYear() &&
        t.getMonth() === now.getMonth() &&
        t.getDate() === now.getDate() &&
        t.getHours() === now.getHours()
    );
    if (exact >= 0) return exact;
    const next = times.findIndex(t => t > now);
    return next >= 0 ? next : 0;
}

function getHourlyValue(hourly, key, index) {
    const value = hourly && hourly[key] ? hourly[key][index] : null;
    return isNumber(value) ? value : null;
}

function makeLocationId(lat, lon) {
    if (!isNumber(Number(lat)) || !isNumber(Number(lon))) return "";
    return `${Number(lat).toFixed(4)},${Number(lon).toFixed(4)}`;
}

function normalizeLocation(location) {
    if (!location) return null;
    const lat = Number(location.lat);
    const lon = Number(location.lon);
    if (!isNumber(lat) || !isNumber(lon)) return null;
    return {
        id: makeLocationId(lat, lon),
        lat,
        lon,
        label: String(location.label || `${lat.toFixed(3)}, ${lon.toFixed(3)}`)
    };
}

function splitLocationLabel(label) {
    const parts = String(label || "").split(",").map(part => part.trim()).filter(Boolean);
    return {
        primary: parts[0] || "Unbekannter Ort",
        meta: parts.slice(1).join(", ")
    };
}

function renderLocationHeader(location) {
    const normalized = normalizeLocation(location);
    if (!normalized) return;
    const { primary, meta } = splitLocationLabel(normalized.label);
    const date = new Intl.DateTimeFormat("de-DE", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date());

    document.getElementById('placeName').textContent = primary;
    const locationMeta = document.getElementById('locationMeta');
    if (locationMeta) {
        locationMeta.textContent = meta || `${normalized.lat.toFixed(3)}, ${normalized.lon.toFixed(3)}`;
    }
    const headerDate = document.getElementById('header-date');
    if (headerDate) headerDate.textContent = date;
}

function getLevel(type, value, context = {}) {
    if (!isNumber(value)) return { label: "keine Daten", tone: "neutral", meter: 0 };

    if (type === "temp") {
        if (value <= 0) return { label: "frostig", tone: "risk", meter: 18 };
        if (value < 9) return { label: "kühl", tone: "watch", meter: 35 };
        if (value <= 25) return { label: "angenehm", tone: "good", meter: 62 };
        if (value < 30) return { label: "warm", tone: "watch", meter: 78 };
        return { label: "heiß", tone: "risk", meter: 95 };
    }

    if (type === "rain") {
        const probability = context.probability;
        const rainScore = isNumber(probability) ? Math.max(value * 8, probability) : value * 12;
        if (rainScore >= 70 || value >= 10) return { label: "hoch", tone: "risk", meter: clamp(rainScore, 0, 100) };
        if (rainScore >= 30 || value >= 2) return { label: "möglich", tone: "watch", meter: clamp(rainScore, 0, 100) };
        return { label: "gering", tone: "good", meter: clamp(Math.max(rainScore, 8), 0, 100) };
    }

    if (type === "wind") {
        if (value >= 70) return { label: "stürmisch", tone: "risk", meter: 95 };
        if (value >= 40) return { label: "kräftig", tone: "watch", meter: 68 };
        return { label: "ruhig", tone: "good", meter: clamp(value * 1.25, 8, 52) };
    }

    if (type === "uv") {
        if (value >= 6) return { label: "hoch", tone: "risk", meter: 88 };
        if (value >= 3) return { label: "mittel", tone: "watch", meter: 58 };
        return { label: "niedrig", tone: "good", meter: 22 };
    }

    if (type === "humidity") {
        if (value >= 75) return { label: "schwül", tone: "watch", meter: 82 };
        if (value <= 30) return { label: "trocken", tone: "watch", meter: 28 };
        return { label: "komfortabel", tone: "good", meter: clamp(value, 15, 80) };
    }

    return { label: "normal", tone: "neutral", meter: 50 };
}

function renderInsightCard({ label, value, unit, digits = 0, level, caption, icon, secondaryLabel, secondaryValue, display }) {
    const displayValue = display || formatMetric(value, unit, digits);
    return `
        <div class="insight-card ${level.tone}" style="--meter:${level.meter}%">
            <div class="insight-top">
                <span>${icon || ""}${label}</span>
                <span class="level-chip">${level.label}</span>
            </div>
            <div class="metric-readout">
                <strong>${displayValue}</strong>
                ${secondaryValue ? `<span><b>${secondaryValue}</b>${secondaryLabel ? ` ${secondaryLabel}` : ""}</span>` : ""}
            </div>
            <span class="metric-meter" aria-hidden="true"><span></span></span>
            ${caption ? `<small>${caption}</small>` : ""}
        </div>
    `;
}

function renderWeatherInsights({ apparent, humidity, rainToday, rainProbability, wind, gusts, uv, uvMax, minTemp, maxTemp }) {
    return [
        renderInsightCard({
            label: "Gefühlt",
            value: apparent,
            unit: "°",
            level: getLevel("temp", apparent),
            caption: "",
            secondaryValue: `${formatTemp(minTemp)} bis ${formatTemp(maxTemp)}`,
            secondaryLabel: "heute",
            icon: UI_ICONS.detailDewpoint()
        }),
        renderInsightCard({
            label: "Regen",
            value: isNumber(rainProbability) ? rainProbability : rainToday,
            unit: isNumber(rainProbability) ? "%" : " mm",
            digits: isNumber(rainProbability) ? 0 : 1,
            level: getLevel("rain", rainToday || 0, { probability: rainProbability }),
            caption: "",
            secondaryValue: `${formatMetric(rainToday, " mm", 1)}`,
            secondaryLabel: "heute",
            icon: UI_ICONS.rain()
        }),
        renderInsightCard({
            label: "Wind",
            value: wind,
            display: formatWind(wind),
            level: getLevel("wind", wind),
            caption: "",
            secondaryValue: isNumber(gusts) ? formatWind(gusts) : "",
            secondaryLabel: "Böen",
            icon: UI_ICONS.featureWind()
        }),
        renderInsightCard({
            label: "UV",
            value: uv,
            level: getLevel("uv", uv),
            caption: "",
            secondaryValue: isNumber(uvMax) ? `${formatMetric(uvMax, "", 1)}` : "",
            secondaryLabel: "max.",
            icon: UI_ICONS.sun()
        }),
        renderInsightCard({
            label: "Feuchte",
            value: humidity,
            unit: "%",
            level: getLevel("humidity", humidity),
            caption: "",
            icon: UI_ICONS.detailHumidity()
        })
    ].join("");
}

function collectWeatherAlerts(data) {
    const alerts = [];
    const tomorrowMin = data.daily.temperature_2m_min[1];
    const todayMax = data.daily.temperature_2m_max[0];
    const tomorrowMax = data.daily.temperature_2m_max[1];
    const rainToday = data.daily.precipitation_sum ? data.daily.precipitation_sum[0] : null;
    const gustToday = data.daily.wind_gusts_10m_max ? data.daily.wind_gusts_10m_max[0] : null;
    const uvToday = data.daily.uv_index_max ? data.daily.uv_index_max[0] : null;

    if (tomorrowMin <= 0) {
        alerts.push({ tone: "risk", icon: UI_ICONS.frost(), title: "Frost möglich", text: `Tiefstwert morgen bei ${formatTemp(tomorrowMin)}` });
    }
    if (todayMax >= 30 || tomorrowMax >= 30) {
        alerts.push({ tone: "risk", icon: UI_ICONS.heat(), title: "Hitze", text: `Maximalwert bis ${formatTemp(Math.max(todayMax, tomorrowMax))}` });
    }
    if (isNumber(gustToday) && gustToday >= 70) {
        alerts.push({ tone: "risk", icon: UI_ICONS.windWarning(), title: "Starke Böen", text: `Böen bis ${formatWind(gustToday)}` });
    } else if (isNumber(gustToday) && gustToday >= 50) {
        alerts.push({ tone: "watch", icon: UI_ICONS.windWarning(), title: "Wind auffällig", text: `Böen bis ${formatWind(gustToday)}` });
    }
    if (isNumber(uvToday) && uvToday >= 6) {
        alerts.push({ tone: "watch", icon: UI_ICONS.uvWarning(), title: "UV hoch", text: `Max. ${formatMetric(uvToday, "", 1)}` });
    }
    if (isNumber(rainToday) && rainToday >= 10) {
        alerts.push({ tone: "watch", icon: UI_ICONS.rain(), title: "Viel Regen", text: `${formatMetric(rainToday, " mm", 1)} heute` });
    }

    return alerts;
}

function renderWeatherAlerts(data) {
    const alerts = collectWeatherAlerts(data);
    if (alerts.length === 0) {
        return `
            <div class="alert-card good">
                <span class="alert-icon">${UI_ICONS.featureAlert()}</span>
                <div>
                    <strong>Keine Warnungen</strong>
                    <small>Alles ruhig.</small>
                </div>
            </div>
        `;
    }

    return alerts.map(alert => `
        <div class="alert-card ${alert.tone}">
            <span class="alert-icon">${alert.icon}</span>
            <div>
                <strong>${alert.title}</strong>
                <small>${alert.text}</small>
            </div>
        </div>
    `).join("");
}

function renderSunInfo(data) {
    const sunrise = data.daily.sunrise[0].split("T")[1];
    const sunset = data.daily.sunset[0].split("T")[1];

    return `
        <div class="sun-info">
            <span>${UI_ICONS.sunrise()}<strong>${sunrise}</strong><small>Aufgang</small></span>
            <span>${UI_ICONS.sunset()}<strong>${sunset}</strong><small>Untergang</small></span>
        </div>
    `;
}

function getTempRangeStyle(min, max, weekMin, weekMax) {
    const range = Math.max(1, weekMax - weekMin);
    const left = clamp(((min - weekMin) / range) * 100, 0, 100);
    const width = clamp(((max - min) / range) * 100, 8, 100 - left);
    return `--range-left:${left}%; --range-width:${width}%;`;
}

function formatDaylightDuration(sunrise, sunset) {
    const [riseHour, riseMinute] = String(sunrise || "").split(":").map(Number);
    const [setHour, setMinute] = String(sunset || "").split(":").map(Number);
    if (![riseHour, riseMinute, setHour, setMinute].every(isNumber)) return "–";
    const minutes = Math.max(0, (setHour * 60 + setMinute) - (riseHour * 60 + riseMinute));
    return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

let searchDebounce = "";

/**
 * Geolocation Helper - Optimiert für Capacitor/Mobile
 */
const getPosition = async () => {
    // Prüfen, ob wir in einer Capacitor-Umgebung mit dem Plugin sind
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Geolocation) {
        const Geolocation = window.Capacitor.Plugins.Geolocation;
        try {
            // Berechtigungen explizit prüfen und anfordern
            const permissions = await Geolocation.checkPermissions();
            if (permissions.location !== 'granted') {
                await Geolocation.requestPermissions();
            }
            return await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000
            });
        } catch (e) {
            throw new Error("Standort-Plugin Fehler: " + e.message);
        }
    }

    // Fallback für Browser/Web-Ansicht
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error("Geolocation wird nicht unterstützt"));
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    });
};

/**
 * Liefert den vom User gespeicherten Standardort oder Stuttgart als harten Fallback
 */
const getFallbackLocation = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.defaultLocation);
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.error("Fehler beim Lesen des Standardorts", e);
    }
    return { lat: 48.7758, lon: 9.1829, label: "Stuttgart" };
};

const Favorites = {
    read() {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || "[]");
            if (!Array.isArray(parsed)) return [];
            return parsed.map(normalizeLocation).filter(Boolean);
        } catch (e) {
            console.error("Fehler beim Lesen der Favoriten", e);
            return [];
        }
    },

    write(list) {
        const cleaned = list.map(normalizeLocation).filter(Boolean);
        localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(cleaned));
        this.render();
        App.updateLocationControls();
        Settings.renderInfoStatus();
    },

    getDefault() {
        return normalizeLocation(getFallbackLocation());
    },

    isDefault(location) {
        const normalized = normalizeLocation(location);
        const currentDefault = this.getDefault();
        return !!normalized && !!currentDefault && normalized.id === currentDefault.id;
    },

    isFavorite(location) {
        const normalized = normalizeLocation(location);
        if (!normalized) return false;
        return this.read().some(item => item.id === normalized.id);
    },

    add(location) {
        const normalized = normalizeLocation(location);
        if (!normalized) return false;
        const list = this.read();
        const index = list.findIndex(item => item.id === normalized.id);
        if (index >= 0) {
            list[index] = normalized;
        } else {
            list.unshift(normalized);
        }
        this.write(list);
        return true;
    },

    remove(id) {
        const list = this.read().filter(item => item.id !== id);
        this.write(list);
        const currentDefault = this.getDefault();
        if (currentDefault && currentDefault.id === id) {
            localStorage.removeItem(STORAGE_KEYS.defaultLocation);
        }
        Settings.renderInfoStatus();
        notify("Favorit entfernt.");
    },

    setDefault(location) {
        const normalized = normalizeLocation(location);
        if (!normalized) return false;
        localStorage.setItem(STORAGE_KEYS.defaultLocation, JSON.stringify(normalized));
        this.add(normalized);
        this.render();
        App.updateLocationControls();
        Settings.renderInfoStatus();
        return true;
    },

    setDefaultById(id) {
        const item = this.read().find(favorite => favorite.id === id);
        if (!item) return;
        if (this.setDefault(item)) notify(`${splitLocationLabel(item.label).primary} ist jetzt dein Startort.`);
    },

    load(id) {
        const item = this.read().find(favorite => favorite.id === id);
        if (!item) return;
        App.fetchFullWeather(item.lat, item.lon, item.label);
        const todayNav = document.querySelector('.nav-item[data-tab="tab-today"]');
        if (todayNav) todayNav.click();
    },

    render() {
        const container = document.getElementById("favoritesList");
        if (!container) return;
        const list = this.read();
        if (list.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span>${UI_ICONS.navFavorites()}</span>
                    <strong>Noch keine Favoriten</strong>
                    <small>Keine gespeicherten Orte.</small>
                </div>
            `;
            return;
        }

        container.innerHTML = list.map(item => {
            const { primary, meta } = splitLocationLabel(item.label);
            const isDefault = this.isDefault(item);
            return `
                <div class="favorite-row ${isDefault ? "is-default" : ""}">
                    <div class="favorite-place">
                        <span class="favorite-icon">${isDefault ? UI_ICONS.home() : UI_ICONS.navFavorites()}</span>
                        <div>
                            <strong>${escapeHTML(primary)}</strong>
                            <small>${escapeHTML(meta || `${item.lat.toFixed(3)}, ${item.lon.toFixed(3)}`)}</small>
                        </div>
                    </div>
                    <div class="favorite-actions">
                        <button type="button" onclick="Favorites.load('${item.id}')">Laden</button>
                        <button type="button" onclick="Favorites.setDefaultById('${item.id}')">${isDefault ? "Startort" : "Als Startort"}</button>
                        <button type="button" class="danger" onclick="Favorites.remove('${item.id}')">Entfernen</button>
                    </div>
                </div>
            `;
        }).join("");
    }
};

window.Favorites = Favorites;

const Settings = {
    init() {
        this.apply();
        const openFavoritesSettingsBtn = document.getElementById("openFavoritesSettingsBtn");
        const clearCacheBtn = document.getElementById("clearCacheBtn");
        const resetSettingsBtn = document.getElementById("resetSettingsBtn");

        document.querySelectorAll("[data-temp-mode]").forEach(button => {
            button.addEventListener("click", () => this.update({ exactTemperature: button.dataset.tempMode === "exact" }));
        });

        document.querySelectorAll("[data-wind-unit]").forEach(button => {
            button.addEventListener("click", () => this.update({ windUnit: button.dataset.windUnit }));
        });

        document.querySelectorAll("[data-glass-mode]").forEach(button => {
            button.addEventListener("click", () => this.update({ glassEffect: button.dataset.glassMode === "glass" }));
        });

        document.querySelectorAll("[data-motion-mode]").forEach(button => {
            button.addEventListener("click", () => this.update({ motion: button.dataset.motionMode === "dynamic" }));
        });

        if (openFavoritesSettingsBtn) {
            openFavoritesSettingsBtn.addEventListener("click", () => this.openFavorites());
        }

        if (clearCacheBtn) {
            clearCacheBtn.addEventListener("click", () => this.clearWeatherCache());
        }

        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener("click", () => this.reset());
        }
    },

    update(partial) {
        writeAppSettings(partial);
        this.apply();
        App.refreshCurrentView();
    },

    apply() {
        const settings = readAppSettings();
        document.body.classList.toggle("glass-rich", settings.glassEffect);
        document.body.classList.toggle("reduce-motion", !settings.motion);

        const temperatureStatus = document.getElementById("temperatureStatus");
        const glassEffectStatus = document.getElementById("glassEffectStatus");
        const motionStatus = document.getElementById("motionStatus");

        if (temperatureStatus) temperatureStatus.textContent = settings.exactTemperature ? "Mit Komma" : "Ganze Grad";
        if (glassEffectStatus) glassEffectStatus.textContent = settings.glassEffect ? "Glas" : "Klar";
        if (motionStatus) motionStatus.textContent = settings.motion ? "Dynamisch" : "Ruhig";

        this.setActiveChoice("[data-temp-mode]", button => {
            return settings.exactTemperature ? button.dataset.tempMode === "exact" : button.dataset.tempMode === "rounded";
        });

        this.setActiveChoice("[data-wind-unit]", button => button.dataset.windUnit === settings.windUnit);
        this.setActiveChoice("[data-glass-mode]", button => {
            return settings.glassEffect ? button.dataset.glassMode === "glass" : button.dataset.glassMode === "clear";
        });
        this.setActiveChoice("[data-motion-mode]", button => {
            return settings.motion ? button.dataset.motionMode === "dynamic" : button.dataset.motionMode === "calm";
        });

        const windStatus = document.getElementById("windUnitStatus");
        if (windStatus) windStatus.textContent = settings.windUnit === "ms" ? "m/s" : "km/h";
        this.renderInfoStatus();
    },

    setActiveChoice(selector, isActive) {
        document.querySelectorAll(selector).forEach(button => {
            const active = isActive(button);
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
        });
    },

    renderInfoStatus() {
        const settings = readAppSettings();
        const favorites = Favorites.read();
        const currentDefault = Favorites.getDefault();
        const currentCache = this.getCacheStamp();

        const favoriteCount = document.getElementById("infoFavoritesCount");
        const defaultLocation = document.getElementById("infoDefaultLocation");
        const cacheState = document.getElementById("infoCacheState");
        const windUnit = document.getElementById("infoWindUnit");

        if (favoriteCount) favoriteCount.textContent = String(favorites.length);
        if (defaultLocation) defaultLocation.textContent = currentDefault ? splitLocationLabel(currentDefault.label).primary : "Keiner";
        if (cacheState) cacheState.textContent = currentCache || "Leer";
        if (windUnit) windUnit.textContent = settings.windUnit === "ms" ? "m/s" : "km/h";
    },

    getCacheStamp() {
        for (const key of CACHE_KEYS) {
            try {
                const cache = JSON.parse(localStorage.getItem(key) || "null");
                if (cache && cache.stamp) return String(cache.stamp).split(",")[0];
            } catch (e) {
                continue;
            }
        }
        return "";
    },

    clearWeatherCache() {
        CACHE_KEYS.forEach(key => localStorage.removeItem(key));
        this.renderInfoStatus();
        notify("Cache geleert.");
    },

    reset() {
        localStorage.removeItem(STORAGE_KEYS.settings);
        this.apply();
        App.refreshCurrentView();
        notify("Einstellungen zurückgesetzt.");
    },

    openFavorites() {
        const favoritesNav = document.querySelector('.nav-item[data-tab="tab-favorites"]');
        if (favoritesNav) favoritesNav.click();
    }
};

const App = {
    init() {
        const sb = document.getElementById('searchBox');
        const sug = document.getElementById('suggestionsList');
        const geoBtn = document.getElementById('geoBtn');
        const quickFavoriteBtn = document.getElementById('quickFavoriteBtn');
        const quickDefaultBtn = document.getElementById('quickDefaultBtn');
        const addCurrentFavoriteBtn = document.getElementById('addCurrentFavoriteBtn');

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
                } catch (e) { notify("Standort nicht erlaubt oder nicht gefunden."); }
            };
        }

        if (quickFavoriteBtn) {
            quickFavoriteBtn.innerHTML = UI_ICONS.star();
            quickFavoriteBtn.onclick = () => App.saveCurrentFavorite();
        }

        if (quickDefaultBtn) {
            quickDefaultBtn.innerHTML = UI_ICONS.home();
            quickDefaultBtn.onclick = () => App.setCurrentAsDefault();
        }

        if (addCurrentFavoriteBtn) {
            addCurrentFavoriteBtn.onclick = () => App.saveCurrentFavorite();
        }

        // Icons in die Navigation einfügen
        document.getElementById('header-loc-icon').innerHTML = UI_ICONS.featureLoc();
        document.getElementById('nav-icon-today').innerHTML = UI_ICONS.navToday();
        document.getElementById('nav-icon-forecast').innerHTML = UI_ICONS.navForecast();
        document.getElementById('nav-icon-details').innerHTML = UI_ICONS.navDetails();
        document.getElementById('nav-icon-favorites').innerHTML = UI_ICONS.navFavorites();
        document.getElementById('nav-icon-info').innerHTML = UI_ICONS.navInfo();
        
        if (document.getElementById('info-app-icon')) document.getElementById('info-app-icon').innerHTML = UI_ICONS.sun();

        // Feature Icons in Info Tab injizieren
        const infoIcons = {
            'info-icon-loc': UI_ICONS.featureLoc(),
            'info-icon-chart': UI_ICONS.featureChart(),
            'info-icon-save': UI_ICONS.featureSave(),
            'info-icon-mobile': UI_ICONS.featureMobile(),
            'info-icon-sun': UI_ICONS.sun(),
            'info-icon-wind': UI_ICONS.featureWind(),
            'info-icon-alert': UI_ICONS.featureAlert(),
            'info-icon-privacy': UI_ICONS.featurePrivacy(),
            'info-icon-tech': UI_ICONS.featureTech()
        };
        Object.entries(infoIcons).forEach(([id, svg]) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = svg;
        });

        // Event Listener für die Bottom Navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.onclick = () => {
                const tabId = btn.dataset.tab;
                document.querySelectorAll('.nav-item, .tab-content').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(tabId).classList.add('active');
                document.body.classList.toggle("settings-view-active", tabId === "tab-info");
                if (tabId === "tab-favorites") Favorites.render();
                
                if (window.myChart) window.myChart.resize();
                
                window.scrollTo(0, 0);
            };
        });
        Favorites.render();
        Settings.init();
    },

    async fetchFullWeather(lat, lon, label) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m,apparent_temperature,precipitation_probability,uv_index&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,sunrise,sunset,wind_gusts_10m_max,uv_index_max&timezone=auto`;
        try {
            const data = await fetchWithCache(url, 'currentWeatherCache'); // Nutze fetchWithCache
            this.render(data, lat, lon, label);
            Specials.loadDashboard(lat, lon, label);
            if (typeof renderCharts === 'function') renderCharts(lat, lon);
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
        this.lastWeather = { data, lat, lon, label };
        document.getElementById('weather').hidden = false;
        this.currentLocation = normalizeLocation({ lat, lon, label: label || `${lat.toFixed(3)}, ${lon.toFixed(3)}` });
        renderLocationHeader(this.currentLocation);
        const cw = data.current_weather;
        const hourlyIndex = getHourlyIndex(data.hourly, data.timezone);
        const humidity = getHourlyValue(data.hourly, "relative_humidity_2m", hourlyIndex);
        const apparent = getHourlyValue(data.hourly, "apparent_temperature", hourlyIndex) ?? cw.temperature;
        const rainProbability = getHourlyValue(data.hourly, "precipitation_probability", hourlyIndex);
        const currentUv = getHourlyValue(data.hourly, "uv_index", hourlyIndex);
        const maxTemp = data.daily.temperature_2m_max[0];
        const minTemp = data.daily.temperature_2m_min[0];
        const rainToday = data.daily.precipitation_sum[0] || 0;
        const gustsToday = data.daily.wind_gusts_10m_max ? data.daily.wind_gusts_10m_max[0] : null;
        const uvToday = data.daily.uv_index_max ? data.daily.uv_index_max[0] : null;

        document.getElementById('icon').innerHTML = iconForCode(cw.weathercode);
        document.getElementById('temp').innerHTML = `${formatTemp(cw.temperature)}`;
        document.getElementById('currentSummary').innerHTML = `
            <strong>${weatherText(cw.weathercode)}</strong>
            <span>Gefühlt ${formatTemp(apparent)} · Wind ${formatWind(cw.windspeed)}${isNumber(humidity) ? ` · Feuchte ${humidity}%` : ""}</span>
        `;
        const insights = document.getElementById('weatherInsights');
        if (insights) {
            insights.innerHTML = renderWeatherInsights({
                apparent,
                humidity,
                rainToday,
                rainProbability,
                wind: cw.windspeed,
                gusts: gustsToday,
                uv: currentUv ?? uvToday,
                uvMax: uvToday,
                minTemp,
                maxTemp
            });
        }

        this.updateLocationControls();

        const alertPanel = document.getElementById('alertPanel');
        if (alertPanel) {
            alertPanel.hidden = false;
            alertPanel.innerHTML = renderWeatherAlerts(data);
        }
        document.getElementById('details').innerHTML = renderSunInfo(data);

        const grid = document.getElementById('dailyForecastGrid'); // Umbenannt für Klarheit
        grid.innerHTML = '';
        const weekMin = Math.min(...data.daily.temperature_2m_min.filter(isNumber));
        const weekMax = Math.max(...data.daily.temperature_2m_max.filter(isNumber));

        for (let i = 0; i < data.daily.time.length; i++) {
            const day = document.createElement('div');
            day.className = 'day';
            const code = data.daily.weathercode[i];
            const date = new Date(data.daily.time[i]);
            const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' });
            const dateStr = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
            
            const rainLevel = getLevel("rain", data.daily.precipitation_sum[i] || 0);
            day.innerHTML = `
                <div class="day-info"><strong>${dayName}</strong><small>${dateStr}</small></div>
                <div class="day-icon-row">${iconForCode(code)}<span>${weatherText(code)}</span></div>
                <div class="day-temp-row">
                    <div><strong>${formatTemp(data.daily.temperature_2m_max[i])}</strong><span>${formatTemp(data.daily.temperature_2m_min[i])}</span></div>
                    <span class="temp-range" style="${getTempRangeStyle(data.daily.temperature_2m_min[i], data.daily.temperature_2m_max[i], weekMin, weekMax)}"><span></span></span>
                </div>
                <div class="day-rain-row ${rainLevel.tone}"><strong>${formatMetric(data.daily.precipitation_sum[i], " mm", 1)}</strong><small>${rainLevel.label}</small></div>
            `;
            
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
                    sunset: data.daily.sunset[i].split("T")[1],
                    weekMin,
                    weekMax
                }, lat, lon);
            };
            grid.appendChild(day);
        }
        
        renderDailyOverview(lat, lon, data.daily.sunrise[0], data.daily.sunset[0]);
        Favorites.render();
        Settings.renderInfoStatus();
    },

    refreshCurrentView() {
        if (!this.lastWeather) return;
        const { data, lat, lon, label } = this.lastWeather;
        this.render(data, lat, lon, label);
    },

    updateLocationControls() {
        const location = this.currentLocation;
        const favorite = Favorites.isFavorite(location);
        const isDefault = Favorites.isDefault(location);
        const quickFavoriteBtn = document.getElementById('quickFavoriteBtn');
        const quickDefaultBtn = document.getElementById('quickDefaultBtn');
        const addCurrentFavoriteBtn = document.getElementById('addCurrentFavoriteBtn');

        if (quickFavoriteBtn) quickFavoriteBtn.classList.toggle('active', favorite);
        if (quickDefaultBtn) quickDefaultBtn.classList.toggle('active', isDefault);
        if (addCurrentFavoriteBtn) addCurrentFavoriteBtn.textContent = favorite ? "Favorit aktualisieren" : "Ort merken";
    },

    saveCurrentFavorite() {
        if (!this.currentLocation) {
            notify("Noch kein Ort geladen.");
            return;
        }
        Favorites.add(this.currentLocation);
        this.updateLocationControls();
        notify(`${splitLocationLabel(this.currentLocation.label).primary} wurde gespeichert.`);
    },

    setCurrentAsDefault() {
        if (!this.currentLocation) {
            notify("Noch kein Ort geladen.");
            return;
        }
        if (Favorites.setDefault(this.currentLocation)) {
            notify(`${splitLocationLabel(this.currentLocation.label).primary} ist jetzt dein Startort.`);
        }
    },

    async showDayDetails(d, lat, lon) {
        const rainLevel = getLevel("rain", d.rain || 0);
        const rangeStyle = getTempRangeStyle(d.min, d.max, d.weekMin ?? d.min, d.weekMax ?? d.max);
        const daylight = formatDaylightDuration(d.sunrise, d.sunset);
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

        const content = document.createElement('div');
        content.className = 'modal-content card day-detail-modal';
        content.innerHTML = `
            <button class="modal-close" type="button" onclick="this.closest('.modal-overlay').remove()" aria-label="Schließen">&times;</button>
            <div class="day-detail-hero">
                <div class="modal-icon">${iconForCode(d.code)}</div>
                <div class="day-detail-copy">
                    <h2 class="modal-title">${d.date}</h2>
                    <strong>${weatherText(d.code)}</strong>
                    <div class="day-detail-temp">
                        <strong>${formatTemp(d.max)}</strong>
                        <span>${formatTemp(d.min)}</span>
                    </div>
                </div>
            </div>
            <div class="day-detail-range">
                <div>
                    <span>Min ${formatTemp(d.min)}</span>
                    <span>Max ${formatTemp(d.max)}</span>
                </div>
                <span class="temp-range" style="${rangeStyle}"><span></span></span>
            </div>
            <div class="modal-stats day-detail-stats">
                <div class="modal-stat ${rainLevel.tone}">
                    <small>Niederschlag</small><strong>${formatMetric(d.rain, " mm", 1)}</strong>
                </div>
                <div class="modal-stat">
                    <small>Tageslicht</small><strong>${daylight}</strong>
                </div>
                <div class="modal-stat">
                    <small>Sonnenaufgang</small><strong>${d.sunrise}</strong>
                </div>
                <div class="modal-stat">
                    <small>Sonnenuntergang</small><strong>${d.sunset}</strong>
                </div>
            </div>
            <h3 class="modal-subtitle">Stündlicher Verlauf</h3>
            <div class="modal-hourly-grid">
                <div class="modal-loading">Lade stündliche Daten...</div>
            </div>
        `;
        overlay.appendChild(content);
        document.body.appendChild(overlay);

        // Stündliche Daten nachladen/aus Cache holen
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,weathercode,windspeed_10m,winddirection_10m&timezone=auto`;
            const hourlyData = await fetchWithCache(url, 'hourlyWeatherCache');
            const grid = content.querySelector('.modal-hourly-grid');
            grid.innerHTML = '';

            hourlyData.hourly.time.forEach((t, i) => {
                if (t.startsWith(d.dateISO)) {
                    const hour = t.split('T')[1];
                    const isNight = hour < d.sunrise || hour > d.sunset;
                    const code = hourlyData.hourly.weathercode[i];
                    const windSpeed = hourlyData.hourly.windspeed_10m[i];
                    const windDeg = hourlyData.hourly.winddirection_10m[i];
                    const windLevel = getLevel("wind", windSpeed || 0);
                    const rain = hourlyData.hourly.precipitation[i] || 0;
                    const hourItem = document.createElement('div');
                    hourItem.className = 'modal-hour';
                    hourItem.innerHTML = `
                        <div class="modal-hour-time">${hour}</div>
                        <div class="mini-icon">${iconForCode(code, isNight)}</div>
                        <div class="modal-hour-temp">${formatTemp(hourlyData.hourly.temperature_2m[i])}</div>
                        <div class="modal-hour-wind ${windLevel.tone}">${UI_ICONS.windArrow(windDeg)} ${formatWind(windSpeed)}</div>
                        <div class="modal-hour-rain">${formatMetric(rain, " mm", 1)}</div>
                    `;
                    grid.appendChild(hourItem);
                }
            });
        } catch (e) {
            content.querySelector('.modal-hourly-grid').innerHTML = '<div class="modal-loading">Stündliche Daten nicht verfügbar.</div>';
        }
    }
};

// Abwärtskompatibilität für loadWeather
const loadWeather = (lat, lon, label) => App.fetchFullWeather(lat, lon, label); // Beibehalten für externe Aufrufe

// ================= Specials Dashboard =================
const Specials = {
    getSpecialData: async function(lat, lon) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=uv_index,pressure_msl,dewpoint_2m,visibility,snowfall,snow_height,relative_humidity_2m&timezone=auto`;
        // Nutzt die globale fetchWithCache Funktion aus charts.js
        return fetchWithCache(url, 'specialsWeatherCache');
    },
    getValue: function(arr, index = 0) {
        if (!Array.isArray(arr) || arr.length === 0) return null;
        const value = arr[index] ?? arr[0];
        return isNumber(value) ? value : null;
    },
    getStatus: function(key, value) {
        if (key === "uv") return getLevel("uv", value || 0);
        if (key === "humidity") return getLevel("humidity", value);
        if (key === "visibility") {
            if (!isNumber(value)) return { label: "keine Daten", tone: "neutral" };
            if (value < 2000) return { label: "eingeschränkt", tone: "risk" };
            if (value < 10000) return { label: "mäßig", tone: "watch" };
            return { label: "klar", tone: "good" };
        }
        if (key === "pressure") {
            if (!isNumber(value)) return { label: "keine Daten", tone: "neutral" };
            if (value < 1000) return { label: "tief", tone: "watch" };
            if (value > 1025) return { label: "hoch", tone: "watch" };
            return { label: "stabil", tone: "good" };
        }
        if (key === "dewpoint") {
            if (!isNumber(value)) return { label: "keine Daten", tone: "neutral" };
            if (value >= 18) return { label: "schwül", tone: "watch" };
            if (value <= 2) return { label: "trocken", tone: "watch" };
            return { label: "normal", tone: "good" };
        }
        if (key === "snow") {
            if (!isNumber(value) || value === 0) return { label: "kein Schnee", tone: "good" };
            if (value >= 5) return { label: "viel", tone: "risk" };
            return { label: "leicht", tone: "watch" };
        }
        return { label: "normal", tone: "neutral" };
    },
    formatValue: function(key, value) {
        if (key === "visibility") return isNumber(value) ? `${formatNumber(value / 1000, 1)} km` : "–";
        if (key === "uv") return formatMetric(value, "", 1);
        if (key === "pressure") return formatMetric(value, " hPa");
        if (key === "dewpoint") return formatMetric(value, "°");
        if (key === "humidity") return formatMetric(value, "%");
        if (key === "snow") return formatMetric(value, " cm", 1);
        return formatMetric(value);
    },
    renderDetailItem: function(title, key, value, icon) {
        const status = this.getStatus(key, value);
        return `
            <button class="detail-item ${status.tone}" type="button" onclick="Specials.showInfo('${title}', '${key}')">
                <span class="detail-icon">${icon}</span>
                <span class="detail-copy"><span>${title}</span><small>${status.label}</small></span>
                <strong>${this.formatValue(key, value)}</strong>
            </button>
        `;
    },
    getExplanation: function(key) {
        const info = {
            uv: "Ab 3 Sonnenschutz, ab 6 hoch.",
            pressure: "Tiefer Druck spricht eher für Wechselwetter.",
            dewpoint: "Ab 16° wirkt Luft oft schwül.",
            visibility: "Unter 2 km deutlich eingeschränkt.",
            snow: "Neuschnee und Schneehöhe.",
            humidity: "40-60% fühlt sich meist angenehm an."
        };
        return info[key] || "Detaillierte meteorologische Messung für diesen Standort.";
    },
    render: function(data, label) {
        const h = data.hourly || {};
        const index = getHourlyIndex(h, data.timezone);
        const humidity = this.getValue(h.relative_humidity_2m, index);
        const uv = this.getValue(h.uv_index, index);
        const pressure = this.getValue(h.pressure_msl, index);
        const dewpoint = this.getValue(h.dewpoint_2m, index);
        const visibility = this.getValue(h.visibility, index);
        const snowfall = this.getValue(h.snowfall, index);
        const snowHeight = this.getValue(h.snow_height, index);
        const html = `            
            <div class="section-heading">
                <div>
                    <h2>Detaillierte Wetterdaten</h2>
                </div>
            </div>

            <div class="card details-section">
                <h3 class="details-section-title">Atmosphäre & Sicht</h3>
                <div class="details-grid-layout">
                    ${this.renderDetailItem("Feuchte", "humidity", humidity, UI_ICONS.detailHumidity())}
                    ${this.renderDetailItem("UV-Index", "uv", uv, UI_ICONS.sun())}
                    ${this.renderDetailItem("Luftdruck", "pressure", pressure, UI_ICONS.detailPressure())}
                    ${this.renderDetailItem("Taupunkt", "dewpoint", dewpoint, UI_ICONS.detailDewpoint())}
                    ${this.renderDetailItem("Sichtweite", "visibility", visibility, UI_ICONS.detailVisibility())}
                </div>
            </div>

            <div class="card details-section">
                <h3 class="details-section-title">Schnee & Eis</h3>
                <div class="details-grid-layout">
                    ${this.renderDetailItem("Schneefall", "snow", snowfall, UI_ICONS.snow())}
                    ${this.renderDetailItem("Schneehöhe", "snow", snowHeight, UI_ICONS.snow())}
                </div>
            </div>
        `;
        const container = document.getElementById("specialParamsDashboard");
        if (container) container.innerHTML = html;
    },
    showInfo: function(title, key) {
        const iconMap = {
            uv: UI_ICONS.sun(),
            pressure: UI_ICONS.detailPressure(),
            dewpoint: UI_ICONS.detailDewpoint(),
            visibility: UI_ICONS.detailVisibility(),
            humidity: UI_ICONS.detailHumidity(),
            snow: UI_ICONS.snow()
        };
        const iconHtml = iconMap[key] || "";

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

        const content = document.createElement('div');
        content.className = 'modal-content card';
        content.innerHTML = `
            <button class="modal-close" type="button" onclick="this.closest('.modal-overlay').remove()" aria-label="Schließen">&times;</button>
            <div class="modal-feature-icon">${iconHtml}</div>
            <h2 class="modal-title accent">${title}</h2>
            <p class="modal-text">
                ${this.getExplanation(key)}
            </p>
            <button class="info-link-btn modal-action" type="button" onclick="this.closest('.modal-overlay').remove()">Verstanden</button>
        `;
        overlay.appendChild(content);
        document.body.appendChild(overlay);
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
    const saved = localStorage.getItem(STORAGE_KEYS.defaultLocation);
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
