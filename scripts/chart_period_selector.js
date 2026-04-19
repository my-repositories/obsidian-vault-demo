/**
 * UI-селектор выбора периода для чартов статистики
 */

const STATS_PROVIDER_PATH = "Scripts/stats_provider.js";
const STATS_PROVIDER_ABSOLUTE_PATH = app.vault.adapter.getFullPath(STATS_PROVIDER_PATH);
delete require.cache[require.resolve(STATS_PROVIDER_ABSOLUTE_PATH)];
const { StatsProvider } = require(STATS_PROVIDER_ABSOLUTE_PATH);

const ChartPreset = {
    last_week: '1 неделя',
    last_two_weeks: '2 недели',
    last_three_weeks: '3 недели',
    last_four_weeks: '4 недели',
    last_30_days: '30 дней',
    last_60_days: '60 дней',
    last_90_days: '90 дней',
    last_year: 'Год',
    all: 'Всё',
    custom: 'Свой'
};

const daysMap = {
    last_week: 7,
    last_two_weeks: 14,
    last_three_weeks: 21,
    last_four_weeks: 28,
    last_30_days: 30,
    last_60_days: 60,
    last_90_days: 90,
    last_year: 365,
    all: 3650,
};

class ChartPeriodSelector {
    constructor(options = {}) {
        this._options = options;
        this._options.id = options.id || "global";
        this._options.period = this._options.period || {};
        this._options.period.from = this._options.period.from || ((date) => { date.setDate(date.getDate() - 14); return date; })(new Date());
        this._options.period.to = this._options.period.to || new Date();
    }

    /** Возвращает { from, to } для заданного preset периода */
    _getDateRangeForPreset(preset) {
        const to = new Date();
        to.setHours(23, 59, 59, 999);

        const from = daysMap[preset] ? (() => {
            const d = new Date(to);
            d.setDate(d.getDate() - daysMap[preset]);
            return d;
        })() : null;

        return { from, to };
    }

    _formatDate(date) {
        return date ? date.toISOString().split('T')[0] : '';
    }

    _createUI() {
        this.container = dv.el("div", "", { cls: "chart-period-selector" });
        this.container.createEl("span", { text: "Период:", cls: "chart-period-label" });
        this.select = this.container.createEl("select", { cls: "chart-period-select dropdown" });

        for (const [value, label] of Object.entries(ChartPreset)) {
            this.select.createEl("option", { value, text: label });
        }
        this.select.options[1].selected = true;
        this.select.dataset.prev = this.select.value;

        this.customContainer = this.container.createEl("span", { cls: "chart-period-custom" });
        this.customContainer.style.cssText = "display: none; align-items: center; gap: 6px;";
        this.fromInput = this.customContainer.createEl("input", {
            type: "date",
            cls: "chart-period-date"
        });
        this.customContainer.createEl("span", { text: "—", cls: "chart-period-sep" });
        this.toInput = this.customContainer.createEl("input", {
            type: "date",
            cls: "chart-period-date"
        });
        this.refreshBtn = this.container.createEl("button", { text: "↻", cls: "chart-period-refresh" });
    }

    _buildCustomPeriod() {
        return {
            from: new Date(this.fromInput.value),
            to: new Date(this.toInput.value)
        };
    }

    async _applyCustomPeriod() {
        await StatsProvider.dispatchPeriodChange(this._options.id, this._buildCustomPeriod());
    }

    _setupListeners() {
        this.select.addEventListener("change", async () => {
            let period;
            if (this.select.value === 'custom') {
                period = this.select.dataset.prev;
                this.customContainer.style.display = 'flex';

            } else {
                period = this.select.value;
                this.customContainer.style.display = 'none';
            }

            const { from, to } = this._getDateRangeForPreset(period)
            this.fromInput.value = this._formatDate(from);
            this.toInput.value = this._formatDate(to);
            this.select.dataset.prev = this.select.value;
            await this._applyCustomPeriod()
        });

        this.fromInput.addEventListener("change", async () => {
            await this._applyCustomPeriod();
        });
        this.toInput.addEventListener("change", async () => {
            await this._applyCustomPeriod();
        });
        this.refreshBtn.addEventListener("click", async () => {
            await this._applyCustomPeriod();
        });
    }

    init() {
        this._createUI();
        this._setupListeners();
    }
}


new ChartPeriodSelector(input).init();
