import { google, calendar_v3 } from 'googleapis';
import { BaseExternalAccountClient, OAuth2Client, JWT } from 'google-auth-library';
import { config } from '../config/index.js';

export class CalendarClient {
  private calendar: calendar_v3.Calendar;
  private calendarId: string;

  constructor(authClient: BaseExternalAccountClient | OAuth2Client | JWT) {
    this.calendar = google.calendar({ version: 'v3', auth: authClient });
    this.calendarId = config.CALENDAR_ID;
  }

  async listEvents(
    timeMin: string,
    timeMax: string
  ): Promise<calendar_v3.Schema$Event[]> {
    const response = await this.calendar.events.list({
      calendarId: this.calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  }

  async createEvent(event: calendar_v3.Schema$Event): Promise<calendar_v3.Schema$Event> {
    const response = await this.calendar.events.insert({
      calendarId: this.calendarId,
      requestBody: event,
    });

    return response.data;
  }

  async eventExists(summary: string, date: string): Promise<boolean> {
    const events = await this.calendar.events.list({
      calendarId: this.calendarId,
      timeMin: `${date}T00:00:00Z`,
      timeMax: `${date}T23:59:59Z`,
      q: summary,
      singleEvents: true,
    });

    return (
      events.data.items?.some(
        (event) =>
          event.summary === summary &&
          (event.start?.date === date || event.start?.dateTime?.startsWith(date))
      ) || false
    );
  }
}
