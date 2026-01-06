import { calendar_v3 } from 'googleapis';
import { CalendarClient } from './client.js';
import { REMINDER_MINUTES, WASTE_TYPE_MAPPING } from '../config/index.js';
import { formatDateForCalendar } from '../utils/index.js';
import { WasteCalendar, WasteType } from '../validation/index.js';

export interface SyncResult {
  type: string;
  date: string;
  status: 'added' | 'skipped';
}

export class EventManager {
  constructor(private client: CalendarClient) {}

  async syncWasteCalendar(wasteCalendar: WasteCalendar): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (const [wasteType, dates] of Object.entries(wasteCalendar)) {
      const eventName = WASTE_TYPE_MAPPING[wasteType as WasteType];

      for (const date of dates) {
        const result = await this.syncEvent(eventName, date);
        results.push(result);
      }
    }

    return results;
  }

  private async syncEvent(summary: string, date: string): Promise<SyncResult> {
    const exists = await this.client.eventExists(summary, date);

    if (exists) {
      return {
        type: summary,
        date,
        status: 'skipped',
      };
    }

    await this.createWasteEvent(summary, date);

    return {
      type: summary,
      date,
      status: 'added',
    };
  }

  private async createWasteEvent(summary: string, date: string): Promise<void> {
    const { start, end } = formatDateForCalendar(date);

    const event: calendar_v3.Schema$Event = {
      summary,
      start: {
        date: start,
      },
      end: {
        date: end,
      },
      reminders: {
        useDefault: false,
        overrides: [
          {
            method: 'popup',
            minutes: REMINDER_MINUTES,
          },
        ],
      },
    };

    await this.client.createEvent(event);
  }
}
