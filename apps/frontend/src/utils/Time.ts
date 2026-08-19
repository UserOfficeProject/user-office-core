import { DateTime } from 'luxon';

import { DateConfig, Scalars } from 'generated/sdk';

function getFormattedDate(
  date: Date,
  prefomattedDate?: string,
  hideYear = false
): string {
  const dateTime = DateTime.fromJSDate(date);
  const time = dateTime.toFormat('HH:mm');

  if (prefomattedDate) {
    // Today at 10:20
    // Yesterday at 10:20
    return `${prefomattedDate} at ${time}`;
  }

  // 10 Jan, 10:20
  // 10 Jan 2017, 10:20
  // The month name is abbreviated by the locale rather than by a table here,
  // so it stays right in every language the app is served in.
  return `${dateTime.toFormat(hideYear ? 'd LLL' : 'd LLL yyyy')}, ${time}`;
}

// --- Main function
export function timeAgo(
  dateParam: Date | Scalars['DateTime']['input'] | null
): string {
  if (!dateParam) {
    return 'unknown';
  }

  const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
  const DAY_IN_MS = 86400000; // 24 * 60 * 60 * 1000
  const today = new Date();
  const yesterday = new Date(today.getTime() - DAY_IN_MS);
  const seconds = Math.round((today.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const isToday = today.toDateString() === date.toDateString();
  const isYesterday = yesterday.toDateString() === date.toDateString();
  const isThisYear = today.getFullYear() === date.getFullYear();

  if (seconds < 5) {
    return 'now';
  } else if (seconds < 60) {
    return `${seconds} seconds ago`;
  } else if (seconds < 90) {
    return 'about a minute ago';
  } else if (minutes < 60) {
    return `${minutes} minutes ago`;
  } else if (isToday) {
    return getFormattedDate(date, 'Today'); // Today at 10:20
  } else if (isYesterday) {
    return getFormattedDate(date, 'Yesterday'); // Yesterday at 10:20
  } else if (isThisYear) {
    return getFormattedDate(date, undefined, true); // 10 Jan, 10:20
  }

  return getFormattedDate(date); // 10 Jan 2017, 10:20
}

export function timeRemaining(toDate: Date): string {
  const fromNow = DateTime.now();
  const untilDate = DateTime.fromJSDate(toDate);

  const { days, hours, minutes } = untilDate.diff(fromNow, [
    'days',
    'hours',
    'minutes',
    'seconds',
  ]);

  if (days > 30) {
    return '';
  } else if (days >= 1) {
    return `${days} day${days > 1 ? 's' : ''} remaining`;
  } else if (hours >= 1) {
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  } else if (minutes >= 1) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  } else {
    return '';
  }
}

export const minMaxDateTimeCalculations = ({
  minDate,
  maxDate,
  defaultDate,
  includeTime,
}: Pick<DateConfig, 'minDate' | 'maxDate' | 'defaultDate' | 'includeTime'>) => {
  const defaultFieldMinDate = minDate
    ? DateTime.fromISO(minDate).startOf(includeTime ? 'minute' : 'day')
    : null;
  const defaultFieldMaxDate = maxDate
    ? DateTime.fromISO(maxDate).startOf(includeTime ? 'minute' : 'day')
    : null;
  const defaultFieldDate = defaultDate
    ? DateTime.fromISO(defaultDate).startOf(includeTime ? 'minute' : 'day')
    : null;

  const isDefaultBeforeMinDate =
    defaultFieldDate &&
    defaultFieldMinDate &&
    defaultFieldMinDate > defaultFieldDate;
  const isDefaultAfterMaxDate =
    defaultFieldDate &&
    defaultFieldMaxDate &&
    defaultFieldMaxDate < defaultFieldDate;

  const isMinAfterMaxDate =
    defaultFieldMinDate &&
    defaultFieldMaxDate &&
    defaultFieldMinDate > defaultFieldMaxDate;

  return {
    defaultFieldMinDate,
    defaultFieldMaxDate,
    isDefaultBeforeMinDate,
    isDefaultAfterMaxDate,
    isMinAfterMaxDate,
  };
};
