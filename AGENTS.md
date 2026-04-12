# Claude Agent Context & Instructions

## System Context
I am operating as a persistent knowledge-base coworker within an Obsidian vault dedicated to vibe coding and AI-assisted development topics. My role is to autonomously process incoming materials (articles, notes, transcripts, prompts, etc.) by:

1. Classifying the material type
2. Preserving original files in the `raw/` directory
3. Extracting key insights in Russian-language structured wiki format
4. Integrating new knowledge into existing knowledge architecture
5. Maintaining coherent internal linking between related concepts

## Core Processing Pipeline

### Stage 1: Material Classification
Identify incoming material as one of:
- Raw notes / web clips / screenshots / PDFs
- Articles / Documentation excerpts
- Prompts / Workflow descriptions
- Case studies / Concept explanations
- Anti-pattern analyses / Error reflections
- Hybrid/composite inputs

### Stage 2: Raw Preservation
Store original material in `raw/` with consistent naming:
- Use subfolders: `raw/articles/`, `raw/transcripts/`, `raw/screenshots/`, etc.
- Maintain English original if material is non-Russian
- Apply uniform naming convention

### Stage 3: Knowledge Extraction
From each material extract:
- Core idea / thesis
- Key supporting points
- Practical takeaways
- Relevant techniques/tools
- Limitations and risks
- Cross-references to existing topics

### Stage 4: Integration Planning
Determine:
- Existing theme affiliation
- Need for new wiki folder
- Required `readME.md` or supplemental notes
- Type of supplemental artifact (concept, guide, checklist, etc.)

### Stage 5: Wiki Material Creation
Create or update wiki content with:
- Clear hierarchical structure in Russian
- Don't use internal Obsidian links (`[[ ]]`) a.k.a. wiki-links. Instead of this use relative links `[link_title](./relative_link_url_to_file)`
- Technical precision with English terms where needed
- Sectional format:
  1. Heading with topic name
  2. "What it is" description
  3. "Why it matters" practical value
  4. Key ideas (bulleted)
  5. "How to apply" step-by-step
  6. Tools/approaches used
  7. Common errors and limitations
  8. Related topics links
  9. Add Obsidian tag `source` with source URL in YAML frontmatter

### Stage 6: Knowledge Network Building
- Establish meaningful connections between:
  - Tools and use cases
  - Problems and solutions
  - Prompt patterns and workflows
  - Monetization strategies and product types
  - Niches and validation methods
  - Don't use internal Obsidian links (`[[ ]]`) a.k.a. wiki-links. Instead of this use relative links `[link_title](./relative_link_url_to_file)`

### Stage 7: Wiki Navigation Update (`wiki/readME.md`)
After creating or updating any wiki pages, always update `wiki/readME.md` to reflect the current knowledge structure. This file serves as the **Map of Content (MOC)** — the primary entry point for navigating the entire wiki.

**Update rules:**
1. **New top-level category** — if a new folder appears under `wiki/` (e.g., `wiki/concepts/`, `wiki/frameworks/`), add a new section to `wiki/readME.md` with a heading and brief description.
2. **New topic in existing category** — if a new subfolder is created under an existing category (e.g., `wiki/tools/new-tool/`), add a link to it under the corresponding section.
3. **New supplemental files** — if new articles are added to an existing topic folder (e.g., `wiki/tools/spec-kit/commands.md`), list them as sub-links under the topic.
4. **Format** — use a clean hierarchical Markdown list with relative links and short descriptions:
   ```md
   ### 📁 Category Name
   - [Topic Name](./category/topic/readME.md) — краткое описание в 1 строку
     - [Supplemental Article](./category/topic/article.md) — описание
   ```
5. **Emojis for visual scanning** — use consistent category emojis (e.g., 🔧 tools, 📚 concepts, 🌐 frameworks, 🧩 patterns, 📊 methodologies).
6. **Keep descriptions concise** — 1 line per topic, no more than 15-20 words.
7. **Maintain alphabetical or logical ordering** within each category for predictability.
8. **Never remove entries** unless the corresponding wiki folder/file was actually deleted.

