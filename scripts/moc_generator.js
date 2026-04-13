/**
 * Форматирует дату в читаемый вид
 * @param {*} value - Дата (Date или Luxon DateTime)
 * @returns {string} Форматированная дата
 */
function formatDate(value) {
    if (!value) return '—';
    // Luxon DateTime (у Dataview)
    if (value.toFormat) {
        return value.toFormat("dd.MM.yyyy HH:mm");
    }
    // Обычный Date
    if (value instanceof Date) {
        const d = value;
        const pad = n => String(n).padStart(2, '0');
        return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    return String(value);
}

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
 * Строит HTML-таблицу файлов вручную
 */
function buildFilesTable(files, config) {
    const headers = ["📝 Название", "🕒 Изменено"];
    const vaultName = encodeURIComponent(app.vault.getName());

    if (config.showTags) headers.push("🏷️ Теги");
    if (config.showCreationDate) headers.splice(1, 0, "📅 Создано");

    const rows = files.map(f => {
        const row = [
            { link: f.file.link, name: f.file.name || f.file.path || "?" },
            config.showCreationDate ? formatDate(f.file.ctime) : null,
            formatDate(f.file.mtime)
        ].filter(v => v !== null);

        if (config.showTags) {
            const tags = (f.tags || []).map(tag => {
                const cleanTag = tag.replace('#', '');
                const searchUrl = `obsidian://search?vault=${vaultName}&query=tag%3A%23${encodeURIComponent(cleanTag)}`;
                return `<a href="${searchUrl}"><code>${tag}</code></a>`;
            }).join(" ");
            row.push(tags || "—");
        }

        return row;
    });

    let html = '<table class="dataview table-view-table"><thead class="table-view-thead"><tr>';
    headers.forEach(h => { html += `<th class="table-view-th">${h}</th>`; });
    html += '</tr></thead><tbody>';
    rows.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
            if (typeof cell === 'object' && cell.link) {
                html += `<td class="table-view-td"><a href="#" class="internal-moc-link" data-path="${cell.link.path}">${cell.name}</a></td>`;
            } else {
                html += `<td class="table-view-td">${cell}</td>`;
            }
        });
        html += '</tr>';
    });
    html += '</tbody></table>';

    return html;
}

/**
 * Строит HTML-список папок вручную
 */
async function buildFolderList(folders, currentPath) {
    let html = '<ul class="contains-task-list">';
    for (const folderName of folders) {
        const folderPath = `${currentPath}/${folderName}`;
        // Проверяем, существует ли README в папке
        const readmePath = `${folderPath}/README`;
        html += `<li><a href="#" class="internal-moc-link" data-path="${readmePath}">📁${folderName}</a></li>`;
    }
    html += '</ul>';
    return html;
}

/**
 * Генератор карты каталога для Obsidian
 */
async function generateDirectoryMap(config = {}) {
    // Определяем путь: либо из config.path, либо из текущего файла
    let currentPath;
    if (config.path) {
        currentPath = config.path;
    } else {
        const currentFile = dv.current();
        if (!currentFile || !currentFile.file) {
            dv.paragraph("❌ Не удалось определить текущую папку. Передайте `path` в config.");
            return;
        }
        currentPath = currentFile.file.folder;
    }

    const currentFileName = config.currentFileName || "";

    // Кэширование
    const cacheKey = `moc_cache_${currentPath}_${config.maxDepth}`;
    const now = Date.now();

    // Проверяем кэш
    if (config.cacheDuration > 0) {
        const cached = loadCache(cacheKey);
        if (cached && cached.html && (now - cached.timestamp) < config.cacheDuration * 60 * 1000) {
            dv.el("div", "🔄 Использован кэшированный результат");
            const container = dv.el("div", cached.html);
            container.addEventListener("click", (evt) => {
                const el = evt.target.closest(".internal-moc-link");
                if (el) {
                    evt.preventDefault();
                    const linkPath = el.dataset.path;
                    app.workspace.openLinkText(linkPath, currentPath);
                }
            });
            return;
        }
    }

    try {
        // Получаем структуру каталога
        const folderData = await app.vault.adapter.list(currentPath);

        // Обрабатываем подпапки
        const subFolders = (folderData.folders || [])
            .map(f => f.split("/").pop())
            .filter(f => !config.ignoreList.includes(f))
            .sort((a, b) => a.localeCompare(b));

        // Получаем файлы в текущей папке
        const allPages = dv.pages(`"${currentPath}"`);
        const files = allPages
            .filter(p => {
                if (!p || !p.file) return false;
                if (!p.file.name) return false;
                if (p.file.folder !== currentPath) return false;
                if (p.file.name === currentFileName) return false;
                return true;
            })
            .sort((a, b) => {
                const nameA = a?.file?.name || "";
                const nameB = b?.file?.name || "";
                return nameA.localeCompare(nameB);
            });

        let htmlParts = [];

        // Подпапки
        if (subFolders.length > 0) {
            htmlParts.push('<h3>📂 Подпапки</h3>');
            htmlParts.push(await buildFolderList(subFolders, currentPath));
        }

        // Файлы
        if (files.length > 0) {
            htmlParts.push('<h3>📄 Заметки</h3>');
            htmlParts.push(buildFilesTable(files, config));
        }

        // Пусто
        if (subFolders.length === 0 && files.length === 0) {
            htmlParts.push('<p>В этой папке нет подпапок и заметок.</p>');
        }

        const finalHtml = htmlParts.join('\n\n');

        // Рендерим
        const container = dv.el("div", finalHtml);

        // Добавляем обработчик кликов на внутренние ссылки
        container.addEventListener("click", (evt) => {
            const el = evt.target.closest(".internal-moc-link");
            if (el) {
                evt.preventDefault();
                const linkPath = el.dataset.path;
                app.workspace.openLinkText(linkPath, currentPath);
            }
        });

        // Сохраняем в кэш
        if (config.cacheDuration > 0) {
            saveCache(cacheKey, {
                timestamp: now,
                html: finalHtml
            });
        }

    } catch (error) {
        console.error("Ошибка при генерации карты каталога:", error);
        dv.paragraph(`❌ Ошибка: ${error.message}`);
    }
}

await generateDirectoryMap({
    cacheDuration: input?.cacheDuration ?? 5,
    maxDepth: input?.maxDepth ?? 1,
    ignoreList: input?.ignoreList ?? [".obsidian", ".qwen", ".git", ".cursor", ".vscode", "node_modules"],
    showTags: input?.showTags ?? true,
    showCreationDate: input?.showCreationDate ?? false
});
