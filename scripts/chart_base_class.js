const STATS_PROVIDER_RELATIVE_PATH = "Scripts/stats_provider.js";
const STATS_PROVIDER_ABSOLUTE_PATH = app.vault.adapter.getFullPath(STATS_PROVIDER_RELATIVE_PATH);
delete require.cache[require.resolve(STATS_PROVIDER_ABSOLUTE_PATH)];
const { StatsProvider } = require(STATS_PROVIDER_ABSOLUTE_PATH);

/**
 * Базовый класс для чартов статистики
 * Обрабатывает: загрузку данных, подписку на смену периода, создание контейнера,
 * общие Chart.js options, расчёт Y-диапазона
 */
class ChartBaseClass {
    /**
     * @param {Object} dv        — dataview
     * @param {Object} options   — config
     */
    constructor(dv, options = {}) {
        this._dv = dv;
        this._options = options || {};
        this._options.period = this._options.period || {};
        this._options.period.from = this._options.period.from || ((date) => { date.setDate(date.getDate() - 14); return date; })(new Date());
        this._options.period.to = this._options.period.to || new Date();
        this._options.yMinDef = this._options.yMinDef  || 0;
        this._options.yMaxDef = this._options.yMaxDef || 50;
        this._options.useMin = this._options.useMin === false ? false : true;
        this._options.dependsOn = this._options.dependsOn  || ["global"];
        this._containerId = `container-${this._options.id}`;
        this._container = null;
        this._statsProvider = new StatsProvider(dv, 5, 'Archive/Stats');

        StatsProvider.onChartPeriodChange(this._containerId,  this._options.dependsOn, async (period) => {
            this._options.period = period;
            await this.render();
        });
    }

    _getOrCreateContainer() {
        if (this._container) {
            this._container.innerHTML = "";
            return this._container;
        }

        this._container = this._dv.el("div", "", { cls: "chart-container", attr: { id: this._containerId } });
        this._container.style.overflowX = 'auto';
        this._container.style.minHeight = '400px';

        return this._container;
    }

    /* ==================== Данные ==================== */

    _findName(key, name) {
        return key.toLowerCase().includes(name.toLowerCase());
    }

    _findValue(row, rusName, engName) {
        const key = Object.keys(row).find(k => this._findName(k, rusName) || this._findName(k, engName));
        const value = row[key];

        return (value && value !== "--")
            ? parseFloat(String(value).replace(",", "."))
            : null;
    }

    /* ==================== Y-диапазон ==================== */

    _computeYRange(allValues) {
        let yMin = this._options.yMinDef;
        let yMax = this._options.yMaxDef;

        if (allValues.length > 0) {
            const minV = Math.min(...allValues);
            const maxV = Math.max(...allValues);
            if (Number.isFinite(minV) && Number.isFinite(maxV)) {
                if (this._options.useMin) yMin = Math.max(this._options.yMinDef, Math.floor(minV) - 5);
                yMax = Math.min(this._options.yMaxDef, Math.ceil(maxV) + 5);
            }
        }

        return { yMin, yMax };
    }

    /* ==================== Chart.js options ==================== */

    _buildOptions(yMin, yMax, legendFilter) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { filter: legendFilter }
                }
            },
            scales: {
                x: {
                    ticks: {
                        autoSkip: true,
                        includeBounds: true,
                        maxTicksLimit: 15,
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    min: yMin,
                    max: yMax,
                    ticks: { stepSize: 5 }
                }
            }
        };
    }

    /* ==================== datasets и zones ==================== */

    /** Линия данных */
    _line(label, data, color) {
        return { label, data, borderColor: color, borderWidth: 3, tension: 0.3, fill: false };
    }

    /** Зона цели (две линии: top и bottom, заполнение между ними) */
    _zone(topLabel, topValue, bottomLabel, bottomValue, color) {
        return [
            { label: topLabel, data: topValue, borderColor: 'transparent', backgroundColor: this._rgba(color, 0.1), fill: false },
            { label: bottomLabel, data: bottomValue, backgroundColor: this._rgba(color, 0.1), borderColor: 'transparent', fill: '-1' }
        ];
    }

    _rgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    /** Префикс для скрытия зоны из легенды */
    _hideFromLegend(prefix) {
        return (item) => !item.text.includes(prefix);
    }

    /* ==================== Абстрактные методы (переопределяются в наследниках) ==================== */

    /** Возвращает { allValues, datasets, legendFilter } */
    _buildChartConfig(rows, labels) {
        throw new Error(`${this.constructor.name}: _buildChartConfig not implemented`);
    }

    /* ==================== Рендер ==================== */

    async render() {
        const data = await this._statsProvider.getData(this._options.period);
        if (!data.rows || !data.labels) {
            dv.el("div", `No data for period ${this._options.period.from} -- ${this._options.period.to}`);
            return;
        }

        const { allValues, datasets, legendFilter } = this._buildChartConfig(data.rows, data.labels);
        const { yMin, yMax } = this._computeYRange(allValues);
        const options = this._buildOptions(yMin, yMax, legendFilter);

        window.renderChart({ type: 'line', data: { labels: data.labels, datasets }, options }, this._getOrCreateContainer());
    }
}

// CommonJS экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ChartBaseClass
    };
}
