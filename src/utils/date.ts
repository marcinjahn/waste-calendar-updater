import { addDays, parseISO, isValid } from 'date-fns';

export function validateDate(dateString: string): boolean {
  const date = parseISO(dateString);
  return isValid(date);
}

export function getNextDay(dateString: string): string {
  const date = parseISO(dateString);
  const nextDay = addDays(date, 1);
  return nextDay.toISOString().split('T')[0];
}

export function formatDateForCalendar(dateString: string): { start: string; end: string } {
  return {
    start: dateString,
    end: getNextDay(dateString),
  };
}
