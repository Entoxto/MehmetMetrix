/**
 * Тесты для бизнес-логики.
 * Группировка и сортировка работают по текстовым статусам (statusLabel).
 */

import { describe, it, expect } from '@jest/globals';
import { calcSum, groupByStatusLabel, toViewRows } from './derive';
import type { Position, Batch } from '@/types/domain';

// Хелпер для создания позиции с дефолтными значениями
function createPosition(overrides: Partial<Position>): Position {
  return {
    id: '1',
    productId: 'test-1',
    title: 'Тест',
    sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0, OneSize: 0 },
    qty: 1,
    price: 100,
    sum: 100,
    sample: false,
    statusLabel: 'В производстве 🛠️',
    noteEnabled: false,
    noteText: null,
    ...overrides,
  };
}

describe('calcSum', () => {
  it('должен вычислять сумму позиции', () => {
    const position = createPosition({ qty: 5, price: 100, sum: null });
    const result = calcSum(position);
    expect(result).toBe(500);
  });

  it('должен возвращать null если цена отсутствует', () => {
    const position = createPosition({ qty: 5, price: null, sum: null });
    const result = calcSum(position);
    expect(result).toBeNull();
  });
});

describe('groupByStatusLabel', () => {
  it('должен группировать позиции по текстовому статусу', () => {
    const positions: Position[] = [
      createPosition({ id: '1', statusLabel: 'В производстве 🛠️' }),
      createPosition({ id: '2', statusLabel: 'Получено, оплачено ✅' }),
      createPosition({ id: '3', statusLabel: 'В производстве 🛠️' }),
    ];

    const result = groupByStatusLabel(positions);

    expect(result.get('В производстве 🛠️')).toHaveLength(2);
    expect(result.get('Получено, оплачено ✅')).toHaveLength(1);
    expect(result.size).toBe(2);
  });
});

describe('toViewRows', () => {
  it('должен преобразовывать партию в список строк для отображения', () => {
    const batch: Batch = {
      id: 'batch-1',
      positions: [
        createPosition({ id: '1', statusLabel: 'В производстве 🛠️' }),
        createPosition({ id: '2', statusLabel: 'Получено, оплачено ✅' }),
      ],
    };

    const result = toViewRows(batch);

    expect(result).toHaveLength(2);
    const labels = result.map(r => r.statusLabel);
    expect(labels).toContain('В производстве 🛠️');
    expect(labels).toContain('Получено, оплачено ✅');
  });

  it('должен сортировать: не оплаченные выше оплаченных', () => {
    const batch: Batch = {
      id: 'batch-1',
      positions: [
        createPosition({ id: '1', statusLabel: 'Получено, оплачено ✅' }),
        createPosition({ id: '2', statusLabel: 'В производстве 🛠️' }),
        createPosition({ id: '3', statusLabel: 'Получено, не оплачено 📦' }),
      ],
    };

    const result = toViewRows(batch);

    const labels = result.map(r => r.statusLabel);
    const paidIndex = labels.indexOf('Получено, оплачено ✅');
    const unpaidIndex1 = labels.indexOf('В производстве 🛠️');
    const unpaidIndex2 = labels.indexOf('Получено, не оплачено 📦');

    expect(unpaidIndex1).toBeLessThan(paidIndex);
    expect(unpaidIndex2).toBeLessThan(paidIndex);
  });

  it('должен сортировать: большие группы выше внутри категории', () => {
    const batch: Batch = {
      id: 'batch-1',
      positions: [
        createPosition({ id: '1', statusLabel: 'В производстве 🛠️' }),
        createPosition({ id: '2', statusLabel: 'В пути 🚚' }),
        createPosition({ id: '3', statusLabel: 'В пути 🚚' }),
        createPosition({ id: '4', statusLabel: 'В пути 🚚' }),
      ],
    };

    const result = toViewRows(batch);

    const labels = result.map(r => r.statusLabel);
    const inTransitIndex = labels.indexOf('В пути 🚚');
    const inProductionIndex = labels.indexOf('В производстве 🛠️');

    expect(inTransitIndex).toBeLessThan(inProductionIndex);
  });

  it('должен возвращать пустой список если позиций нет', () => {
    const batch: Batch = {
      id: 'batch-1',
      positions: [],
    };

    const result = toViewRows(batch);

    expect(result).toHaveLength(0);
  });
});

