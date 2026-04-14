const UTILS_PATH = "Resources/Obsidian/scripts/utils.js";
const UTILS_ABSOLUTE_PATH = app.vault.adapter.getFullPath(UTILS_PATH);
delete require.cache[require.resolve(UTILS_ABSOLUTE_PATH)];
const { getOrCreateCache } = require(UTILS_ABSOLUTE_PATH);

const STATS_FOLDER = "Archive/Stats";
const CACHE_DURATION = input?.cacheDuration ?? 5;

window.myStatsProvider = window.myStatsProvider || (async () => {
    const cached = await getOrCreateCache(`stats_${STATS_FOLDER}`, CACHE_DURATION, async () => {
        const csvFiles = app.vault.getFiles()
            .filter(f => f.path.startsWith(STATS_FOLDER) && f.extension === "csv")
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        const results = await Promise.all(csvFiles.map(file => dv.io.csv(file.path)));
        const csvData = results.filter(data => data).map(data => [...data]).flat();

        const rows = csvData.sort((a, b) => {
            const [dayA, monthA, yearA] = a.Date.split('.').map(Number);
            const [dayB, monthB, yearB] = b.Date.split('.').map(Number);
            const dateA = new Date(yearA, monthA - 1, dayA);
            const dateB = new Date(yearB, monthB - 1, dayB);
            return dateA - dateB;
        });
        const labels = rows.map(r => r["Date"] || r[Object.keys(r)[0]]);

        return { rows, labels };
    });

    const parseNum = (v) => (v && v !== "--") ? parseFloat(String(v).replace(",", ".")) : null;
    const findName = (k, name) => k.toLowerCase().includes(name.toLowerCase());
    const findValue = (row, rusName, engName) => {
        const key = Object.keys(row).find(k => findName(k, rusName) || findName(k, engName));
        return parseNum(row[key]);
    };

    return { ...cached, findValue };
})();
