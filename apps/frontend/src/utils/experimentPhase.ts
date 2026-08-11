import { DateTime } from 'luxon';

export type ExperimentPhase = 'running' | 'upcoming' | 'past';

const pluralise = (count: number, unit: string) =>
  `${count} ${unit}${count === 1 ? '' : 's'}`;

const upcomingLabel = (days: number): string => {
  if (days < 1) {
    return 'Starting soon';
  }

  if (days < 14) {
    return `In ${pluralise(Math.round(days), 'day')}`;
  }

  if (days < 60) {
    return `In ${pluralise(Math.round(days / 7), 'week')}`;
  }

  return `In ${pluralise(Math.round(days / 30), 'month')}`;
};

export function experimentPhase(
  startsAt: string,
  endsAt: string,
  now: DateTime = DateTime.now()
): { phase: ExperimentPhase; label: string } {
  const start = DateTime.fromISO(startsAt);
  const end = DateTime.fromISO(endsAt);

  if (!start.isValid || !end.isValid) {
    return { phase: 'upcoming', label: '' };
  }

  if (now >= end) {
    return { phase: 'past', label: 'Ended' };
  }

  if (now >= start) {
    return { phase: 'running', label: 'Running now' };
  }

  return {
    phase: 'upcoming',
    label: upcomingLabel(start.diff(now, 'days').days),
  };
}
