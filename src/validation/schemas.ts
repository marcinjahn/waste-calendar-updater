import { z } from 'zod';

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Date must be in YYYY-MM-DD format',
});

export const wasteCalendarSchema = z.object({
  metals_and_plastics: z.array(dateStringSchema),
  paper: z.array(dateStringSchema),
  glass: z.array(dateStringSchema),
  bio: z.array(dateStringSchema),
  mixed: z.array(dateStringSchema),
});

export type WasteCalendar = z.infer<typeof wasteCalendarSchema>;

export type WasteType = keyof WasteCalendar;
