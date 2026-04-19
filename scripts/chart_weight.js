const CHART_BASE_CLASS_RELATIVE_PATH = "Scripts/chart_base_class.js";
const CHART_BASE_CLASS_ABSOLUTE_PATH = app.vault.adapter.getFullPath(CHART_BASE_CLASS_RELATIVE_PATH);
delete require.cache[require.resolve(CHART_BASE_CLASS_ABSOLUTE_PATH)];
const { ChartBaseClass } = require(CHART_BASE_CLASS_ABSOLUTE_PATH);

class ChartWeight extends ChartBaseClass {
    constructor(dv, options = {}) {
        options.useMin = true;
        options.yMinDef = 60;
        options.yMaxDef = 120;
        options.id = options.id || 'chart-weight';
        super(dv, options);
    }

    _buildChartConfig(rows, labels) {
        const weightValues = rows.map(r => this._findValue(r, "Вес", "Weight")).filter(v => v !== null);
        const muscleValues = rows.map(r => this._findValue(r, "Мышечная масса", "Muscle Mass")).filter(v => v !== null);
        const allValues = [...weightValues, ...muscleValues];

        const datasets = [
            this._line('Вес (кг)', rows.map(r => this._findValue(r, "Вес", "Weight")), '#3498db'),
            ...this._zone('Зона цели: Вес (85-95)', labels.map(() => 95), 'Зона цели: Вес (85-95) low', labels.map(() => 85), '#3498db'),
            this._line('Мышечная масса (кг)', rows.map(r => this._findValue(r, "Мышечная масса", "Muscle Mass")), '#9b59b6'),
            ...this._zone('Зона цели: Мышцы (63-73)', labels.map(() => 73), 'Зона цели: Мышцы (63-73) low', labels.map(() => 63), '#9b59b6')
        ];

        return { allValues, datasets, legendFilter: this._hideFromLegend('low') };
    }
}

await new ChartWeight(dv, input).render();
