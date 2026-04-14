await dv.view("Resources/Obsidian/scripts/stats_provider");
const { rows, labels, findValue } = await window.myStatsProvider;

const fatValues = rows.map(r => findValue(r, "Жир в организме", "Body Fat")).filter(v => v !== null);
const skeleMuscleValues = rows.map(r => findValue(r, "Скелетные мышцы", "Skeletal Muscle")).filter(v => v !== null);
const subcutFatValues = rows.map(r => findValue(r, "Подкожный жир", "Subcutaneous Fat")).filter(v => v !== null);
const allValues = [...fatValues, ...skeleMuscleValues, ...subcutFatValues];

let yMin = 15;
let yMax = 50;
if (allValues.length > 0) {
    const minV = Math.min(...allValues);
    const maxV = Math.max(...allValues);
    if (Number.isFinite(minV) && Number.isFinite(maxV)) {
        yMin = Math.max(0, Math.floor(minV) - 5);
        yMax = Math.min(100, Math.ceil(maxV) + 5);
    }
}

const chartPercent = {
    type: 'line',
    data: {
        labels: labels,
        datasets: [
            { label: 'Скелетные мышцы (%)', data: rows.map(r => findValue(r, "Скелетные мышцы", "Skeletal Muscle")), borderColor: '#2ecc71', borderWidth: 3, tension: 0.3, fill: false },
            { label: 'target-mus-top', data: labels.map(() => 50), borderColor: 'transparent', backgroundColor: 'rgba(46, 204, 113, 0.1)', fill: false },
            { label: 'Зона: Мышцы % (45-50%)', data: labels.map(() => 45), backgroundColor: 'rgba(46, 204, 113, 0.1)', borderColor: 'transparent', fill: '-1' },
            { label: 'Жир (%)', data: rows.map(r => findValue(r, "Жир в организме", "Body Fat")), borderColor: '#e74c3c', borderWidth: 3, tension: 0.3, fill: false },
            { label: 'target-fat-top', data: labels.map(() => 22), borderColor: 'transparent', backgroundColor: 'rgba(231, 76, 60, 0.1)', fill: false },
            { label: 'Зона: Жир (18-22%)', data: labels.map(() => 18), backgroundColor: 'rgba(231, 76, 60, 0.1)', borderColor: 'transparent', fill: '-1' },
            { label: 'Подкожный жир (%)', data: rows.map(r => findValue(r, "Подкожный жир", "Subcutaneous Fat")), borderColor: '#f1c40f', borderWidth: 3, tension: 0.3, fill: false },
            { label: 'target-sub-top', data: labels.map(() => 18), borderColor: 'transparent', backgroundColor: 'rgba(241, 196, 15, 0.1)', fill: false },
            { label: 'Зона: Подкож. жир (15-18%)', data: labels.map(() => 15), backgroundColor: 'rgba(241, 196, 15, 0.1)', borderColor: 'transparent', fill: '-1' }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { filter: (item) => !item.text.includes('target-') } }
        },
        scales: {
            x: {
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 15,
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: {
                min: yMin,
                max: yMax,
                ticks: {
                    stepSize: 5
                }
            }
        }
    }
};

const container = dv.el("div", "", { cls: "chart-container" });
container.style.overflowX = 'auto';
container.style.minHeight = '400px';

window.renderChart(chartPercent, container);
