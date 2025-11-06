/**
 * Тесты для форматирования и маппинга статусов
 * Рефактор: логика вынесена в derive/format, компоненты унифицированы.
 */

import { describe, it, expect } from '@jest/globals';
import { statusIcon, statusLabel } from './format';
import { PositionStatus } from '@/types/domain';

describe('statusIcon', () => {
  it('должен содержать иконку для каждого статуса', () => {
    expect(statusIcon[PositionStatus.inProduction]).toBe('🛠️');
    expect(statusIcon[PositionStatus.inTransit]).toBe('🚚');
    expect(statusIcon[PositionStatus.done]).toBe('✅');
    expect(statusIcon[PositionStatus.paid]).toBe('💵');
    expect(statusIcon[PositionStatus.paidEarlier]).toBe('☑️');
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
    expect(statusLabel[PositionStatus.inProduction]).toBe('в производстве');
    expect(statusLabel[PositionStatus.inTransit]).toBe('уже в пути');
    expect(statusLabel[PositionStatus.done]).toBe('готов');
    expect(statusLabel[PositionStatus.paid]).toBe('оплачено');
    expect(statusLabel[PositionStatus.paidEarlier]).toBe('оплачено ранее');
    expect(statusLabel[PositionStatus.returned]).toBe('вернулись после ремонта');
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

