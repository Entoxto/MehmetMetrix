/**
 * Тесты для форматирования и функций работы со статусами.
 *
 * Статусы — текст из Excel (1 в 1). Функции getStatusIcon и getStatusLabel
 * работают с текстовыми статусами и поддерживают обратную совместимость
 * со старыми кодовыми статусами.
 */

import { describe, it, expect } from 'vitest';
import { getStatusIcon, getStatusLabel } from './format';

describe('getStatusIcon', () => {
  it('должен возвращать правильные иконки для текстовых статусов', () => {
    expect(getStatusIcon('В пути 🚚')).toBe('🚚');
    expect(getStatusIcon('Готово, ожидает отправки 🕒')).toBe('🕒');
    expect(getStatusIcon('Получено, не оплачено 📦')).toBe('📦');
    expect(getStatusIcon('Получено, оплачено ✅')).toBe('✅');
    expect(getStatusIcon('В производстве 🛠️')).toBe('🛠️');
    expect(getStatusIcon('В работе 🧵')).toBe('🛠️');
  });

  it('должен возвращать иконки для старых кодовых статусов', () => {
    expect(getStatusIcon('inTransit')).toBe('🚚');
    expect(getStatusIcon('done')).toBe('🕒');
    expect(getStatusIcon('receivedUnpaid')).toBe('📦');
    expect(getStatusIcon('receivedPaid')).toBe('✅');
    expect(getStatusIcon('inProgress')).toBe('🛠️');
  });

  it('должен возвращать fallback-иконку для неизвестных статусов', () => {
    expect(getStatusIcon('Какой-то новый статус')).toBe('🧵');
    expect(getStatusIcon(null)).toBe('🧵');
    expect(getStatusIcon(undefined)).toBe('🧵');
  });
});

describe('getStatusLabel (text-based)', () => {
  it('должен возвращать текст как есть из Excel (1 в 1)', () => {
    expect(getStatusLabel('Получено, оплачено ✅')).toBe('Получено, оплачено ✅');
    expect(getStatusLabel('В пути 🚚')).toBe('В пути 🚚');
    expect(getStatusLabel('В производстве 🛠️')).toBe('В производстве 🛠️');
    expect(getStatusLabel('Получено, не оплачено 📦')).toBe('Получено, не оплачено 📦');
  });

  it('должен преобразовывать старые кодовые статусы в читаемый вид с эмодзи', () => {
    expect(getStatusLabel('inProgress')).toBe('В работе 🧵');
    expect(getStatusLabel('done')).toBe('Готово, ожидает отправки 🕒');
    expect(getStatusLabel('inTransit')).toBe('В пути 🚚');
    expect(getStatusLabel('receivedUnpaid')).toBe('Получено, не оплачено 📦');
    expect(getStatusLabel('receivedPaid')).toBe('Получено, оплачено ✅');
    expect(getStatusLabel('received')).toBe('Получено, оплачено ✅');
    expect(getStatusLabel('in_progress')).toBe('В производстве 🛠️');
    expect(getStatusLabel('received_unpaid')).toBe('Получено, не оплачено 📦');
  });

  it('должен возвращать "Неизвестный статус" для пустых значений', () => {
    expect(getStatusLabel('')).toBe('Неизвестный статус');
    expect(getStatusLabel(null)).toBe('Неизвестный статус');
    expect(getStatusLabel(undefined)).toBe('Неизвестный статус');
  });
});
