export const toLocalDateKey = (value: string | Date): string =>
  new Intl.DateTimeFormat('en-CA').format(new Date(value));
