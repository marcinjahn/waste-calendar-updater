import Table from 'cli-table3';
import chalk from 'chalk';
import { SyncResult } from '../calendar/index.js';

export function printSyncResults(results: SyncResult[]): void {
  const table = new Table({
    head: [
      chalk.bold('Type'),
      chalk.bold('Date'),
      chalk.bold('Status'),
    ],
    style: {
      head: [],
      border: [],
    },
  });

  const sortedResults = [...results].sort((a, b) => a.date.localeCompare(b.date));

  for (const result of sortedResults) {
    const status =
      result.status === 'added'
        ? chalk.green('Added')
        : chalk.yellow('Skipped (Exists)');

    table.push([result.type, result.date, status]);
  }

  console.log('\n' + chalk.bold.green('✅ Sync Complete!'));
  console.log(table.toString());

  const addedCount = results.filter((r) => r.status === 'added').length;
  const skippedCount = results.filter((r) => r.status === 'skipped').length;

  console.log(
    chalk.bold(`\nTotal Added: ${chalk.green(addedCount)} | Total Skipped: ${chalk.yellow(skippedCount)}`)
  );
}

export function printError(message: string, error?: Error): void {
  console.error(chalk.red.bold('\n❌ Error:'), chalk.red(message));
  if (error && error.message) {
    console.error(chalk.red(error.message));
  }
}

export function printInfo(message: string): void {
  console.log(chalk.blue('ℹ'), message);
}
