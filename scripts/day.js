async function renderDailyOverview(lat, lon, sunriseStr, sunsetStr) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,precipitation_probability,weathercode,windspeed_10m,winddirection_10m&timezone=auto`;
    let data;
    try {
        data = await fetchWithCache(url, 'hourlyWeatherCache');
        if (!data || !data.hourly) throw new Error("Keine stündlichen Daten");
    } catch (e) {
        console.error("Fehler in day.js:", e);
        return;
    }

    const grid = document.getElementById('hourlyForecastGrid');
    if (!grid) return;
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
    const sunrise = sunriseStr ? new Date(sunriseStr) : null;
    const sunset = sunsetStr ? new Date(sunsetStr) : null;

    // 24 Stunden anzeigen
    const endIndex = Math.min(startIndex + 24, times.length);
    const rangeLabel = document.getElementById('hourlyRange');
    if (rangeLabel && times[startIndex] && times[endIndex - 1]) {
        const start = data.hourly.time[startIndex].split("T")[1];
        const end = data.hourly.time[endIndex - 1].split("T")[1];
        rangeLabel.textContent = `${start} - ${end}`;
    }

    for (let i = startIndex; i < endIndex; i++) {

        const hour = times[i];
        const hourStr = data.hourly.time[i].split("T")[1];
        const dateStr = hour.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });

        const night = sunrise && sunset ? (hour < sunrise || hour > sunset) : false;
        const code = data.hourly.weathercode[i]; // weatherText ist global in app.js definiert
        const windSpeed = data.hourly.windspeed_10m[i];
        const windDeg = data.hourly.winddirection_10m[i];
        const rain = data.hourly.precipitation[i] || 0;
        const rainChance = data.hourly.precipitation_probability ? data.hourly.precipitation_probability[i] : null;
        const windLevel = getLevel("wind", windSpeed || 0);
        const rainLevel = getLevel("rain", rain, { probability: rainChance });
        const hourDiv = document.createElement('div'); 
        hourDiv.className = `hour ${i === startIndex ? "is-now" : ""}`;
        hourDiv.innerHTML = `
            <div class="hour-time"><span>${dateStr}</span><strong>${hourStr}</strong></div>
            <div class="mini-icon">${iconForCode(code, night)}</div>
            <div class="hour-temp">${formatTemp(data.hourly.temperature_2m[i])}</div>
            <div class="hour-meta ${rainLevel.tone}"><span>Regen</span><strong>${rainChance != null ? `${rainChance}%` : formatMetric(rain, " mm", 1)}</strong></div>
            <div class="hour-meta ${windLevel.tone}"><span>${UI_ICONS.windArrow(windDeg)} Wind</span><strong>${formatWind(windSpeed)}</strong></div>
        `;
        grid.appendChild(hourDiv);
    }
}
