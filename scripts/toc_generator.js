class TOCGenerator {
    constructor(dv, params = {}) {
        this.dv = dv;
        this.app = dv.app;
        this.config = {
            minLevel: params.minLevel || 2,
            maxLevel: params.maxLevel || 6,
            numbered: params.numbered !== true,
            title: params.title || "Содержание",
            collapsed: params.collapsed ?? false,
            className: "custom-toc-active",
            exclude: params.exclude || "",
            ...params
        };

        this.counters = Array(7).fill(0);
        this.prevLevel = 0;
    }

    async ensureYamlClass(file) {
        const cache = this.app.metadataCache.getFileCache(file);
        const currentClasses = cache?.frontmatter?.cssclasses || [];
        const classesArray = Array.isArray(currentClasses) ? currentClasses : currentClasses.split(' ').filter(c => c);

        if (!classesArray.includes(this.config.className)) {
            await this.app.fileManager.processFrontMatter(file, (fm) => {
                let classes = fm.cssclasses || [];
                if (typeof classes === 'string') classes = classes.split(' ').filter(c => c);
                if (!classes.includes(this.config.className)) {
                    classes.push(this.config.className);
                    fm.cssclasses = classes;
                }
            });
        }
    }

    generateHash(headings) {
        return `${this.config.numbered}-${this.config.exclude}-${headings.map(h => h.heading + h.level).join('|')}`;
    }

    getNumbering(level) {
        if (level < this.prevLevel) this.counters.fill(0, level);
        this.counters[level - 1]++;
        this.prevLevel = level;
        return this.counters.slice(this.config.minLevel - 1, level).join(".") + ".";
    }

    async scrollToHeading(h, filePath) {
        const file = this.app.vault.getAbstractFileByPath(filePath);
        if (!file) return;

        const leaf = this.app.workspace.getLeaf(false);
        await leaf.openFile(file);
        const view = leaf.view;

        if (view.setEphemeralState) {
            view.setEphemeralState({ mode: "source" });
        }

        if (view.editor) {
            const cache = this.app.metadataCache.getFileCache(file);
            const heading = cache?.headings?.find(ch => ch.heading === h.heading);
            if (heading && heading.position?.start?.line !== undefined) {
                const line = heading.position.start.line;
                view.editor.setCursor(line, 0);
                view.editor.scrollIntoView({ from: { line, ch: 0 }, to: { line, ch: 0 } }, true);
            }
        }
    }

    renderContent(headings, filePath) {
        this.counters.fill(0);
        this.prevLevel = 0;

        const containerId = `toc-${filePath.replace(/[^a-z0-9]/gi, '-')}`;
        let container = document.getElementById(containerId);

        if (!container) {
            container = this.dv.el("details", "", { cls: "toc-details", attr: { id: containerId } });
        } else {
            container.innerHTML = '';
        }

        container.dataset.hash = this.generateHash(headings);
        if (!this.config.collapsed) container.setAttribute("open", "");

        container.createEl("summary", { text: `📍 ${this.config.title}`, cls: "toc-summary" });
        const content = container.createDiv({ cls: "toc-content" });

        headings.forEach(h => {
            const item = content.createDiv({ cls: "toc-item" });
            item.style.paddingLeft = `${(h.level - this.config.minLevel) * 20}px`;

            if (this.config.numbered) {
                item.createEl("span", { text: this.getNumbering(h.level), cls: "toc-num" });
            }

            const link = item.createEl("a", {
                text: h.heading,
                cls: "toc-lnk internal-link",
                attr: { href: `#${h.heading}` }
            });

            link.addEventListener("click", (e) => {
                e.preventDefault();
                this.scrollToHeading(h, filePath);
            });
        });
    }

    async render() {
        const filePath = this.dv.current().file.path;
        const file = this.app.vault.getAbstractFileByPath(filePath);
        const cache = this.app.metadataCache.getFileCache(file);

        let headings = (cache?.headings || []).filter(h =>
            h.level >= this.config.minLevel &&
            h.level <= this.config.maxLevel
        );

        if (this.config.exclude) {
            headings = headings.filter(h => !h.heading.includes(this.config.exclude));
        }

        if (headings.length === 0) return;

        await this.ensureYamlClass(file);
        this.renderContent(headings, filePath);
    }
}

await new TOCGenerator(dv, input).render();