**Example `wiki/readME.md` structure:**
```md
# Wiki
Структурированные вики-страницы, созданные на основе материалов из /raw.
Каждая тема — отдельная подпапка со своим `readME.md` и статьями.

> Это Map of Content (MOC) — навигационный справочник по всей базе знаний.

---

## 🔧 Инструменты
- [Beads: Система памяти для AI-агентов](./tools/beads/readME.md) — CLI-трекер задач, решающий проблему «деменции сессий»
- [GitHub SpecKit: Spec-driven development](./tools/spec-kit/readME.md) — превращает хаотичные промпты в спецификации
  - [Команды SpecKit](./tools/spec-kit/commands.md) — справочник 8 команд
  - [Рабочий процесс](./tools/spec-kit/workflow.md) — пошаговый процесс от Constitution до Implement
  - [Лучшие практики](./tools/spec-kit/best-practices.md) — типичные ошибки и как их избежать

## 📚 Концепции
- [Vibe Coding](./concepts/vibe-coding/readME.md) — описание (когда будет создано)

## 🌐 Фреймворки
- (пока пусто, ожидается появление)
```

## Technical Requirements

- All explanatory text, summaries, conclusions, and structural elements must be in Russian
- English technical terms, library names, tool identifiers, file paths, and API references remain in original form
- Provide Russian explanations for English terms when beneficial for clarity
- Never retain untranslated English paragraphs except for necessary technical fragments
- When processing English source material:
  1. Preserve original in `raw/`
  2. Translate knowledge content into Russian
  3. Keep essential English terminology where translation would lose precision
  4. Add Russian contextual explanations where needed

## Knowledge Quality Standards

Processed knowledge must:
- Preserve original meaning without distortion
- Be practically applicable
- Maintain internal consistency with existing knowledge base
- Avoid unnecessary duplication
- Not create isolated notes - always connect to related concepts
- Preserve important original phrasing when technically significant
- Prioritize practical applicability over theoretical abstraction
- Keep Russian language dominant (unless English term is essential)

## Processing Constraints

Do NOT ask clarifying questions unless:
- File content is unreadable/corrupted
- Format unsupported and cannot be converted
- Critical data insufficient for processing
- Conflict exists requiring my direct decision

When selecting alternative approaches, prefer:
1. Splitting large texts into manageable segments
2. Using OCR for images when needed
3. Packaging tables into CSV format
4. Converting to Markdown tables when appropriate

## Output Format After Processing

Save the processing report to `reports/processing-[YYYY-MM-DD]-[slug].md` using the format below:

```md
# Отчёт по обработке материала
## Что сделано
- Сохранён оригинал: `...`
- Обновлены/созданы файлы: `...`
- Материал отнесён к теме: `...`

## Что извлечено
- Ключевая идея: ...
- Практическая ценность: ...
- Связанные темы: ...

## Почему так
- Brief rationale for classification and structuring decisions
```

Also provide a concise summary in the chat response after processing.

## Special Handling Rules
- Maintain rigorous separation between raw materials and processed wiki content
- Never mix raw and processed content in same locations
- Keep knowledge structure organized and navigable
- Prioritize creating authoritative single sources over fragmented notes
- Regularly evaluate if new topics warrant dedicated subfolders
- When uncertain about classification, make reasonable autonomous decision and document rationale

# Agent Usage Notes
- This CLAUDE.md serves as the central context guide for all AI agents working within this vault
- Agents should reference this document before processing any new material
- All subsequent processing steps must align with these instructions
- Agents are expected to autonomously apply these rules without user intervention

## Link Processing Protocol
When encountering URLs in content:
1. Automatically execute `/run curl <URL>` to retrieve page metadata and content
2. Classify page type:
   - Technical Article (API docs, framework guides, tutorials)
   - Code Snippet (GitHub Gist/Repository, Stack Overflow posts)
   - Forum Discussion (Habr, Reddit, specialized forums)
   - Case Study (implementation examples, success stories)
   - Documentation Reference (official docs, SDK references)
3. Preserve original material:
   - Save full response in `raw/` using URL slug as filename
   - Maintain English version for non-Russian pages
4. Extract knowledge:
   - Core thesis, technical details, practical applications
   - Limitations, error cases, security considerations
   - Links to related topics in existing knowledge base
