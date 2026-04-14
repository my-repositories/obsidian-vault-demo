/**
 * Общие утилиты для скриптов Obsidian
 * Подключаются через require() в других скриптах
 */

/* ==================== Кэширование ==================== */

function _saveCache(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.warn("Не удалось сохранить кэш:", e);
    }
}

function _loadCache(key) {
    try {
        const cached = localStorage.getItem(key);
        if (cached) {
            console.log(`[Utils] Загружено из кэша: ${key}`);
            return JSON.parse(cached);
        }
        return null;
    } catch (e) {
        console.warn("Не удалось загрузить кэш:", e);
        return null;
    }
}

/**
 * Загружает из кэша или создаёт данные через factory.
 * @param {string} cacheKey - ключ кэша
 * @param {number} cacheDuration - время жизни в минутах
 * @param {Function} factory - асинхронная функция, возвращает объект
 */
async function getOrCreateCache(cacheKey, cacheDuration, factory) {
    const cached = _tryLoadCache(cacheKey, cacheDuration);
    if (cached) {
        return cached.data;
    }

    const data = await factory();
    if (cacheDuration > 0) {
        _saveCache(cacheKey, { timestamp: Date.now(), data });
    }
    return data;
}

function _tryLoadCache(cacheKey, durationMinutes) {
    if (durationMinutes <= 0) {
        return null;
    }

    const cached = _loadCache(cacheKey);
    if (!cached || !cached.timestamp) {
        return null;
    }

    const elapsed = Date.now() - cached.timestamp;
    if (elapsed >= durationMinutes * 60 * 1000) {
        return null;
    }

    return cached;
}

/* ==================== Утилиты ==================== */

function formatDate(value) {
    if (!value) {
        return '—';
    }
    
    if (value.toFormat) {
        return value.toFormat("dd.MM.yyyy HH:mm");
    }

    if (value instanceof Date) {
        const d = value;
        const pad = n => String(n).padStart(2, '0');
        return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    return String(value);
}

function getVaultSearchUrl(tag) {
    const vaultName = encodeURIComponent(app.vault.getName());
    const cleanTag = tag.replace('#', '');
    return `obsidian://search?vault=${vaultName}&query=tag%3A%23${encodeURIComponent(cleanTag)}`;
}

// CommonJS экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getOrCreateCache,
        formatDate,
        getVaultSearchUrl
    };
}
