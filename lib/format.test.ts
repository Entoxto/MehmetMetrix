/**
 * Тесты для форматирования и маппинга статусов
 * Рефактор: логика вынесена в derive/format, компоненты унифицированы.
 */

import { describe, it, expect } from '@jest/globals';
import { statusIcon, statusLabel } from './format';
import { PositionStatus } from '@/types/domain';

describe('statusIcon', () => {
  it('должен содержать иконку для каждого статуса', () => {
    expect(statusIcon[PositionStatus.waitingForMaterial]).toBe('🧵');
    expect(statusIcon[PositionStatus.inProduction]).toBe('🛠️');
    expect(statusIcon[PositionStatus.inTransit]).toBe('🚚');
    expect(statusIcon[PositionStatus.receivedUnpaid]).toBe('📦');
    expect(statusIcon[PositionStatus.done]).toBe('🕒');
    expect(statusIcon[PositionStatus.paid]).toBe('💵');
    expect(statusIcon[PositionStatus.paidEarlier]).toBe('☑️');
    expect(statusIcon[PositionStatus.receivedPaid]).toBe('✅');
    expect(statusIcon[PositionStatus.returned]).toBe('♻️');
  });

  it('должен содержать все статусы из enum', () => {
    const allStatuses = Object.values(PositionStatus);
    for (const status of allStatuses) {
      expect(statusIcon[status]).toBeDefined();
      expect(typeof statusIcon[status]).toBe('string');
      expect(statusIcon[status].length).toBeGreaterThan(0);
    }
  });
});

describe('statusLabel', () => {
  it('должен содержать подпись для каждого статуса', () => {
    expect(statusLabel[PositionStatus.waitingForMaterial]).toBe('Ожидаем материал');
    expect(statusLabel[PositionStatus.inProduction]).toBe('В производстве');
    expect(statusLabel[PositionStatus.inTransit]).toBe('В пути');
    expect(statusLabel[PositionStatus.receivedUnpaid]).toBe('Получено, не оплачено');
    expect(statusLabel[PositionStatus.done]).toBe('Готово, ожидает отправки');
    expect(statusLabel[PositionStatus.paid]).toBe('Оплачено');
    expect(statusLabel[PositionStatus.paidEarlier]).toBe('Оплачено ранее');
    expect(statusLabel[PositionStatus.receivedPaid]).toBe('Получено, оплачено');
    expect(statusLabel[PositionStatus.returned]).toBe('Вернулось после ремонта');
  });

  it('должен содержать все статусы из enum', () => {
    const allStatuses = Object.values(PositionStatus);
    for (const status of allStatuses) {
      expect(statusLabel[status]).toBeDefined();
      expect(typeof statusLabel[status]).toBe('string');
      expect(statusLabel[status].length).toBeGreaterThan(0);
    }
  });
});

