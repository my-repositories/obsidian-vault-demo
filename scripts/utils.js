/**
 * Общие утилиты для скриптов Obsidian
 * Подключаются через require() в других скриптах
 */

/* ==================== Кэширование ==================== */

class CacheManager {
    static LOCALSTORAGE_LIMIT = 5 * 1024 * 1024; // 5 МБ в байтах
    static CLEANUP_THRESHOLD = 0.8; // Начинать очистку при 80% заполненности
    static EXPIRED_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 часа

    /**
     * Получает общий размер данных в localStorage в байтах
     * @private
     */
    static _getLocalStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += key.length * 2; // UTF-16: 2 байта на символ
                total += localStorage[key].length * 2;
            }
        }
        return total;
    }

    /**
     * Проверяет, является ли ключ кэшем
     * @private
     */
    static _isCacheKey(key) {
        return key && key.startsWith('cache_');
    }

    /**
     * Очищает все просроченные кэши
     * @private
     */
    static _clearExpiredCaches() {
        const now = Date.now();
        const keysToRemove = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (this._isCacheKey(key)) {
                const item = this._loadRaw(key);
                if (!item || !item.timestamp) {
                    keysToRemove.push(key);
                } else {
                    const age = now - item.timestamp;
                    if (age > this.EXPIRED_CACHE_TTL) {
                        keysToRemove.push(key);
                    }
                }
            }
        }

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log(`[CacheManager] Удалён просроченный кэш: ${key}`);
        });

        return keysToRemove.length;
    }

    /**
     * Очищает самые старые кэши для освобождения места
     * @private
     */
    static _clearOldestCaches() {
        const caches = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (this._isCacheKey(key)) {
                const item = this._loadRaw(key);
                if (!item || !item.timestamp) {
                    localStorage.removeItem(key);
                } else {
                    caches.push({ key, timestamp: item.timestamp });
                }
            }
        }

        // Сортируем по времени (самые старые первые)
        caches.sort((a, b) => a.timestamp - b.timestamp);

        // Удаляем половину самых старых кэшей
        const toRemove = caches.slice(0, Math.ceil(caches.length / 2));
        toRemove.forEach(({ key }) => {
            localStorage.removeItem(key);
            console.log(`[CacheManager] Удалён старый кэш для освобождения места: ${key}`);
        });

        return toRemove.length;
    }

    /**
     * Проверяет и очищает localStorage при необходимости
     * @private
     */
    static _ensureLocalStorageSpace() {
        const currentSize = this._getLocalStorageSize();
        const threshold = this.LOCALSTORAGE_LIMIT * this.CLEANUP_THRESHOLD;

        if (currentSize >= threshold) {
            console.warn(`[CacheManager] localStorage заполнен: ${(currentSize / 1024).toFixed(1)} КБ`);

            // Сначала удаляем просроченные кэши
            const expiredCount = this._clearExpiredCaches();

            // Проверяем, освободилось ли место
            const newSize = this._getLocalStorageSize();
            if (newSize >= threshold) {
                // Если нет, удаляем самые старые кэши
                const oldCount = this._clearOldestCaches();
                console.log(`[CacheManager] Очищено кэшей: ${expiredCount} просроченных, ${oldCount} старых`);
            } else {
                console.log(`[CacheManager] Очищено просроченных кэшей: ${expiredCount}`);
            }
        }
    }

    /**
     * Пытается загрузить кэш с проверкой TTL
     * @private
     */
    static _tryLoad(key, durationMinutes) {
        if (durationMinutes <= 0) {
            return null;
        }

        const cached = this._loadRaw(key);
        if (!cached || !cached.timestamp) {
            return null;
        }

        const elapsed = Date.now() - cached.timestamp;
        if (elapsed >= durationMinutes * 60 * 1000) {
            return null;
        }

        return cached;
    }

    /**
     * Сохраняет данные в кэш с автоматической очисткой места (публичный API)
     */
    static _save(key, data) {
        try {
            // Перед сохранением проверяем место
            this._ensureLocalStorageSpace();

            const serialized = JSON.stringify(data);
            localStorage.setItem(key, serialized);
        } catch (e) {
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                console.error('[CacheManager] localStorage переполнен! Выполняется экстренная очистка...');

                // Экстренная очистка - удаляем все кэши
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (this._isCacheKey(key)) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));

                // Пробуем сохранить ещё раз
                try {
                    localStorage.setItem(key, JSON.stringify(data));
                    console.log(`[CacheManager] Данные сохранены после экстренной очистки: ${key}`);
                } catch (e2) {
                    console.error('[CacheManager] Не удалось сохранить данные даже после очистки:', e2);
                }
            } else {
                console.warn('[CacheManager] Не удалось сохранить кэш:', e);
            }
        }
    }

    /**
     * Загружает данные из кэша (публичный API)
     */
    static _loadRaw(key, defaultValue = null) {
        try {
            const cached = localStorage.getItem(key);
            if (cached) {
                return JSON.parse(cached);
            }
            return defaultValue;
        } catch (e) {
            console.warn(`[CacheManager] Не удалось прочитать кэш с ключом "${key}":`, e);
            return null;
        }
    }

    /**
     * Загружает из кэша или создаёт данные через factory.
     * @param {string} cacheKey - ключ кэша
     * @param {number} cacheDuration - время жизни в минутах
     * @param {Function} factory - асинхронная функция, возвращает объект
     * @returns {Promise<any>} данные из кэша или созданные factory
     */
    static async getOrCreate(cacheKey, cacheDuration, factory) {
        const cached = this._tryLoad(cacheKey, cacheDuration);
        if (cached) {
            return cached.data;
        }

        const data = await factory();
        if (cacheDuration > 0) {
            this._save(cacheKey, { timestamp: Date.now(), data });
        }
        return data;
    }
}

/* ==================== Утилиты ==================== */

function formatDate(value, withTime = true) {
    if (!value) {
        return '—';
    }
    
    if (value.toFormat) {
        return value.toFormat("dd.MM.yyyy" + (withTime ? " HH:mm" : ""));
    }

    if (value instanceof Date) {
        const d = value;
        const pad = n => String(n).padStart(2, '0');
        return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}` + (withTime ? ` ${pad(d.getHours())}:${pad(d.getMinutes())}` : "");
    }

    return String(value);
}

function getVaultSearchUrl(tag) {
    const vaultName = encodeURIComponent(app.vault.getName());
    const cleanTag = tag.replace('#', '');
    return `obsidian://search?vault=${vaultName}&query=tag%3A%23${encodeURIComponent(cleanTag)}`;
}

/**
 * Дедуплицирует параллельные async-вызовы по ключу.
 * Хранит промисы в window под Symbol — переживает require cache reset.
 * Автоматически удаляет промис из хранилища после выполнения.
 */
function createPending(storeKey, key, fn) {
    const sym = Symbol.for(`pending_${storeKey}`);
    if (!window[sym]) window[sym] = {};
    const store = window[sym];

    if (key in store) return store[key];

    const promise = (async () => {
        try { return await fn(); }
        finally { delete store[key]; }
    })();

    store[key] = promise;
    return promise;
}

// CommonJS экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatDate,
        getVaultSearchUrl,
        createPending,
        getOrCreateCache: CacheManager.getOrCreate.bind(CacheManager),
    };
}
