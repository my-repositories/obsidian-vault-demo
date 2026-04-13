/**
 * Сохраняет кэш в localStorage
 */
function saveCache(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.warn("Не удалось сохранить кэш:", e);
    }
}

/**
 * Загружает кэш из localStorage
 */
function loadCache(key) {
    try {
        const cached = localStorage.getItem(key);
        return cached ? JSON.parse(cached) : null;
    } catch (e) {
        console.warn("Не удалось загрузить кэш:", e);
        return null;
    }
}

/**
 * Карта иконок по тегам (можно расширять)
 */
const ICON_MAP = {
    // Areas
    "area/personal-efficiency": "🧠",
    "area/health": "❤️",
    "area/beauty": "💄",
    "area/media": "🎬",
    "area/gaming": "🎮",
    "area/home": "🏠",
    "area/it": "💻",
    "area/it-lang": "🔧",
    "area/it-vibecode": "🤖",
    "area/pc": "🖥️",
    "area/drawing": "🎨",
    "area/sport": "🏋️",
    "area/moc": "🗺️",
    // Projects
    "project/gametrainer": "🎮",
    "project/mimirons": "⚒️",
    // Resources
    "resource/obsidian": "📓",
    "resource/telegram": "✈️",
    // Streaming
    "streaming": "📡",
    "donations": "💰",
    "twitch": "📺",
    "boosty": "🚀",
    "wow": "⚔️",
    // Marketing
    "marketing": "📢",
    "social-media": "🌐",
    "subscriptions": "🔔",
    // Types
    "type/kanban": "📋",
    "type/notes": "📝",
    "type/links": "🔗",
    "type/dashboard": "📊",
    // Specific
    "book/goggins": "📖",
    "media/series": "📺",
    "media/movies": "🎬",
    "media/shows": "📺",
    "hardware": "🔩",
    "steam": "🎮",
    "interview": "🤝",
    "frontend": "🌐",
    "hacking": "🕵️",
    "assembler": "⚙️",
    "sql": "🗃️",
    "wasm": "🧩",
    "job-search": "💼",
    "os/windows": "🪟",
    "os/linux": "🐧",
    "arch": "🏹",
    "software": "📦",
    "browser": "🌐",
    "jetbrains": "🧠",
    "supplements": "💊",
    "creatine": "🧪",
    "internet/providers": "🌐",
    "backlog": "📚",
    "resources": "📂",
    "stress-test": "🔥",
};

/**
 * Рендерит таблицу и настраивает обработчики
 */
function renderTable(rows, searchFolder, cacheKey, cacheDuration, now) {
    if (rows.length === 0) {
        dv.paragraph("ℹ️ Нет данных для отображения.");
        return;
    }

    const tableHtml = `<table class="dataview table-view-table">
        <thead class="table-view-thead">
            <tr>
                <th class="table-view-th">Область</th>
                <th class="table-view-th">Кол-во заметок</th>
            </tr>
        </thead>
        <tbody>
            ${rows.map(r => `<tr><td class="table-view-td">${r[0]}</td><td class="table-view-td">${r[1]}</td></tr>`).join("")}
        </tbody>
    </table>`;

    dv.el("div", tableHtml);

    if (cacheDuration > 0) {
        saveCache(cacheKey, {
            timestamp: now,
            html: tableHtml
        });
    }
}

/**
 * Авто-навигатор по тегам — сканирует папку и строит таблицу
 * @param {Object} config - Настройки
 * @param {string} config.folder - Папка для сканирования (по умолчанию — папка текущего файла)
 * @param {boolean} config.recursive - Сканировать рекурсивно (по умолчанию true)
 * @param {string} config.tagPrefix - Фильтр по префиксу тега (по умолчанию "area/")
 * @param {number} config.cacheDuration - Время жизни кэша в минутах (0 = без кэша)
 */
async function autoTagNav(config = {}) {
    const currentFile = dv.current();
    if (!currentFile || !currentFile.file) {
        dv.paragraph("❌ Не удалось определить текущий файл.");
        return;
    }

    const searchFolder = config.folder || currentFile.file.folder;
    const tagPrefix = config.tagPrefix || "area/";
    const recursive = config.recursive !== false;

    // Кэширование
    const cacheKey = `autotag_cache_${searchFolder}_${tagPrefix}_${recursive}`;
    const now = Date.now();

    if (config.cacheDuration > 0) {
        const cached = loadCache(cacheKey);
        if (cached && cached.html && (now - cached.timestamp) < config.cacheDuration * 60 * 1000) {
            dv.el("div", "🔄 Использован кэшированный результат");
            dv.el("div", cached.html);
            return;
        }
    }

    // Собираем все файлы
    const allFiles = recursive ? dv.pages(`"${searchFolder}"`) : dv.pages(`"${searchFolder}"`).filter(p => p.file.folder === searchFolder);

    // Извлекаем уникальные теги с префиксом
    const tagSet = new Set();
    allFiles.forEach(f => {
        if (f.tags && Array.isArray(f.tags)) {
            f.tags.forEach(t => {
                if (t.startsWith(tagPrefix)) {
                    tagSet.add(t);
                }
            });
        }
    });

    // Для каждого тега: формируем ссылку на поиск по тегу
    const rows = [];
    const sortedTags = [...tagSet].sort();

    const vaultName = encodeURIComponent(app.vault.getName());

    for (const tag of sortedTags) {
        // Находим файлы с этим тегом
        const taggedFiles = allFiles.filter(p => p.tags && p.tags.includes(tag));
        const count = taggedFiles.length;
        const icon = ICON_MAP[tag] || "❓";

        // Ссылка на поиск по тегу в Obsidian
        const cleanTag = tag.replace('#', '');
        const searchUrl = `obsidian://search?vault=${vaultName}&query=tag%3A%23${cleanTag}`;
        const displayName = tag.replace(tagPrefix, "");

        const linkHtml = `<a href="${searchUrl}">${icon} ${displayName}</a>`;

        rows.push([linkHtml, count || "—"]);
    }

    if (rows.length === 0) {
        dv.paragraph(`ℹ️ В папке "${searchFolder}" не найдено тегов с префиксом "${tagPrefix}"`);
        return;
    }

    renderTable(rows, searchFolder, cacheKey, config.cacheDuration, now);
}

await autoTagNav({
    folder: input?.folder ?? undefined,
    tagPrefix: input?.tagPrefix ?? "area/",
    recursive: input?.recursive ?? true,
    cacheDuration: input?.cacheDuration ?? 5
});
