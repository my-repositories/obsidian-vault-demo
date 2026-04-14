const UTILS_PATH = "Resources/Obsidian/scripts/utils.js";
const UTILS_ABSOLUTE_PATH = app.vault.adapter.getFullPath(UTILS_PATH);
delete require.cache[require.resolve(UTILS_ABSOLUTE_PATH)];
const { formatDate, getVaultSearchUrl, getOrCreateCache } = require(UTILS_ABSOLUTE_PATH);

class MOCGenerator {
    constructor(dv, params = {}) {
        this.dv = dv;
        this.app = dv.app;
        this.config = {
            cacheDuration: params.cacheDuration ?? 5,
            maxDepth: params.maxDepth ?? 1,
            ignoreList: params.ignoreList ?? [".obsidian", ".qwen", ".git", ".cursor", ".vscode", "node_modules"],
            showTags: params.showTags ?? true,
            showCreationDate: params.showCreationDate ?? false,
            path: params.path ?? undefined,
            currentFileName: params.currentFileName ?? "",
            ...params
        };
    }

    buildFilesTable(files) {
        const headers = ["📝 Название", "🕒 Изменено"];

        if (this.config.showTags) headers.push("🏷️ Теги");
        if (this.config.showCreationDate) headers.splice(1, 0, "📅 Создано");

        const rows = files.map(f => {
            const row = [
                { link: f.file.link, name: f.file.name || f.file.path || "?" },
                this.config.showCreationDate ? formatDate(f.file.ctime) : null,
                formatDate(f.file.mtime)
            ].filter(v => v !== null);

            if (this.config.showTags) {
                const tags = (f.tags || []).map(tag => {
                    const searchUrl = getVaultSearchUrl(tag);
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

    buildFolderList(folders, currentPath) {
        let html = '<ul class="contains-task-list">';
        for (const folderName of folders) {
            const folderPath = `${currentPath}/${folderName}`;
            const readmePath = `${folderPath}/README`;
            html += `<li><a href="#" class="internal-moc-link" data-path="${readmePath}">📁${folderName}</a></li>`;
        }
        html += '</ul>';
        return html;
    }

    setupLinkHandlers(container, currentPath) {
        container.addEventListener("click", (evt) => {
            const el = evt.target.closest(".internal-moc-link");
            if (el) {
                evt.preventDefault();
                const linkPath = el.dataset.path;
                this.app.workspace.openLinkText(linkPath, currentPath);
            }
        });
    }

    async render() {
        let currentPath;
        if (this.config.path) {
            currentPath = this.config.path;
        } else {
            const currentFile = this.dv.current();
            if (!currentFile || !currentFile.file) {
                this.dv.paragraph("❌ Не удалось определить текущую папку. Передайте `path` в config.");
                return;
            }
            currentPath = currentFile.file.folder;
        }

        const cached = await getOrCreateCache(`moc/${currentPath}`, this.config.cacheDuration, async () => {
            const folderData = await this.app.vault.adapter.list(currentPath);

            const subFolders = (folderData.folders || [])
                .map(f => f.split("/").pop())
                .filter(f => !this.config.ignoreList.includes(f))
                .sort((a, b) => a.localeCompare(b));

            const allPages = this.dv.pages(`"${currentPath}"`);
            const files = allPages
                .filter(p => {
                    if (!p || !p.file) return false;
                    if (!p.file.name) return false;
                    if (p.file.folder !== currentPath) return false;
                    if (p.file.name === this.config.currentFileName) return false;
                    return true;
                })
                .sort((a, b) => {
                    const nameA = a?.file?.name || "";
                    const nameB = b?.file?.name || "";
                    return nameA.localeCompare(nameB);
                });

            let htmlParts = [];

            if (subFolders.length > 0) {
                htmlParts.push('<h3>📂 Подпапки</h3>');
                htmlParts.push(this.buildFolderList(subFolders, currentPath));
            }

            if (files.length > 0) {
                htmlParts.push('<h3>📄 Заметки</h3>');
                htmlParts.push(this.buildFilesTable(files));
            }

            if (subFolders.length === 0 && files.length === 0) {
                htmlParts.push('<p>В этой папке нет подпапок и заметок.</p>');
            }

            return { html: htmlParts.join('\n\n') };
        });

        const container = this.dv.el("div", cached.html);
        this.setupLinkHandlers(container, currentPath);
    }
}

await new MOCGenerator(dv, input).render();
