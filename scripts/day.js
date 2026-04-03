async function renderDailyOverview(lat, lon, sunriseStr, sunsetStr) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,weathercode,windspeed_10m&timezone=auto`;
    let data;
    try {
        data = await fetchWithCache(url, 'hourlyWeatherCache');
        if (!data || !data.hourly) throw new Error("Keine stündlichen Daten");
    } catch (e) {
        console.error("Fehler in day.js:", e);
        return;
    }

    const grid = document.getElementById('hourlyForecastGrid');
    grid.innerHTML = '';

    // --- aktuelle Uhrzeit in Zeitzone bestimmen ---
    const timezone = data.timezone;
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));

    // Stunden der API als Date-Objekte
    const times = data.hourly.time.map(t => new Date(t));

    // Startindex finden
    let startIndex = times.findIndex(t =>
        t.getFullYear() === now.getFullYear() &&
        t.getMonth() === now.getMonth() &&
        t.getDate() === now.getDate() &&
        t.getHours() === now.getHours()
    );

    if (startIndex === -1) {
        startIndex = times.findIndex(t => t > now);
    }

    if (startIndex === -1) startIndex = 0;

    // Sonnenzeiten der Hauptdaten als Date
    const sunrise = new Date(sunriseStr);
    const sunset = new Date(sunsetStr);

    // 24 Stunden anzeigen
    const endIndex = Math.min(startIndex + 24, times.length);

    for (let i = startIndex; i < endIndex; i++) {

        const hour = times[i];
        const hourStr = data.hourly.time[i].split("T")[1];
        const dateStr = hour.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });

        const night = (hour < sunrise || hour > sunset);
        const code = data.hourly.weathercode[i]; // weatherText ist global in app.js definiert
        const windSpeed = data.hourly.windspeed_10m[i];
        const windStyle = windSpeed >= 50 ? 'color:#ff4444; font-weight:bold;' : 'opacity:0.8;';
        const hourDiv = document.createElement('div'); 
        hourDiv.className = 'hour';
        hourDiv.innerHTML = `<div style="font-size:0.75rem; opacity:0.7;">${dateStr}</div><div><strong>${hourStr}</strong></div><div class="mini-icon">${iconForCode(code, night)}</div><div style="font-weight:bold;">${data.hourly.temperature_2m[i]}°C</div><div style="font-size:0.8rem; ${windStyle}">Wind: ${windSpeed} km/h</div>`;
        grid.appendChild(hourDiv);
    }
}
