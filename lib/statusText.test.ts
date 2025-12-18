/**
 * Тесты для модуля statusText
 * Проверяет логику определения статуса оплаты по тексту.
 */

import { describe, it, expect } from '@jest/globals';
import { isPaidStatus, normalizeStatusText } from './statusText';

describe('normalizeStatusText', () => {
  it('должен обрезать пробелы', () => {
    expect(normalizeStatusText('  текст  ')).toBe('текст');
  });

  it('должен возвращать пустую строку для null/undefined', () => {
    expect(normalizeStatusText(null)).toBe('');
    expect(normalizeStatusText(undefined)).toBe('');
  });

  it('должен преобразовывать числа в строки', () => {
    expect(normalizeStatusText(123 as unknown as string)).toBe('123');
  });
});

describe('isPaidStatus', () => {
  describe('статусы считающиеся оплаченными', () => {
    it('статус "Получено, оплачено ✅" → оплачено', () => {
      expect(isPaidStatus('Получено, оплачено ✅')).toBe(true);
    });

    it('статус "Оплачено" → оплачено', () => {
      expect(isPaidStatus('Оплачено')).toBe(true);
    });

    it('статус "оплачено ранее" (любой регистр) → оплачено', () => {
      expect(isPaidStatus('Оплачено ранее')).toBe(true);
      expect(isPaidStatus('ОПЛАЧЕНО РАНЕЕ')).toBe(true);
    });

    // Обратная совместимость: старые кодовые статусы
    it('код "receivedPaid" → оплачено', () => {
      expect(isPaidStatus('receivedPaid')).toBe(true);
    });

    it('код "received" → оплачено', () => {
      expect(isPaidStatus('received')).toBe(true);
    });
  });

  describe('статусы считающиеся НЕ оплаченными', () => {
    it('статус "Получено, не оплачено 📦" → не оплачено', () => {
      expect(isPaidStatus('Получено, не оплачено 📦')).toBe(false);
    });

    it('статус "не оплачено" (любой регистр) → не оплачено', () => {
      expect(isPaidStatus('Не оплачено')).toBe(false);
      expect(isPaidStatus('НЕ ОПЛАЧЕНО')).toBe(false);
    });

    it('частичная оплата (есть "оплач" и "част") → не оплачено', () => {
      expect(isPaidStatus('Оплачен частично')).toBe(false);
      expect(isPaidStatus('Оплачено частично 🌓')).toBe(false);
      expect(isPaidStatus('Частично оплачен')).toBe(false);
      expect(isPaidStatus('Частично оплачено')).toBe(false);
      expect(isPaidStatus('частичная оплата')).toBe(false);
    });

    it('статус без слова "оплачен" → не оплачено', () => {
      expect(isPaidStatus('В производстве 🛠️')).toBe(false);
      expect(isPaidStatus('В пути 🚚')).toBe(false);
      expect(isPaidStatus('Готово, ожидает отправки 🕒')).toBe(false);
      expect(isPaidStatus('В работе 🧵')).toBe(false);
    });

    // Обратная совместимость: старые кодовые статусы
    it('код "received_unpaid" → не оплачено', () => {
      expect(isPaidStatus('received_unpaid')).toBe(false);
    });

    it('код "inProgress" → не оплачено', () => {
      expect(isPaidStatus('inProgress')).toBe(false);
    });

    it('код "inTransit" → не оплачено', () => {
      expect(isPaidStatus('inTransit')).toBe(false);
    });

    it('код "ready" → не оплачено', () => {
      expect(isPaidStatus('ready')).toBe(false);
    });

    it('код "done" → не оплачено', () => {
      expect(isPaidStatus('done')).toBe(false);
    });
  });

  describe('граничные случаи', () => {
    it('пустая строка → не оплачено', () => {
      expect(isPaidStatus('')).toBe(false);
    });

    it('null/undefined → не оплачено', () => {
      expect(isPaidStatus(null)).toBe(false);
      expect(isPaidStatus(undefined)).toBe(false);
    });

    it('неизвестный статус без "оплачен" → не оплачено', () => {
      expect(isPaidStatus('Какой-то новый статус')).toBe(false);
    });
  });
});

