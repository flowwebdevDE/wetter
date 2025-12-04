async function renderDailyOverview(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,weathercode,windspeed_10m&timezone=auto`;
    const data = await fetchWithCache(url, 'hourlyWeatherCache');

    const grid = document.getElementById('hourlyForecastGrid');
    grid.innerHTML = '';

    // --- aktuelle Uhrzeit in der Zeitzone des Ortes bestimmen ---
    const timezone = data.timezone;
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
    
    // API liefert Stunden als z.B. "2025-11-27T14:00"
    const times = data.hourly.time.map(t => new Date(t));

    // Index der aktuellen Stunde finden.
    // Wir vergleichen Jahr, Monat, Tag und Stunde, um sicherzustellen, dass wir den richtigen Zeitpunkt erwischen.
    let startIndex = times.findIndex(t => 
        t.getFullYear() === now.getFullYear() && t.getMonth() === now.getMonth() && t.getDate() === now.getDate() && t.getHours() === now.getHours());

    // Falls API-Minute 00 und Systemminute >00 -> nächstgrößere Stunde
    if (startIndex === -1) {
        startIndex = times.findIndex(t => t > now);
    }

    if (startIndex === -1) startIndex = 0;

    // Nur 12 Stunden anzeigen
    const endIndex = Math.min(startIndex + 24, times.length);

    for (let i = startIndex; i < endIndex; i++) {
        const hourDiv = document.createElement('div');
        hourDiv.className = 'hour';

        const time = data.hourly.time[i].split('T')[1];
        const temp = data.hourly.temperature_2m[i];
        const rain = data.hourly.precipitation[i];
        const wind = data.hourly.windspeed_10m[i];
        const code = data.hourly.weathercode[i];

        hourDiv.innerHTML = `
            <div><strong>${time}</strong></div>
            <div>${iconForCode(code)}</div>
            <div>${weatherText(code)}</div>
            <div>${temp}°C</div>
            <div>Wind: ${wind} km/h</div>
            <div>${rain} mm</div>
        `;

        grid.appendChild(hourDiv);
    }
}
