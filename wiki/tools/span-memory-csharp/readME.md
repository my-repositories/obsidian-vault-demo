---
source: https://habr.com/ru/companies/otus/articles/708210/
tags: [csharp, performance, span, memory, optimization, dotnet]
---

# Span<T> и Memory<T>: Повышение производительности C# кода

## Что это такое

`Span<T>` и `Memory<T>` — типы данных в .NET (начиная с .NET Core 2.1 / C# 7.2), которые предоставляют **типобезопасное представление непрерывных блоков памяти**. Они позволяют работать с данными, расположенными в разных областях памяти:

- **Стек** (`stackalloc`)
- **Управляемая куча** (массивы, строки)
- **Неуправляемая память** (`Marshal.AllocHGlobal`, `Marshal.AllocCoTaskMem`)

`Memory<T>` — обычная структура, которая может жить в куче и использоваться в `async/await`.

`ReadOnlySpan<T>` и `ReadOnlyMemory<T>` — аналоги только для чтения.

## Почему это важно

Традиционные операции со строками и массивами в C# создают **новые аллокации** при каждом извлечении подстроки или срезе данных. Например, `string.Substring()` выделяет новую строку в куче, что создаёт нагрузку на GC.

`Span<T>` решает эту проблему за счёт:
- **Слайсинга без копирования** — срез лишь указывает на часть исходных данных
- **Отсутствия аллокаций** — `Span<T>` живёт на стеке (ref struct)
- **Elimination границ проверок** — компилятор оптимизирует проверки в циклах
- **Замены Array + ArraySegment** — единый универсальный API

Бенчмарки показывают ускорение **~7.5x** по сравнению с `Substring()` при **0 аллокаций Gen0**.

## Ключевые идеи

- `Span<T>` — `ref struct`, размещается **только в стеке**, нельзя использовать как поле класса
- `Memory<T>` — обычная структура, поддерживает `async/await`, `yield return`, хранение в куче
- Слайсинг: `span.Slice(start, length)` или `span[start..length]` (C# 8+ range syntax)
- Парсинг строк без аллокаций: `ReadOnlySpan<char>` вместо `string`
- Для несмежных буферов (потоки, сеть) используйте `ReadOnlySequence<T>` из `System.Buffers`
- LINQ недоступен для `Span<T>` (не реализует `IEnumerable<T>`), альтернативы: `SpanLinq`, `NetFabric.Hyperlinq`

## Как применять

### 1. Инициализация Span из стека
```csharp
Span<byte> stackSpan = stackalloc byte[100];
```

### 2. Span из массива
```csharp
int[] array = { 1, 2, 3, 4, 5 };
Span<int> span = array.AsSpan();
```

### 3. Слайсинг без копирования
```csharp
Span<int> slice = span.Slice(2, 3);  // элементы [2..5)
// или C# 8+ range syntax
Span<int> slice2 = span[2..5];
```

### 4. Парсинг строк без аллокаций
```csharp
// Вместо: string.Substring() создаёт новую строку
// Span-подход:
ReadOnlySpan<char> text = "10.5,20.3,30.1";
int commaIndex = text.IndexOf(',');
ReadOnlySpan<char> firstNumber = text.Slice(0, commaIndex);
// firstNumber — представление "10.5" без выделения новой строки
```

### 5. Извлечение подстрок из логов
```csharp
string logLine = "2023-01-15 10:30:00 INFO User logged in";
ReadOnlySpan<char> span = logLine.AsSpan();
var datePart = span.Slice(0, 10);  // "2023-01-15"
var timePart = span.Slice(11, 8);  // "10:30:00"
```

### 6. Memory<T> для async/await
```csharp
// Span нельзя передать в async-метод
// Memory можно:
public async Task ProcessAsync(Memory<byte> buffer)
{
    await Task.Delay(100);
    buffer.Span[0] = 42;  // обращение через .Span
}
```

### 7. Бенчмарк с BenchmarkDotNet
```csharp
[MemoryDiagnoser]
public class Benchmark
{
    private string _text = "a,b,c,d,e,f,g,h,i,j";

    [Benchmark]
    public string Substring() => _text.Substring(2, 10);

    [Benchmark]
    public ReadOnlySpan<char> SpanSlice() => _text.AsSpan().Slice(2, 10);
}
// Результат: SpanSlice ~7.5x быстрее, 0 B аллокаций vs Substring
```

## Инструменты и подходы

| Инструмент | Назначение |
|---|---|
| `Span<T>` / `Memory<T>` | Основная работа с памятью |
| `ReadOnlySpan<T>` / `ReadOnlyMemory<T>` | Доступ только для чтения |
| `stackalloc` | Выделение на стеке |
| `MemoryMarshal` | Низкоуровневые операции |
| `ReadOnlySequence<T>` | Несмежные буферы |
| `BenchmarkDotNet` | Замеры производительности |
| `SpanLinq` | LINQ-операции для Span |
| `NetFabric.Hyperlinq` | Альтернативный LINQ для Span |

## Ограничения и типичные ошибки

1. **`Span<T>` нельзя:**
   - Использовать как поле класса/структуры
   - Передавать в `async/await` и `yield return`
   - Подвергать boxing (`(object)span` — ошибка компиляции)
   - Приводить к `object`, `dynamic`, интерфейсам
   - Создавать массивы `Span<T>[]`
   - Использовать с LINQ (не реализует `IEnumerable<T>`)

2. **`Memory<T>` менее производителен**, чем `Span<T>`, но необходим для:
   - Асинхронных операций
   - Длительного хранения данных
   - Передачи между методами, выходящими за рамки стека

3. **Не всегда стоит оптимизировать:** если код не в hot path, обычные строки и массивы достаточно. Span — для критичных к производительности участков (парсинг, сериализация, обработка больших данных).

4. **Отладка:** `Span<T>` сложнее отлаживать в некоторых IDE из-за ограничений ref struct.

## Связанные темы

- [Управление памятью в .NET](../../frameworks/dotnet-memory-management/readME.md) *(создать при наличии материала)*
- [BenchmarkDotNet: Замеры производительности](../../tools/benchmarkdotnet/readME.md) *(создать при наличии материала)*
- [Оптимизация строк в C#](../../concepts/string-optimization-csharp/readME.md) *(связанная концепция)*
- [Unsafe-код и указатели в C#](../../concepts/unsafe-csharp/readME.md) *(связанная концепция)*
