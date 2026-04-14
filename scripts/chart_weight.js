await dv.view("Resources/Obsidian/scripts/stats_provider");
const { rows, labels, findValue } = await window.myStatsProvider;

const weightValues = rows.map(r => findValue(r, "Вес", "Weight")).filter(v => v !== null);
const muscleValues = rows.map(r => findValue(r, "Мышечная масса", "Muscle Mass")).filter(v => v !== null);
const allValues = [...weightValues, ...muscleValues];

let yMin = 60;
let yMax = 105;
if (allValues.length > 0) {
    const minV = Math.min(...allValues);
    const maxV = Math.max(...allValues);
    if (Number.isFinite(minV) && Number.isFinite(maxV)) {
        yMin = Math.max(60, Math.floor(minV) - 5);
        yMax = Math.min(120, Math.ceil(maxV) + 5);
    }
}

const chartKg = {
    type: 'line',
    data: {
        labels: labels,
        datasets: [
            {
                label: 'Вес (кг)',
                data: rows.map(r => findValue(r, "Вес", "Weight")),
                borderColor: '#3498db',
                borderWidth: 3,
                tension: 0.3,
                fill: false
            },
            {
                label: 'Зона цели: Вес (85-95)',
                data: labels.map(() => 95),
                borderColor: 'transparent',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: false
            },
            {
                label: 'Зона цели: Вес (85-95) low',
                data: labels.map(() => 85),
                borderColor: 'transparent',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: '-1'
            },
            {
                label: 'Мышечная масса (кг)',
                data: rows.map(r => findValue(r, "Мышечная масса", "Muscle Mass")),
                borderColor: '#9b59b6',
                borderWidth: 3,
                tension: 0.3,
                fill: false
            },
            {
                label: 'Зона цели: Мышцы (63-73)',
                data: labels.map(() => 73),
                borderColor: 'transparent',
                backgroundColor: 'rgba(155, 89, 182, 0.1)',
                fill: false
            },
            {
                label: 'Зона цели: Мышцы (63-73) low',
                data: labels.map(() => 63),
                borderColor: 'transparent',
                backgroundColor: 'rgba(155, 89, 182, 0.1)',
                fill: '-1'
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    filter: (item) => !item.text.includes('low')
                }
            }
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

window.renderChart(chartKg, container);
