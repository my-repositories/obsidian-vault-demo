await dv.view("Resources/Obsidian/scripts/stats_provider");
const { rows, labels, findValue } = await window.myStatsProvider;

const bmiValues = rows.map(r => findValue(r, "ИМТ", "BMI")).filter(v => v !== null);
const visceralValues = rows.map(r => findValue(r, "Висцеральный", "Visceral Fat")).filter(v => v !== null);
const allValues = [...bmiValues, ...visceralValues];

let yMin = 7;
let yMax = 35;
if (allValues.length > 0) {
    const maxV = Math.max(...allValues);
    if (Number.isFinite(maxV)) {
        yMax = Math.min(50, Math.ceil(maxV) + 5);
    }
}

const chartIndices = {
    type: 'line',
    data: {
        labels: labels,
        datasets: [
            { label: 'ИМТ', data: rows.map(r => findValue(r, "ИМТ", "BMI")), borderColor: '#e67e22', borderWidth: 3, tension: 0.3, fill: false },
            { label: 'target-bmi-top', data: labels.map(() => 28), borderColor: 'transparent', backgroundColor: 'rgba(230, 126, 34, 0.1)', fill: false },
            { label: 'Зона: ИМТ (25-28)', data: labels.map(() => 25), backgroundColor: 'rgba(230, 126, 34, 0.1)', borderColor: 'transparent', fill: '-1' },
            { label: 'Висцеральный жир', data: rows.map(r => findValue(r, "Висцеральный", "Visceral Fat")), borderColor: '#7f8c8d', borderWidth: 3, tension: 0.3, fill: false },
            { label: 'target-vis-top', data: labels.map(() => 9), borderColor: 'transparent', backgroundColor: 'rgba(127, 140, 141, 0.1)', fill: false },
            { label: 'Зона: Висцеральный (7-9)', data: labels.map(() => 7), backgroundColor: 'rgba(127, 140, 141, 0.1)', borderColor: 'transparent', fill: '-1' }
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

window.renderChart(chartIndices, container);
