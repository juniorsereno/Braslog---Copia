import { describe, it, expect } from '@jest/globals';
import {
  CreateKpiEntrySchema,
  UpsertKpiEntriesSchema,
  KpiDateSchema,
} from '../kpi';

describe('KPI Validation Schemas', () => {
  it('should validate KPI date format YYYY-MM-DD', () => {
    expect(KpiDateSchema.safeParse('2025-01-08').success).toBe(true);
    expect(KpiDateSchema.safeParse('2025-13-01').success).toBe(false);
    expect(KpiDateSchema.safeParse('08/01/2025').success).toBe(false);
  });

  it('should validate CreateKpiEntry with RECEITA as monetary', () => {
    const ok = CreateKpiEntrySchema.safeParse({
      date: '2025-01-08',
      clientId: '11111111-1111-1111-1111-111111111111',
      kpiType: 'RECEITA',
      kpiValue: 1234.56,
    });
    expect(ok.success).toBe(true);

    const bad = CreateKpiEntrySchema.safeParse({
      date: '2025-01-08',
      clientId: '11111111-1111-1111-1111-111111111111',
      kpiType: 'RECEITA',
      kpiValue: -1,
    });
    expect(bad.success).toBe(false);
  });

  it('should validate UpsertKpiEntries entries array and fields', () => {
    const ok = UpsertKpiEntriesSchema.safeParse({
      date: '2025-01-08',
      entries: [
        {
          clientId: '11111111-1111-1111-1111-111111111111',
          onTime: 95.5,
        },
      ],
    });
    expect(ok.success).toBe(true);

    const badPercent = UpsertKpiEntriesSchema.safeParse({
      date: '2025-01-08',
      entries: [
        {
          clientId: '11111111-1111-1111-1111-111111111111',
          onTime: 120,
        },
      ],
    });
    expect(badPercent.success).toBe(false);

    const empty = UpsertKpiEntriesSchema.safeParse({ date: '2025-01-08', entries: [] });
    expect(empty.success).toBe(false);
  });
});




