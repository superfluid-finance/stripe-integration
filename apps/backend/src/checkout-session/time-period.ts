export const timePeriods = ['day', 'week', 'month', 'year'] as const;

export const SECONDS_IN_A_DAY = 86_400n; // 60 * 60 * 24 seconds in a day

// TODO(KK): get this from the widget repo but might need to handle dual packages first
export const mapTimePeriodToSeconds = (timePeriod: TimePeriod): bigint => {
  switch (timePeriod) {
    case 'day':
      return SECONDS_IN_A_DAY;
    case 'week':
      return 604800n; // 60 * 60 * 24 * 7 seconds in a week
    case 'month':
      return 2628000n; // 60 * 60 * 24 * 30 seconds in a month (approximation)
    case 'year':
      return 31536000n; // 60 * 60 * 24 * 365 seconds in a year (approximation)
    default:
      throw new Error(`Invalid time period: ${timePeriod}`);
  }
};

export type TimePeriod = (typeof timePeriods)[number];
