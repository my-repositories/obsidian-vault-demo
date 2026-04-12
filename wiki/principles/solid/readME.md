---
source: https://habr.com/ru/articles/935926/
tags: [solid, oop, design-principles, architecture, yagni, kiss]
---

# SOLID: Принципы объектно-ориентированного проектирования

## Что это такое

SOLID — это акроним из пяти принципов ООП-проектирования, предложенных Робертом Мартином. Эти принципы помогают создавать код, который **легко поддерживать, тестировать и расширять** в командной разработке.

1. **SRP** — Single Responsibility Principle (единая ответственность)
2. **OCP** — Open/Closed Principle (открытость/закрытость)
3. **LSP** — Liskov Substitution Principle (подстановка Барбары Лисков)
4. **ISP** — Interface Segregation Principle (разделение интерфейсов)
5. **DIP** — Dependency Inversion Principle (инверсия зависимостей)

## Почему это важно

Без SOLID код быстро превращается в «спагетти»: классы делают всё сразу, изменения ломают существующую логику, а тестирование невозможно без моков всего мира.

Применение SOLID даёт:
- **Снижение связанности** — изменения в одном месте минимально затрагивают другие
- **Расширяемость** — новый функционал добавляется без правки ядра
- **Тестируемость** — зависимостей легко мокать через интерфейсы
- **Читаемость** — ответственность классов понятна из первого взгляда

