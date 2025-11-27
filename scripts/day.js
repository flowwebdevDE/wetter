async function renderDailyOverview(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,weathercode,windspeed_10m&timezone=auto`;
    const data = await fetchWithCache(url, 'hourlyWeatherCache');

    const grid = document.getElementById('hourlyForecastGrid');
    grid.innerHTML = '';

    const hoursToShow = Math.min(12, data.hourly.time.length);

    for (let i = 0; i < hoursToShow; i++) {
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