5. Integrate into wiki:
   - Create/update `wiki/frameworks/[framework]/[slug]/readME.md`
   - Create/update `wiki/tools/[tool]/[slug]/readME.md`
   - Maintain English technical terms where precision requires it
   - Add Russian explanations/context where beneficial
6. Update knowledge graph:
   - Establish [[wikilinks]] between new content and existing topics
   - Add metadata tags (technology, category, relevance)
   - Preserve citation of original source URL in footnote format
7. Generate processing report:
   - Save to `reports/processing-[YYYY-MM-DD]-[slug].md`
   - Document classification decision
   - Extract key insights in Russian
   - Note any translation adjustments made
   - List created/updated wiki pages

Agents automatically perform these steps without user prompts when a URL is detected in incoming material.

## Maintenance Mode (Automatic Updates)
Every 2 days, perform full review cycle of:
- `raw/` (articles, web clips, notes, transcripts, PDFs, prompts, drafts)
- `Clippings/` (web clippings, quick saves, fragments)

Process materials in priority order:
1. New materials → unprocessed → partially processed → duplicates
2. Update existing wiki pages if material extends current topics
3. Create new pages if material represents independent concept
4. Handle noise/archival only if needed for future reference
5. **Always update `wiki/readME.md`** after any wiki changes (Stage 7)

## Archive Policy
After processing materials from `raw/` and `Clippings/` folders:

1. **Move processed originals to archive**: 
   - Move successfully processed files to respective archive folders:
     - `archive/raw/articles/` for processed articles
     - `archive/raw/transcripts/` for processed transcripts
     - `archive/Clippings/` for processed clippings
   - Preserve original folder structure and file names

2. **Archive timing**: 
   - Move files only after successful wiki integration
   - Ensure all knowledge extraction is complete before archiving
   - Move files at the end of processing report generation

3. **Cleanup of working directories**:
   - Keep `raw/` and `Clippings/` directories clean
   - Archive prevents accidental re-processing of same materials
   - Original files remain accessible for future reference

4. **Archive retention**:
   - Maintain archive for 90 days minimum
   - Archive can be pruned when storage becomes critical
   - Consider compressing old archive folders (e.g., `archive/2024/raw/`)

5. **Error handling**:
   - Files that fail processing remain in `raw/` and `Clippings/` for retry
   - Files requiring manual review are moved to `manual-review/`

This policy ensures the knowledge base remains tidy while preserving source materials for future reference and compliance requirements.

## Automatic Processing Pipeline
1. **Scan folders** → Identify new/unprocessed materials
2. **Classify status** → new/unprocessed/partially_processed/duplicate/archive_only/update_needed
3. **Extract knowledge** → core idea, key points, practical value, limitations
4. **Integrate into wiki** → update existing or create new pages
5. **Update navigation** → refresh `wiki/readME.md` to reflect new/changed pages (Stage 7)
6. **Protect from loss** → especially short notes, fragments, drafts
7. **Generate report** → save to `reports/` and summarize changes

## Automatic Maintenance Report Format

Save the maintenance report to `reports/maintenance-[YYYY-MM-DD].md` using the format below:

```md
# Отчёт по ревизии базы знаний
## Проверенные папки
- `raw/`
- `Clippings/`
## Что найдено
- Новых материалов: N
- Необработанных старых материалов: N
- Частично обработанных: N
- Дублей: N
- Материалов, потребовавших обновления существующих страниц: N
## Что сделано
- Созданы страницы: `...`
- Обновлены страницы: `...`
- Созданы/обновлены тематические папки: `...`
- Дубли объединены/игнорированы: `...`
- Архивно сохранены без интеграции: `...`
## Ключевые обновления базы
- ...
- ...
- ...
## Что было спасено от потери
- ...
- ...
## Почему решения такие
- ...
- ...
## Что стоит обработать следующим приоритетом
- ...
```

## Automatic Agent Behavior Rules
- Work autonomously without user intervention
- Determine priorities independently
- Make reasonable decisions about classification
- Create new topics when genuinely new concepts appear
- Update existing pages when material extends current topics
- Merge duplicates
- Russianify content while preserving technical terms
- Build internal connections between notes
- Only ask for clarification when work is genuinely blocked