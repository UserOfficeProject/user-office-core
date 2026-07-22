import { AllocationTimeUnits } from '../../models/Call';

export type AllocationTimeUnitConverter = (
  time: number,
  unit: AllocationTimeUnits
) => number;

export const getSecondsFromAllocationTimeUnits: AllocationTimeUnitConverter = (
  timeAllocation: number,
  unit: AllocationTimeUnits
) => {
  // NOTE: Shift duration defaults to 8 hours.
  // To customize this per organization, inject a configuration provider
  // that supplies the specific shift duration for the facility.
  switch (unit) {
    case AllocationTimeUnits.Hour:
      return timeAllocation * 60 * 60;
    case AllocationTimeUnits.Shift:
      return timeAllocation * 60 * 60 * 8;
    case AllocationTimeUnits.Week:
      return timeAllocation * 7 * 24 * 60 * 60;
    case AllocationTimeUnits.Day:
    default:
      return timeAllocation * 24 * 60 * 60;
  }
};
