---
source: https://habr.com/ru/articles/552278/
tags: [design-patterns, strategy, behavioral-patterns, architecture, oop]
---

# Паттерн Strategy (Стратегия)

## Что это такое

**Strategy** — поведенческий шаблон проектирования, который **выделяет семейство похожих алгоритмов**, выносит их в отдельные классы и позволяет выбирать алгоритм во время выполнения программы.

Основная идея: вместо того чтобы реализовывать множество вариантов поведения в одном «супер-классе» с кучей условных операторов, каждый алгоритм инкапсулируется в собственный класс с общим интерфейсом.

## Почему это важно

Без Strategy код быстро деградирует до «супер-класса» с множеством `if/else` или `switch`, который:
- **Трудно расширять** — каждое новое изменение затрагивает базовый класс
- **Трудно тестировать** — множество ветвлений, зависящих друг от друга
- **Создаёт конфликты** в командной разработке — несколько разработчиков правят один файл
- **Затягивает релизы** — изменения требуют долгого регрессионного тестирования

Strategy решает эти проблемы за счёт:
- **Инкапсуляции алгоритмов** — каждый в отдельном классе
- **Открытости для расширения** — новая стратегия = новый класс, без правки существующих
- **Снижения связанности** — контекст зависит только от интерфейса стратегии
- **Лёгкого тестирования** — каждая стратегия тестируется изолированно

## Ключевые идеи

### Структура паттерна

1. **Strategy (интерфейс)** — общий интерфейс для всех поддерживаемых алгоритмов
2. **ConcreteStrategyA, ConcreteStrategyB** — конкретные реализации алгоритмов
3. **Context** — класс, который использует стратегию через интерфейс, делегируя работу

### Диаграмма классов

```
┌─────────────────┐
│   <<interface>> │
│    Strategy     │
├─────────────────┤
│ + doAlgorithm() │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│ Strat │ │ Strat │
│   A   │ │   B   │
└───────┘ └───────┘
    ▲         ▲
    │         │
┌───┴─────────┴───┐
│     Context     │
├─────────────────┤
│ - strategy      │
│ + setStrategy() │
│ + execute()     │
└─────────────────┘
```

### Пример реализации (C#)

```csharp
// 1. Интерфейс стратегии
public interface ISearchStrategy
{
    List<Property> DoSearch(Dictionary<string, object> filters);
}

// 2. Конкретные стратегии
public class SaleSearchStrategy : ISearchStrategy
{
    public List<Property> DoSearch(Dictionary<string, object> filters)
    {
        // Алгоритм поиска недвижимости на продажу
        // Фильтры по цене, геолокации, площади
        return _dbContext.Properties
            .Where(p => p.Type == PropertyType.Sale)
            .ApplyFilters(filters)
            .ToList();
    }
}

public class RentalSearchStrategy : ISearchStrategy
{
    public List<Property> DoSearch(Dictionary<string, object> filters)
    {
        // Алгоритм поиска арендуемой недвижимости
        // Фильтры по состоянию, фотографиям, срокам аренды
        return _dbContext.Properties
            .Where(p => p.Type == PropertyType.Rental)
            .ApplyFilters(filters)
            .ToList();
    }
}

// 3. Контекст
public class PropertySearchContext
{
    private ISearchStrategy _strategy;

    public PropertySearchContext(ISearchStrategy strategy)
    {
        _strategy = strategy;
    }

    public void SetStrategy(ISearchStrategy strategy)
    {
        _strategy = strategy;
    }

    public List<Property> GetData(Dictionary<string, object> filters)
    {
        return _strategy.DoSearch(filters);
    }
}

// 4. Использование (клиентский код)
var context = new PropertySearchContext(new SaleSearchStrategy());
var saleResults = context.GetData(new Dictionary<string, object> { ["priceMax"] = 5000000 });

context.SetStrategy(new RentalSearchStrategy());
var rentalResults = context.GetData(new Dictionary<string, object> { ["condition"] = "excellent" });
```

## Когда применять

| Ситуация | Признак |
|---|---|
| **Множество похожих алгоритмов** | Различаются незначительным поведением, можно вынести в отдельные классы |
| **Супер-класс с условными операторами** | Множество `if/else` или `switch`, выделяемых в блоки |
| **Необходимость инкапсуляции** | Конкретные алгоритмы нужно изолировать от других классов |
| **Динамическая смена поведения** | Нужно менять стратегию во время выполнения (например, от скорости интернета) |

## Инструменты и подходы

| Инструмент | Назначение |
|---|---|
| Интерфейсы C# | Определение контракта стратегии |
| Dependency Injection | Внедрение стратегии в контекст |
| Factory Pattern | Создание стратегии по конфигурации |
| Unit Testing | Изолированное тестирование каждой стратегии |

## Ограничения и типичные ошибки

1. **Избыточность для простых случаев:** Если алгоритм отличается одной строкой кода, Strategy создаст больше проблем, чем решит. Используй `Func<>` или делегаты для лёгких вариаций.

2. **Клиент должен знать о стратегиях:** Клиентский код должен понимать, какую стратегию выбрать. Это может потребовать дополнительной логики выбора.

3. **Увеличение количества классов:** Каждая стратегия — отдельный файл. Для 10+ стратегий может стать трудно навигировать. Группируй по папкам.

4. **Не путать с State:** State меняет поведение на основе **состояния объекта**, Strategy — на основе **выбора алгоритма**. Визуально похожи, но намерение разное.

5. **Совместимость с SOLID:** Strategy напрямую реализует **OCP** (открыт для расширения) и **DIP** (зависит от абстракции). См. [SOLID принципы](../../principles/solid/readME.md).

## Связанные темы

- [SOLID: Принципы ООП-проектирования](../../principles/solid/readME.md) — OCP и DIP напрямую связаны со Strategy
- [Паттерн State](../../patterns/state-pattern/readME.md) *(создать при наличии материала)* — похожая структура, другое намерение
- [Dependency Injection](../../patterns/dependency-injection/readME.md) *(создать при наличии материала)* — внедрение стратегий
- [Factory Pattern](../../patterns/factory-pattern/readME.md) *(создать при наличии материала)* — создание стратегий
