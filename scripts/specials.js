// ======================== HILFSFUNKTIONEN ========================
async function fetchSpecialParams(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&hourly=uv_index,pressure_msl,dewpoint_2m,visibility,snow_depth,windshear_10m` +
        `&timezone=auto`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("HTTP Error " + res.status);
        const data = await res.json();
        return data;
    } catch (e) {
        console.error("Fehler beim Laden der Spezialparameter:", e);
        return null;
    }
}

// ======================== RENDERFUNKTION ========================
function renderSpecialParams(data, label) {
    if (!data) {
        document.getElementById('specialParams').innerHTML = "Spezialparameter konnten nicht geladen werden.";
        return;
    }

    const uv = data.hourly?.uv_index?.[0] ?? "-";
    const pressure = data.hourly?.pressure_msl?.[0] ?? "-";
    const dewpoint = data.hourly?.dewpoint_2m?.[0] ?? "-";
    const visibility = data.hourly?.visibility?.[0] ?? "-";
    const snow = data.hourly?.snow_depth?.[0] ?? "-";
    const windshear = data.hourly?.windshear_10m?.[0] ?? "-";

    document.getElementById('specialParams').innerHTML = `
        <h3>${label}</h3>
        <div>UV-Index: ${uv}</div>
        <div>Luftdruck: ${pressure} hPa</div>
        <div>Taupunkt: ${dewpoint}°C</div>
        <div>Sichtweite: ${visibility} m</div>
        <div>Schneehöhe: ${snow} cm</div>
        <div>Windscherung: ${windshear} m/s</div>
    `;
}

// ======================== EXPORTIERTE FUNKTION ========================
// Diese Funktion kann vom Hauptskript aufgerufen werden:
async function updateSpecialParams(lat, lon, label) {
    const data = await fetchSpecialParams(lat, lon);
    renderSpecialParams(data, label);
}