⚠️ **Важно:** SOLID — это не догма. Фанатичное следование принципам вредит проектам. Необходим баланс с **YAGNI** (You Aren't Gonna Need It) и **KISS** (Keep It Simple, Stupid).

## Ключевые идеи

### S — SRP (Single Responsibility Principle)

**Определение:** Один класс должен иметь **одну и только одну причину для изменения**.

**Как применять:**
- Сформулируй ответственность класса в одном предложении
- Если не получается — раздели класс на несколько
- Разделяй работу с данными и бизнес-логику, бизнес-логику и инфраструктуру

**Пример:**
```csharp
// ❌ Нарушение SRP: User делает и данные, и отправку писем
class User
{
    public string Name { get; set; }
    public string Email { get; set; }
    public void SaveToDatabase() { /* ... */ }
    public void SendEmail() { /* ... */ }
}

// ✅ SRP: Разделение ответственности
class User
{
    public string Name { get; set; }
    public string Email { get; set; }
}

class UserRepository { public void Save(User user) { /* ... */ } }

class EmailService { public void Send(User user) { /* ... */ } }
```

### O — OCP (Open/Closed Principle)

**Определение:** Модули должны быть **открыты для расширения, но закрыты для изменения**.

**Как применять:**
- Используй полиморфизм: базовые классы/интерфейсы + конкретные реализации
- Применяй Dependency Injection для подмены реализаций
- Используй делегаты и события для расширяемости

**Пример:**
```csharp
// ❌ Нарушение OCP: правим базовый класс для каждого нового формата
class Report
{
    public void Generate(string format)
    {
        if (format == "PDF") { /* ... */ }
        else if (format == "Excel") { /* ... */ }
        // Новый формат = правка существующего кода
    }
}

// ✅ OCP: расширение через наследование
abstract class Report
{
    public abstract void Generate();
}

class PDFReport : Report { public override void Generate() { /* ... */ } }
class ExcelReport : Report { public override void Generate() { /* ... */ } }
```

### L — LSP (Liskov Substitution Principle)

**Определение:** Объекты родительского класса должны заменяться объектами дочернего класса **без нарушения корректности программы**.

**Как применять:**
- Наследник не должен ослаблять предусловия
- Наследник не должен усиливать постусловия
- Наследник должен сохранять инварианты родителя
- Покрывай наследников тестами родительского контракта

**Пример:**
```csharp
// ❌ Нарушение LSP: Penguin не может летать
class Bird
{
    public virtual void Fly() { /* ... */ }
}

class Penguin : Bird
{
    public override void Fly()
        => throw new NotSupportedException("Penguins can't fly!");
}

// ✅ LSP: Разделение контрактов
class Bird { /* базовое поведение */ }
interface IFlyable { void Fly(); }

class Sparrow : Bird, IFlyable { public void Fly() { /* ... */ } }
class Penguin : Bird { /* нет Fly — нет нарушения */ }
```

### I — ISP (Interface Segregation Principle)

**Определение:** Много **специализированных** интерфейсов лучше, чем один универсальный.

**Как применять:**
- Разделяй большие интерфейсы по логике использования
- Класс не должен реализовывать методы, которые ему не нужны
- Группируй методы, которые всегда вызываются вместе

**Пример:**
```csharp
// ❌ Нарушение ISP: IMegaPrinter со всеми методами
interface IMegaPrinter
{
    void Print();
    void Scan();
    void Fax();
}

class SimplePrinter : IMegaPrinter
{
    public void Print() { /* ... */ }
    public void Scan() => throw new NotSupportedException();  // Не нужен!
    public void Fax() => throw new NotSupportedException();   // Не нужен!
}

// ✅ ISP: Разделение интерфейсов
interface IPrinter { void Print(); }
interface IScanner { void Scan(); }
interface IFax { void Fax(); }

class SimplePrinter : IPrinter { public void Print() { /* ... */ } }
class MultiDevice : IPrinter, IScanner, IFax { /* ... */ }
```

### D — DIP (Dependency Inversion Principle)

**Определение:** Модули верхнего уровня не должны зависеть от модулей нижнего уровня. Оба должны зависеть от **абстракций**.

**Как применять:**
- Зависим от интерфейсов, не от конкретных классов
- Используй Dependency Injection (через конструктор, свойство, метод)
- Применяй паттерны Strategy, State для подмены поведения
- Передавай лямбды и делегаты для лёгкой кастомизации

**Пример:**
```csharp
// ❌ Нарушение DIP: OrderService зависит от конкретной реализации
class OrderService
{
    private PayPalPayment _payment = new PayPalPayment();
    public void ProcessOrder(Order order)
    {
        _payment.Charge(order.Total);
    }
}

// ✅ DIP: Зависимость от абстракции
interface IPaymentProcessor
{
    void Charge(decimal amount);
}

class OrderService
{
    private readonly IPaymentProcessor _payment;
    public OrderService(IPaymentProcessor payment)
    {
        _payment = payment;  // DI через конструктор
    }
    public void ProcessOrder(Order order)
    {
        _payment.Charge(order.Total);
    }
}

// Использование:
var service = new OrderService(new StripePayment());
// или
var service = new OrderService(new PayPalPayment());
```

## Инструменты и подходы

| Инструмент | Назначение |
|---|---|
| Dependency Injection | Внедрение зависимостей |
| Паттерн Strategy | Подмена поведения |
| Паттерн State | Управление состоянием |
| Делегаты и лямбды | Лёгкая кастомизация |
| Code Review | Контроль соблюдения принципов |
| Юнит-тесты | Проверка контрактов наследников |
| Профилирование | Оценка накладных расходов |

## Ограничения и типичные ошибки

1. **Избыточность архитектуры:** Множество мелких классов и интерфейсов превращает код в «лего», затрудняя навигацию и понимание. Не создавай абстракции ради абстракций.

2. **Преждевременная оптимизация:** Создание абстракций «на будущее» нарушает **YAGNI+KISS** и ведёт к переусложнению. Сначала — реальная потребность, потом — абстракция.

3. **Падение производительности:** Цепочки вызовов через интерфейсы и DI создают накладные расходы. Это критично для:
   - High-load систем
   - GameDev
   - Обработки данных в реальном времени

4. **Конфликт с бизнес-логикой:** Жёсткое требование LSP иногда несовместимо с реальными сценариями (пример: `Penguin` → `Bird` с методом `fly()`).

5. **Неприменимость для MVP:** SOLID вредит при разработке прототипов и маленьких проектов, где **скорость важнее архитектуры**.

6. **Парадокс SRP:** Что считается «одной ответственностью»? Разные команды трактуют по-разному. Формулируй ответственность чётко и согласовывай с командой.

## Связанные темы

- [YAGNI и KISS: Принципы простоты](../../concepts/yagni-kiss/readME.md) *(создать при наличии материала)*
- [Паттерн Dependency Injection](../../patterns/dependency-injection/readME.md) *(создать при наличии материала)*
- [Паттерн Strategy](../../patterns/strategy-pattern/readME.md) *(создать при наличии материала)*
- [Юнит-тестирование контрактов](../../methodologies/unit-testing-contracts/readME.md) *(создать при наличии материала)*
- [Профилирование производительности](../../tools/profiling/readME.md) *(создать при наличии материала)*
