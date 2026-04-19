const CHART_BASE_CLASS_RELATIVE_PATH = "Scripts/chart_base_class.js";
const CHART_BASE_CLASS_ABSOLUTE_PATH = app.vault.adapter.getFullPath(CHART_BASE_CLASS_RELATIVE_PATH);
delete require.cache[require.resolve(CHART_BASE_CLASS_ABSOLUTE_PATH)];
const { ChartBaseClass } = require(CHART_BASE_CLASS_ABSOLUTE_PATH);

class ChartIndices extends ChartBaseClass {
    constructor(dv, options = {}) {
        options.useMin = false;
        options.yMinDef = 7;
        options.yMaxDef = 50;
        options.id = options.id || 'chart-indices';
        super(dv, options);
    }

    _buildChartConfig(rows, labels) {
        const bmiValues = rows.map(r => this._findValue(r, "ИМТ", "BMI")).filter(v => v !== null);
        const visceralValues = rows.map(r => this._findValue(r, "Висцеральный", "Visceral Fat")).filter(v => v !== null);
        const allValues = [...bmiValues, ...visceralValues];

        const datasets = [
            this._line('ИМТ', rows.map(r => this._findValue(r, "ИМТ", "BMI")), '#e67e22'),
            ...this._zone('Зона: ИМТ (25-28)', labels.map(() => 28), 'target-bmi-bottom', labels.map(() => 25), '#e67e22'),
            this._line('Висцеральный жир', rows.map(r => this._findValue(r, "Висцеральный", "Visceral Fat")), '#7f8c8d'),
            ...this._zone('Зона: Висцеральный (7-9)', labels.map(() => 9), 'target-vis-bottom', labels.map(() => 7), '#7f8c8d')
        ];

        return { allValues, datasets, legendFilter: this._hideFromLegend('target-') };
    }
}

await new ChartIndices(dv, input).render();
