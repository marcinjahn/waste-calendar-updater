import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { AuthManager } from '../auth/index.js';
import { CalendarClient, EventManager } from '../calendar/index.js';
import { wasteCalendarSchema } from '../validation/index.js';
import { printError, printInfo, printSyncResults } from './output.js';

export function createProgram(): Command {
  const program = new Command();

  program
    .name('waste-sync')
    .description('Sync waste collection schedules to Google Calendar')
    .version('1.0.0');

  program
    .option('-f, --file <path>', 'Path to the waste calendar JSON file')
    .action(async (options) => {
      try {
        if (!options.file) {
          printError('File path is required. Use --file <path>');
          process.exit(1);
        }

        await syncCalendar(options.file);
      } catch (error) {
        printError('Failed to sync calendar', error as Error);
        process.exit(1);
      }
    });

  return program;
}

async function syncCalendar(filePath: string): Promise<void> {
  printInfo('Reading waste calendar file...');
  const absolutePath = path.resolve(filePath);
  const fileContent = await fs.readFile(absolutePath, 'utf-8');
  const data = JSON.parse(fileContent);

  printInfo('Validating calendar data...');
  const wasteCalendar = wasteCalendarSchema.parse(data);

  printInfo('Authenticating with Google Calendar...');
  const authManager = new AuthManager();
  const authClient = await authManager.getAuthenticatedClient();

  printInfo('Syncing events to calendar...');
  const calendarClient = new CalendarClient(authClient);
  const eventManager = new EventManager(calendarClient);

  const results = await eventManager.syncWasteCalendar(wasteCalendar);

  printSyncResults(results);
}
