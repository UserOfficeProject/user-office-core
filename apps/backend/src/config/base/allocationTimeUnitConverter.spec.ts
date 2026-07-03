import { getSecondsFromAllocationTimeUnits } from './allocationTimeUnitConverter';
import { AllocationTimeUnits } from '../../models/Call';

describe('getSecondsFromAllocationTimeUnits', () => {
  it('converts hours to seconds', () => {
    expect(getSecondsFromAllocationTimeUnits(1, AllocationTimeUnits.Hour)).toBe(
      3600
    );

    expect(getSecondsFromAllocationTimeUnits(2, AllocationTimeUnits.Hour)).toBe(
      7200
    );
  });

  it('converts days to seconds', () => {
    expect(getSecondsFromAllocationTimeUnits(1, AllocationTimeUnits.Day)).toBe(
      86400
    );

    expect(
      getSecondsFromAllocationTimeUnits(0.5, AllocationTimeUnits.Day)
    ).toBe(43200);
  });

  it('converts shifts to seconds (8 hours default)', () => {
    expect(
      getSecondsFromAllocationTimeUnits(1, AllocationTimeUnits.Shift)
    ).toBe(8 * 3600);

    expect(
      getSecondsFromAllocationTimeUnits(2, AllocationTimeUnits.Shift)
    ).toBe(16 * 3600);
  });

  it('converts weeks to seconds', () => {
    expect(getSecondsFromAllocationTimeUnits(1, AllocationTimeUnits.Week)).toBe(
      7 * 24 * 3600
    );

    expect(
      getSecondsFromAllocationTimeUnits(0.5, AllocationTimeUnits.Week)
    ).toBe(3.5 * 24 * 3600);
  });

  it('Returns default of 1 day (86400) as default', () => {
    // Cast to bypass TS enum safety for edge-case testing
    expect(
      getSecondsFromAllocationTimeUnits(1, 'INVALID' as AllocationTimeUnits)
    ).toBe(60 * 60 * 24);
  });
});
