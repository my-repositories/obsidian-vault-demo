/**
 * Obsidian Task Mover v1.0.0
 * Автоматически перемещает задачи между секциями при клике на чекбокс.
 * Предназначено для использования через DataviewJS: dv.view("Scripts/KANBAN")
 */

// Символ для регистрации в глобальном пространстве
const symbol = Symbol.for('obsidian-task-mover-engine');


// Если слушатель уже в памяти, просто выходим без лишних логов
if (window[symbol]) {
console.log('kek');
    return; 
}

const SETTINGS = {
    // Порядок перемещения: заголовок секции -> в какую секцию нести и какой статус ставить
    flow: [
        { from: "TO DO", to: "IN PROGRESS", status: "[/]" },
        { from: "IN PROGRESS", to: "DONE", status: "[x]" }
    ],
    // Задержка перед обновлением интерфейса (мс)
    refreshDelay: 50,
    symbol
};

/**
 * Очистка текста для сопоставления DOM-элемента со строкой в Markdown файле.
 */
const getSearchableText = (text) => {
    return text.replace(/[^\p{L}\p{N}]/gu, '').substring(0, 50);
};

/**
 * Основной обработчик клика.
 */
const handleTaskClick = async (event) => {
    const target = event.target;
    
    // Проверяем, что клик именно по чекбоксу задачи
    if (!target.classList.contains('task-list-item-checkbox')) return;

    // Блокируем стандартное поведение Obsidian, чтобы избежать конфликтов при записи файла
    event.preventDefault();
    event.stopImmediatePropagation();

    const li = target.closest('li');
    if (!li) return;

    const taskSearchText = getSearchableText(li.innerText);
    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) return;

    // 1. Поиск заголовка секции в DOM (Reading Mode / Live Preview)
    let currentHeader = "";
    let container = li.closest('.el-ul, .cm-content');
    let prevElement = container ? (container.previousElementSibling || container) : null;

    while (prevElement) {
        const headerAttr = prevElement.getAttribute('data-heading') || 
                           prevElement.querySelector('[data-heading]')?.getAttribute('data-heading');
        if (headerAttr) {
            currentHeader = headerAttr.toUpperCase();
            break;
        }
        prevElement = prevElement.previousElementSibling;
    }

    // 2. Определение правила перемещения
    const rule = SETTINGS.flow.find(f => currentHeader.includes(f.from.toUpperCase()));
    if (!rule) return;

    // 3. Чтение и модификация файла
    const content = await app.vault.read(activeFile);
    let lines = content.split('\n');

    // Ищем индекс строки в файле
    const lineIdx = lines.findIndex(line => {
        return line.trim().startsWith('- [') && getSearchableText(line).includes(taskSearchText);
    });

    if (lineIdx === -1) {
        console.warn(`[TaskMover] Строка не найдена в файле: ${taskSearchText}`);
        return;
    }

    // Извлекаем строку и меняем ей статус
    let [taskLine] = lines.splice(lineIdx, 1);
    const updatedLine = taskLine.replace(/\[.\]/, rule.status);

    // Ищем целевой заголовок
    const targetHeaderIdx = lines.findIndex(l => l.startsWith('##') && l.toUpperCase().includes(rule.to.toUpperCase()));

    if (targetHeaderIdx !== -1) {
        // Вставляем сразу под заголовок
        lines.splice(targetHeaderIdx + 1, 0, updatedLine);
        
        // Сохраняем файл
        await app.vault.modify(activeFile, lines.join('\n'));

        // 4. Принудительное обновление интерфейса
        setTimeout(async () => {
            const leaf = app.workspace.getMostRecentLeaf();
            if (leaf) {
                const state = leaf.getViewState();
                await leaf.setViewState({ type: "empty" }, { group: leaf.group });
                await leaf.setViewState(state, { focus: true });
            }
        }, SETTINGS.refreshDelay);
        
        console.log(`[TaskMover] ✅ Задача перемещена в "${rule.to}"`);
    } else {
        console.error(`[TaskMover] ❌ Целевая секция "${rule.to}" не найдена в файле.`);
    }
};

// --- Инициализация ---

// Удаляем старый слушатель, если он был зарегистрирован ранее
if (window[SETTINGS.symbol]) {
    document.removeEventListener('click', window[SETTINGS.symbol], true);
}

// Регистрируем новый слушатель
window[SETTINGS.symbol] = handleTaskClick;
document.addEventListener('click', window[SETTINGS.symbol], true);

console.log("🚀 Task Mover Engine v1.0.0 Loaded");
