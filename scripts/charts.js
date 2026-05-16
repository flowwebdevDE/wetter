// weather_extensions.js
// --- Zusätzliche Funktionen für erweiterte Wetteranzeige ---

// Prüft Fetch und speichert Cache
async function fetchWithCache(url, cacheKey) {
    try {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        const stamp = new Date().toLocaleString();
        localStorage.setItem(cacheKey, JSON.stringify({ data: j, stamp }));
        document.getElementById('offlineNotice').style.display = 'none';
        return j;
    } catch (e) {
        console.warn('Fetch fehlgeschlagen:', e);
        const cache = localStorage.getItem(cacheKey);
        if (cache) {
            const { data, stamp } = JSON.parse(cache);
            showOffline(stamp);
            return data;
        } else {
            if (window.showToast) showToast('Offline und keine Daten verfügbar.');
            throw e;
        }
    }
}

// Berechnet den Sonnenstand und bewegt den Punkt auf dem Bogen
function updateSunPosition(sunriseStr, sunsetStr, timezone) {
    if (!sunriseStr || !sunsetStr || !timezone) return;

    // Aktuelle Zeit im Zielgebiet ermitteln
    const nowLocale = new Date().toLocaleString("en-US", { timeZone: timezone });
    const now = new Date(nowLocale);
    
    const sunrise = new Date(sunriseStr);
    const sunset = new Date(sunsetStr);
    
    document.getElementById('sunPathSunrise').textContent = sunriseStr.split('T')[1];
    document.getElementById('sunPathSunset').textContent = sunsetStr.split('T')[1];

    const sunCircle = document.getElementById('sunCircle');
    if (!sunCircle) return;

    const nowMs = now.getTime();
    const sunriseMs = sunrise.getTime();
    const sunsetMs = sunset.getTime();

    if (nowMs < sunriseMs || nowMs > sunsetMs) {
        sunCircle.style.opacity = '0'; // Nachts ausblenden
        return;
    }

    sunCircle.style.opacity = '1';
    const progress = (nowMs - sunriseMs) / (sunsetMs - sunriseMs);

    // Bogen: PI (links) zu 0 (rechts)
    const angle = Math.PI * (1 - progress);
    const x = 100 + 80 * Math.cos(angle);
    const y = 80 - 60 * Math.sin(angle);

    sunCircle.setAttribute('cx', x);
    sunCircle.setAttribute('cy', y);
}

/**
 * Custom Crosshair Plugin für Chart.js
 */
const crosshairPlugin = {
    id: 'crosshair',
    afterDraw: (chart) => {
        if (chart.tooltip && chart.tooltip.opacity !== 0) {
            const x = chart.tooltip.caretX;
            const yAxis = chart.scales.y;
            const ctx = chart.ctx;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, yAxis.top);
            ctx.lineTo(x, yAxis.bottom);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.restore();
        }
    }
};

// --- Render Charts ---
async function renderCharts(lat, lon) {
    const hourlyUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation&daily=sunrise,sunset&timezone=auto&forecast_days=2`;
    const hourlyData = await fetchWithCache(hourlyUrl, 'hourlyWeatherCache');
    
    updateSunPosition(hourlyData.daily.sunrise[0], hourlyData.daily.sunset[0], hourlyData.timezone);

    const ctx = document.getElementById('hourlyChart').getContext('2d');
    
    // Erstelle Gradienten für die Temperatur
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(255, 221, 87, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 221, 87, 0)');

    if (window.myChart) window.myChart.destroy(); // Alten Chart löschen

    const labels = hourlyData.hourly.time.slice(0, 24).map(t => t.split('T')[1]);
    const tempData = hourlyData.hourly.temperature_2m.slice(0, 24);
    const rainData = hourlyData.hourly.precipitation.slice(0, 24);

    window.myChart = new Chart(ctx, {
        type: 'line',
        plugins: [crosshairPlugin],
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Temperatur (°C)',
                    data: tempData,
                    borderColor: '#FFDD57',
                    backgroundColor: gradient,
                    pointBackgroundColor: '#FFDD57',
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    borderWidth: 3,
                    fill: true,
                    yAxisID: 'y',
                    tension: 0.4
                },
                {
                    label: 'Regen (mm)',
                    data: rainData,
                    borderColor: '#4af',
                    backgroundColor: 'rgba(68, 170, 255, 0.4)',
                    yAxisID: 'y1',
                    type: 'bar'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false }, // Wichtig für Interaktivität
            plugins: { 
                legend: { 
                    display: true,
                    position: 'bottom',
                    align: 'end',
                    labels: {
                        color: 'rgba(255,255,255,0.8)',
                        font: { size: 11, weight: '600' },
                        boxWidth: 12,
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: { 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    padding: 12,
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    displayColors: true,
                    bodySpacing: 6,
                    titleFont: { size: 14, weight: 'bold' }
                }
            },
            scales: {
                y: { type: 'linear', position: 'left', grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'rgba(255,255,255,0.7)', font: { size: 10 } } },
                y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#4af', font: { size: 10 } } }
            }
        }
    });
}

// --- Offline Anzeige ---
function showOffline(timestamp) {
    const box = document.getElementById('offlineNotice');
    if (box) {
        box.style.display = 'block';
        box.innerHTML = `<span style="font-size: 0.8rem; opacity: 0.8;">Offline-Modus</span><br>Stand: ${timestamp}`;
    }
}
