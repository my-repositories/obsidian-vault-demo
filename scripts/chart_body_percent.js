const CHART_BASE_CLASS_RELATIVE_PATH = "Scripts/chart_base_class.js";
const CHART_BASE_CLASS_ABSOLUTE_PATH = app.vault.adapter.getFullPath(CHART_BASE_CLASS_RELATIVE_PATH);
delete require.cache[require.resolve(CHART_BASE_CLASS_ABSOLUTE_PATH)];
const { ChartBaseClass } = require(CHART_BASE_CLASS_ABSOLUTE_PATH);

class ChartBodyPercent extends ChartBaseClass {
    constructor(dv, options = {}) {
        options.useMin = true;
        options.yMinDef = 0;
        options.yMaxDef = 100;
        options.id = options.id || 'chart-percent';
        super(dv, options);
    }

    _buildChartConfig(rows, labels) {
        const fatValues = rows.map(r => this._findValue(r, "Жир в организме", "Body Fat")).filter(v => v !== null);
        const skeleMuscleValues = rows.map(r => this._findValue(r, "Скелетные мышцы", "Skeletal Muscle")).filter(v => v !== null);
        const subcutFatValues = rows.map(r => this._findValue(r, "Подкожный жир", "Subcutaneous Fat")).filter(v => v !== null);
        const allValues = [...fatValues, ...skeleMuscleValues, ...subcutFatValues];

        const datasets = [
            this._line('Скелетные мышцы (%)', rows.map(r => this._findValue(r, "Скелетные мышцы", "Skeletal Muscle")), '#2ecc71'),
            ...this._zone('Зона: Мышцы % (45-50%)', labels.map(() => 50), 'target-mus-bottom', labels.map(() => 45), '#2ecc71'),
            this._line('Жир (%)', rows.map(r => this._findValue(r, "Жир в организме", "Body Fat")), '#e74c3c'),
            ...this._zone('Зона: Жир (18-22%)', labels.map(() => 22), 'target-fat-bottom', labels.map(() => 18), '#e74c3c'),
            this._line('Подкожный жир (%)', rows.map(r => this._findValue(r, "Подкожный жир", "Subcutaneous Fat")), '#f1c40f'),
            ...this._zone('Зона: Подкож. жир (15-18%)', labels.map(() => 18), 'target-sub-bottom', labels.map(() => 15), '#f1c40f')
        ];

        return { allValues, datasets, legendFilter: this._hideFromLegend('target-') };
    }
}

await new ChartBodyPercent(dv, input).render();
