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
        const notice = document.getElementById('offlineNotice');
        if (notice) notice.hidden = true;
        return j;
    } catch (e) {
        console.warn('Fetch fehlgeschlagen:', e);
        const cache = localStorage.getItem(cacheKey);
        if (cache) {
            const { data, stamp } = JSON.parse(cache);
            showOffline(stamp);
            return data;
        } else {
            if (window.showToast) window.showToast('Offline und keine Daten verfügbar.');
            throw e;
        }
    }
}

function formatDaylightMinutes(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours} h ${String(minutes).padStart(2, "0")} min`;
}

function getSunState(nowMs, sunriseMs, sunsetMs, progress) {
    if (nowMs < sunriseMs) return "Vor Sonnenaufgang";
    if (nowMs > sunsetMs) return "Nach Sonnenuntergang";
    if (progress < 0.34) return "Morgenlicht";
    if (progress < 0.67) return "Sonne hoch";
    return "Abendlicht";
}

// Berechnet den Sonnenstand und bewegt den Punkt auf dem Bogen
function updateSunPosition(sunriseStr, sunsetStr, timezone) {
    if (!sunriseStr || !sunsetStr || !timezone) return;

    // Aktuelle Zeit im Zielgebiet ermitteln
    const nowLocale = new Date().toLocaleString("en-US", { timeZone: timezone });
    const now = new Date(nowLocale);
    
    const sunrise = new Date(sunriseStr);
    const sunset = new Date(sunsetStr);
    
    const sunriseLabel = sunriseStr.split('T')[1];
    const sunsetLabel = sunsetStr.split('T')[1];
    const sunCircle = document.getElementById('sunCircle');
    const daylightValue = document.getElementById('sunDaylightValue');
    const currentState = document.getElementById('sunCurrentState');
    const sunriseText = document.getElementById('sunPathSunrise');
    const sunsetText = document.getElementById('sunPathSunset');

    const nowMs = now.getTime();
    const sunriseMs = sunrise.getTime();
    const sunsetMs = sunset.getTime();
    const daylightMinutes = Math.max(0, (sunsetMs - sunriseMs) / 60000);
    const rawProgress = (nowMs - sunriseMs) / Math.max(1, sunsetMs - sunriseMs);
    const progress = Math.min(1, Math.max(0, rawProgress));

    if (sunriseText) sunriseText.textContent = sunriseLabel;
    if (sunsetText) sunsetText.textContent = sunsetLabel;
    if (daylightValue) daylightValue.textContent = formatDaylightMinutes(daylightMinutes);
    if (currentState) currentState.textContent = getSunState(nowMs, sunriseMs, sunsetMs, progress);
    if (!sunCircle) return;

    if (nowMs < sunriseMs || nowMs > sunsetMs) {
        sunCircle.style.opacity = '0'; // Nachts ausblenden
        return;
    }

    sunCircle.style.opacity = '1';

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
        const active = chart.tooltip && typeof chart.tooltip.getActiveElements === 'function'
            ? chart.tooltip.getActiveElements()
            : [];
        const activeElement = active[0]?.element || chart.getDatasetMeta(0).data[chart.selectedIndex];
        if (!activeElement) return;

        const { top, bottom } = chart.chartArea;
        const ctx = chart.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(activeElement.x, top);
        ctx.lineTo(activeElement.x, bottom);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(22, 32, 51, 0.22)';
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.restore();
    }
};

function formatChartTemp(value) {
    if (typeof formatTemp === 'function') return formatTemp(value);
    return Number.isFinite(value) ? `${Math.round(value)}°` : "–";
}

function formatChartRain(value) {
    if (typeof formatMetric === 'function') return formatMetric(value, " mm", 1);
    return Number.isFinite(value) ? `${value.toFixed(1)} mm` : "–";
}

function getChartStartIndex(hourly, timezone) {
    if (typeof getHourlyIndex === 'function') return getHourlyIndex(hourly, timezone);
    if (!hourly || !Array.isArray(hourly.time) || hourly.time.length === 0) return 0;
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone }));
    const times = hourly.time.map(t => new Date(t));
    const next = times.findIndex(t => t >= now);
    return next >= 0 ? next : 0;
}

function getChartPointMeta(time) {
    const date = new Date(time);
    return {
        hour: String(time || "").split("T")[1] || "--:--",
        day: Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })
    };
}

function buildChartPoints(hourly, timezone) {
    const startIndex = getChartStartIndex(hourly, timezone);
    const endIndex = Math.min(startIndex + 24, hourly.time.length);
    return hourly.time.slice(startIndex, endIndex).map((time, offset) => ({
        time,
        temp: hourly.temperature_2m[startIndex + offset],
        rain: hourly.precipitation[startIndex + offset] || 0
    }));
}

function renderChartSummary(points) {
    const summary = document.getElementById('chartSummaryStrip');
    if (!summary || points.length === 0) return;

    const tempPoints = points.filter(point => Number.isFinite(point.temp));
    const current = points[0];
    const minPoint = tempPoints.reduce((best, point) => point.temp < best.temp ? point : best, tempPoints[0] || current);
    const maxPoint = tempPoints.reduce((best, point) => point.temp > best.temp ? point : best, tempPoints[0] || current);
    const maxRain = points.reduce((sum, point) => sum + (Number.isFinite(point.rain) ? point.rain : 0), 0);

    summary.innerHTML = `
        <span class="primary"><small>Jetzt</small><strong>${formatChartTemp(current.temp)}</strong></span>
        <span><small>Wärmster Punkt</small><strong>${formatChartTemp(maxPoint.temp)}</strong></span>
        <span><small>Kühlster Punkt</small><strong>${formatChartTemp(minPoint.temp)}</strong></span>
        <span><small>Regen 24h</small><strong>${formatChartRain(maxRain)}</strong></span>
    `;
}

function renderChartFocus(point, index, total) {
    const panel = document.getElementById('chartFocusPanel');
    if (!panel || !point) return;

    const meta = getChartPointMeta(point.time);
    panel.innerHTML = `
        <span class="chart-focus-time"><small>${meta.day}</small><strong>${index === 0 ? "Jetzt" : meta.hour}</strong></span>
        <span><small>Temperatur</small><strong>${formatChartTemp(point.temp)}</strong></span>
        <span><small>Regen</small><strong>${formatChartRain(point.rain)}</strong></span>
        <span><small>Position</small><strong>${index + 1}/${total}</strong></span>
    `;
}

function renderChartHourControls(points, selectedIndex, onSelect) {
    const controls = document.getElementById('chartHourControls');
    if (!controls) return;

    controls.innerHTML = '';
    const indices = points
        .map((_, index) => index)
        .filter(index => index === 0 || index % 3 === 0 || index === points.length - 1);

    indices.forEach(index => {
        const point = points[index];
        const meta = getChartPointMeta(point.time);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `chart-time-button${index === selectedIndex ? " active" : ""}`;
        button.dataset.index = String(index);
        button.setAttribute('aria-pressed', index === selectedIndex ? 'true' : 'false');

        const time = document.createElement('span');
        time.textContent = index === 0 ? "Jetzt" : meta.hour;
        const temp = document.createElement('strong');
        temp.textContent = formatChartTemp(point.temp);
        button.append(time, temp);
        button.addEventListener('click', () => onSelect(index));
        controls.appendChild(button);
    });
}

function syncChartSelection(chart, points, index) {
    if (!points.length) return;
    const selectedIndex = Math.min(points.length - 1, Math.max(0, index));
    const point = points[selectedIndex];
    const pointElement = chart.getDatasetMeta(0).data[selectedIndex];

    chart.selectedIndex = selectedIndex;
    renderChartFocus(point, selectedIndex, points.length);
    renderChartHourControls(points, selectedIndex, nextIndex => syncChartSelection(chart, points, nextIndex));

    if (pointElement) {
        const active = [{ datasetIndex: 0, index: selectedIndex }];
        if (chart.data.datasets[1]) active.push({ datasetIndex: 1, index: selectedIndex });
        chart.setActiveElements(active);
        chart.tooltip.setActiveElements(active, { x: pointElement.x, y: pointElement.y });
    }
    chart.update();
}

// --- Render Charts ---
async function renderCharts(lat, lon) {
    const hourlyUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation&daily=sunrise,sunset&timezone=auto&forecast_days=2`;
    const hourlyData = await fetchWithCache(hourlyUrl, 'hourlyWeatherCache');
    
    updateSunPosition(hourlyData.daily.sunrise[0], hourlyData.daily.sunset[0], hourlyData.timezone);

    const ctx = document.getElementById('hourlyChart').getContext('2d');
    
    // Erstelle Gradienten für die Temperatur
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(245, 184, 65, 0.32)');
    gradient.addColorStop(1, 'rgba(245, 184, 65, 0)');

    if (window.myChart) window.myChart.destroy(); // Alten Chart löschen

    const chartPoints = buildChartPoints(hourlyData.hourly, hourlyData.timezone);
    const labels = chartPoints.map(point => getChartPointMeta(point.time).hour);
    const tempData = chartPoints.map(point => point.temp);
    const rainData = chartPoints.map(point => point.rain);
    renderChartSummary(chartPoints);

    window.myChart = new Chart(ctx, {
        type: 'line',
        plugins: [crosshairPlugin],
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Temperatur (°C)',
                    data: tempData,
                    borderColor: '#f5b841',
                    backgroundColor: gradient,
                    pointBackgroundColor: '#f5b841',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: context => context.dataIndex === context.chart.selectedIndex ? 5 : 0,
                    pointHoverRadius: 7,
                    pointHitRadius: 20,
                    borderWidth: 3,
                    fill: true,
                    yAxisID: 'y',
                    tension: 0.38
                },
                {
                    label: 'Regen (mm)',
                    data: rainData,
                    borderColor: '#2775ca',
                    backgroundColor: 'rgba(39, 117, 202, 0.18)',
                    yAxisID: 'y1',
                    type: 'bar',
                    borderRadius: 5,
                    barPercentage: 0.72,
                    categoryPercentage: 0.72
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 220 },
            interaction: { mode: 'index', intersect: false },
            onClick: (event, elements, chart) => {
                if (elements.length > 0) syncChartSelection(chart, chartPoints, elements[0].index);
            },
            onHover: (event, elements, chart) => {
                chart.canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
                if (event.native && event.native.pointerType !== 'touch' && elements.length > 0) {
                    renderChartFocus(chartPoints[elements[0].index], elements[0].index, chartPoints.length);
                }
            },
            plugins: { 
                legend: { 
                    display: true,
                    position: 'bottom',
                    align: 'end',
                    labels: {
                        color: '#4f6374',
                        font: { size: 11, weight: '600' },
                        boxWidth: 12,
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: { 
                    backgroundColor: 'rgba(18, 34, 51, 0.96)', 
                    padding: 12,
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    displayColors: true,
                    bodySpacing: 6,
                    titleFont: { size: 14, weight: 'bold' },
                    callbacks: {
                        title: items => {
                            const point = chartPoints[items[0].dataIndex];
                            const meta = getChartPointMeta(point.time);
                            return `${meta.day} · ${meta.hour}`;
                        },
                        label: item => item.datasetIndex === 0
                            ? `Temperatur ${formatChartTemp(item.parsed.y)}`
                            : `Regen ${formatChartRain(item.parsed.y)}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(22, 32, 51, 0.06)' },
                    ticks: { color: '#607082', font: { size: 10, weight: '700' }, maxRotation: 0, autoSkipPadding: 18 }
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    grid: { color: 'rgba(22, 32, 51, 0.08)' },
                    ticks: { color: '#607082', font: { size: 10, weight: '700' }, callback: value => formatChartTemp(Number(value)) }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    beginAtZero: true,
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#2775ca', font: { size: 10, weight: '700' }, callback: value => `${value} mm` }
                }
            }
        }
    });
    syncChartSelection(window.myChart, chartPoints, 0);
}

// --- Offline Anzeige ---
function showOffline(timestamp) {
    const box = document.getElementById('offlineNotice');
    if (box) {
        box.hidden = false;
        box.innerHTML = `<strong>Offline-Modus</strong><span>Stand: ${timestamp}</span>`;
    }
}
