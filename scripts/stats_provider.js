const UTILS_PATH = "Scripts/utils.js";
const UTILS_ABSOLUTE_PATH = app.vault.adapter.getFullPath(UTILS_PATH);
delete require.cache[require.resolve(UTILS_ABSOLUTE_PATH)];
const { createPending, getOrCreateCache, formatDate } = require(UTILS_ABSOLUTE_PATH);

/**
 * Чтение, фильтрация и кэширование данных статистики
 */
class StatsProvider {
    constructor(dv, cacheDuration, statsFolder) {
        this._dv = dv;
        this._cacheDuration = cacheDuration;
        this._statsFolder = statsFolder;
    }

    /* ==================== Разрешение файлов ==================== */

    /**
     * Парсит имя CSV файла в объект { year, month, day }
     * Форматы: YYYY-MM.csv, YYYY-MM-DD.csv
     */
    _parseFileName(fileName) {
        const base = fileName.replace('.csv', '');
        const parts = base.split('-').map(Number);
        return {
            year: parts[0],
            month: parts[1] || 1,
            day: parts[2] || 1
        };
    }

    /**
     * Получает все CSV файлы статистики, отсортированные по дате
     */
    _getAllFiles() {
        return app.vault.getFiles()
            .filter(f => f.path.startsWith(this._statsFolder) && f.extension === 'csv')
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    }

    /**
     * Определяет какие файлы нужны для заданного периода
     */
    _resolveFilesForPeriod(period) {
        const allFiles = this._getAllFiles();

        return allFiles.filter(file => {
            const parsed = this._parseFileName(file.name);
            const fileDate = new Date(parsed.year, parsed.month - 1, parsed.day);
            const fileEndOfMonth = new Date(parsed.year, parsed.month, 0);
            return fileDate <= period.to && fileEndOfMonth >= period.from;
        });
    }

    /**
     * Создаёт уникальный ключ кэша для периода
     */
    _getCacheKeyForPeriod(period) {
        return `cache_stats/Archive/Stats/${formatDate(period.from, false)}_${formatDate(period.to, false)}`;
    }

    /* ==================== Чтение и парсинг ==================== */

    /**
     * Читает CSV из указанных файлов и объединяет в один массив
     */
    async _loadDataFromFiles(files) {
        const results = await Promise.all(files.map(file => this._dv.io.csv(file.path)));
        return results.filter(data => data).map(data => [...data]).flat();
    }

    /**
     * Сортирует данные по дате и формирует labels
     */
    _buildRowsAndLabels(csvData) {
        const rows = csvData.sort((a, b) => {
            const [dayA, monthA, yearA] = a.Date.split('.').map(Number);
            const [dayB, monthB, yearB] = b.Date.split('.').map(Number);
            const dateA = new Date(yearA, monthA - 1, dayA);
            const dateB = new Date(yearB, monthB - 1, dayB);
            return dateA - dateB;
        });
        const labels = rows.map(r => r["Date"] || r[Object.keys(r)[0]]);
        return { rows, labels };
    }

    static _getPeriodListeners() {
        const listenersSymbol = Symbol.for('chartPeriodListeners');
        window[listenersSymbol] = window[listenersSymbol] || new Map();

        return window[listenersSymbol];
    }


    /* ==================== Публичный API ==================== */

    /**
     * Возвращает данные с кэшированием и дедупликацией
     */
    async getData(period) {
        const cacheKey = this._getCacheKeyForPeriod(period);

        return createPending('stats', cacheKey, async () => {
            return getOrCreateCache(cacheKey, this._cacheDuration, async () => {
                const files = this._resolveFilesForPeriod(period);
                const csvData = await this._loadDataFromFiles(files);
                return this._buildRowsAndLabels(csvData);
            });
        });
    }

    static onChartPeriodChange(chartId,  chartDependsOn, fn) {
        const eventBus = this._getPeriodListeners();

        for (const selector of chartDependsOn){
            if (!eventBus.has(selector)) {
                eventBus.set(selector, new Map());
            }
            eventBus.get(selector).set(chartId, fn);
        }
    }

    static async dispatchPeriodChange(periodSelectorId, periodValue) {
        await Promise.all(this._getPeriodListeners().get(periodSelectorId).entries().map(([id, fn]) => {
            try {
                fn(periodValue);
            } catch (err) {
                console.error(`[from=${periodValue.from}, to=${periodValue.to}] listener=${id} periodSelectorId=${periodSelectorId}| error:`, err);
            }
        }));
    }
}

// CommonJS экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        StatsProvider
    };
}
