/**
 * Тесты для бизнес-логики
 * Рефактор: логика вынесена в derive/format, компоненты унифицированы.
 */

import { describe, it, expect } from '@jest/globals';
import { calcSum, groupByStatus, toViewRows, orderStatuses } from './derive';
import { PositionStatus } from '@/types/domain';
import type { Position, Batch } from '@/types/domain';

describe('calcSum', () => {
  it('должен вычислять сумму позиции', () => {
    const position: Position = {
      id: '1',
      title: 'Тест',
      sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0 },
      qty: 5,
      price: 100,
      sum: null,
      sample: false,
      status: PositionStatus.inProduction,
      noteEnabled: false,
      noteText: null,
    };

    const result = calcSum(position);
    expect(result).toBe(500);
  });

  it('должен возвращать null если цена отсутствует', () => {
    const position: Position = {
      id: '1',
      title: 'Тест',
      sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0 },
      qty: 5,
      price: null,
      sum: null,
      sample: false,
      status: PositionStatus.inProduction,
      noteEnabled: false,
      noteText: null,
    };

    const result = calcSum(position);
    expect(result).toBeNull();
  });
});

describe('groupByStatus', () => {
  it('должен группировать позиции по статусу', () => {
    const positions: Position[] = [
      {
        id: '1',
        title: 'Тест 1',
        sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0 },
        qty: 1,
        price: 100,
        sum: 100,
        sample: false,
        status: PositionStatus.inProduction,
        noteEnabled: false,
        noteText: null,
      },
      {
        id: '2',
        title: 'Тест 2',
        sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0 },
        qty: 1,
        price: 200,
        sum: 200,
        sample: false,
        status: PositionStatus.done,
        noteEnabled: false,
        noteText: null,
      },
      {
        id: '3',
        title: 'Тест 3',
        sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0 },
        qty: 1,
        price: 300,
        sum: 300,
        sample: false,
        status: PositionStatus.inProduction,
        noteEnabled: false,
        noteText: null,
      },
    ];

    const result = groupByStatus(positions);

    expect(result[PositionStatus.inProduction]).toHaveLength(2);
    expect(result[PositionStatus.done]).toHaveLength(1);
    expect(result[PositionStatus.inTransit]).toHaveLength(0);
  });
});

describe('toViewRows', () => {
  it('должен преобразовывать партию в список строк для отображения', () => {
    const batch: Batch = {
      id: 'batch-1',
      positions: [
        {
          id: '1',
          title: 'Тест 1',
          sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0 },
          qty: 1,
          price: 100,
          sum: 100,
          sample: false,
          status: PositionStatus.inProduction,
          noteEnabled: false,
          noteText: null,
        },
        {
          id: '2',
          title: 'Тест 2',
          sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0 },
          qty: 1,
          price: 200,
          sum: 200,
          sample: false,
          status: PositionStatus.done,
          noteEnabled: false,
          noteText: null,
        },
      ],
    };

    const result = toViewRows(batch);

    expect(result).toHaveLength(2);
    expect(result[0].status).toBe(PositionStatus.inProduction);
    expect(result[0].items).toHaveLength(1);
    expect(result[1].status).toBe(PositionStatus.done);
    expect(result[1].items).toHaveLength(1);
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

describe('orderStatuses', () => {
  it('должен содержать фиксированный порядок статусов', () => {
    expect(orderStatuses).toEqual([
      PositionStatus.inProduction,
      PositionStatus.inTransit,
      PositionStatus.done,
      PositionStatus.paid,
      PositionStatus.paidEarlier,
      PositionStatus.returned,
    ]);
  });
});

