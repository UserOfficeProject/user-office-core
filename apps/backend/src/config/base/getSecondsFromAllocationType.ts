import { AllocationTimeUnits } from '../../models/Call';

export type AllocationTimeUnitConverter = (
  time: number,
  unit: AllocationTimeUnits
) => number;

export const getSecondsFromAllocationTimeUnits: AllocationTimeUnitConverter = (
  timeAllocation: number,
  unit: AllocationTimeUnits
) => {
  // NOTE: Default AllocationTimeUnit is 'Day'. The UI supports Days and Hours.
  switch (unit) {
    case AllocationTimeUnits.Hour:
      return timeAllocation * 60 * 60;
    case AllocationTimeUnits.Week:
      return timeAllocation * 7 * 24 * 60 * 60;
    case AllocationTimeUnits.Shift:
      return timeAllocation * 60 * 60 * 8;
    default:
      return timeAllocation * 24 * 60 * 60;
  }
};
