const UTILS_PATH = "Resources/Obsidian/scripts/utils.js";
const UTILS_ABSOLUTE_PATH = app.vault.adapter.getFullPath(UTILS_PATH);
delete require.cache[require.resolve(UTILS_ABSOLUTE_PATH)];
const { getVaultSearchUrl, getOrCreateCache } = require(UTILS_ABSOLUTE_PATH);

class TagGenerator {
    constructor(dv, params = {}) {
        this.dv = dv;
        this.app = dv.app;
        this.config = {
            cacheDuration: params.cacheDuration ?? 5,
            folder: params.folder ?? undefined,
            tagPrefix: params.tagPrefix ?? "area/",
            recursive: params.recursive ?? true,
            ...params
        };

        this.ICON_MAP = {
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
    }

    buildRows(allFiles) {
        const tagSet = new Set();

        allFiles.forEach(f => {
            if (f.tags && Array.isArray(f.tags)) {
                f.tags.forEach(t => {
                    if (t.startsWith(this.config.tagPrefix)) {
                        tagSet.add(t);
                    }
                });
            }
        });

        const sortedTags = [...tagSet].sort();
        const rows = [];

        for (const tag of sortedTags) {
            const taggedFiles = allFiles.filter(p => p.tags && p.tags.includes(tag));
            const count = taggedFiles.length;
            const icon = this.ICON_MAP[tag] || "❓";
            const searchUrl = getVaultSearchUrl(tag);
            const displayName = tag.replace(this.config.tagPrefix, "");
            const linkHtml = `<a href="${searchUrl}">${icon} ${displayName}</a>`;

            rows.push([linkHtml, count || "—"]);
        }

        return rows;
    }

    async render() {
        const currentFile = this.dv.current();
        if (!currentFile || !currentFile.file) {
            this.dv.paragraph("❌ Не удалось определить текущий файл.");
            return;
        }

        const searchFolder = this.config.folder || currentFile.file.folder;

        const cached = await getOrCreateCache(`autotag/${searchFolder}_${this.config.tagPrefix}_${this.config.recursive}`, this.config.cacheDuration, async () => {
            const allPages = this.dv.pages(`"${searchFolder}"`);
            const allFiles = this.config.recursive
                ? allPages
                : allPages.filter(p => p.file.folder === searchFolder);

            const rows = this.buildRows(allFiles);

            if (rows.length === 0) {
                this.dv.paragraph(`ℹ️ В папке "${searchFolder}" не найдено тегов с префиксом "${this.config.tagPrefix}"`);
                return { html: null };
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

            return { html: tableHtml };
        });

        if (cached.html) {
            this.dv.el("div", cached.html);
        }
    }
}

await new TagGenerator(dv, input).render();
