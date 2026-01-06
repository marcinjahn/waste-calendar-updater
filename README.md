# Waste Calendar Sync CLI

A modern Node.js CLI tool built with TypeScript to automate waste collection scheduling. The application reads a local JSON file, maps waste types to specific event names, and synchronizes them to a Google Calendar with proper reminders.

## Features

- **Automated Sync**: Sync waste collection schedules to Google Calendar
- **Smart Idempotency**: Prevents duplicate events by checking existing calendar entries
- **6 PM Reminders**: Sets popup reminders at 6:00 PM the evening before collection
- **Service Account Authentication**: Secure Google Calendar API access using service accounts
- **GitHub Actions Support**: Run automatically via GitHub Actions with encrypted secrets
- **Formatted Output**: Beautiful CLI tables showing sync results
- **Type-Safe**: Built with TypeScript in strict mode with Zod validation

## Prerequisites

- Node.js v20 or higher
- Google Cloud Project with Calendar API enabled
- Service Account with Calendar API permissions

## Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create a Service Account:
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Give it a name (e.g., "waste-calendar-sync")
   - Click "Create and Continue"
   - Skip granting roles (click "Continue")
   - Click "Done"
5. Create a Service Account Key:
   - Click on the service account you just created
   - Go to the "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose JSON format
   - Click "Create" - the key file will download
6. Share your Google Calendar with the service account:
   - Open Google Calendar
   - Go to Settings → Select your calendar
   - Scroll to "Share with specific people"
   - Add the service account email (e.g., `waste-calendar-sync@your-project.iam.gserviceaccount.com`)
   - Give it "Make changes to events" permission

## Installation

```bash
npm install
```

## Configuration

### Local Development

1. Create a `.env` file in the project root:

```bash
touch .env
```

2. Add your credentials to `.env`:

```env
SERVICE_ACCOUNT_KEY_PATH=/path/to/your/service-account-key.json
CALENDAR_ID=your-calendar-id@group.calendar.google.com
```

**Note**: The `CALENDAR_ID` is found in Google Calendar settings under "Integrate calendar" → "Calendar ID"

### GitHub Actions Deployment

For running via GitHub Actions, see [SECURITY.md](./SECURITY.md) for detailed instructions on:
- Setting up GitHub repository secrets
- Configuring the workflow
- Security best practices
- Keeping your repository public safely

## Usage

### Build the project:

```bash
npm run build
```

### Run the CLI:

```bash
npm start -- --file ./calendar_2026.json
```

Or use the built binary directly:

```bash
node dist/index.js --file ./calendar_2026.json
```

### First Run

On the first run, ensure:
1. Your `.env` file is properly configured
2. The service account key file exists at the specified path
3. The service account has been granted access to your calendar
4. The calendar ID is correct

## Calendar Data Format

The input JSON file should follow this structure:

```json
{
  "metals_and_plastics": ["2026-01-27", "2026-02-24"],
  "paper": ["2026-02-17", "2026-05-26"],
  "glass": ["2026-03-31", "2026-06-26"],
  "bio": ["2026-01-12", "2026-02-16"],
  "mixed": ["2026-01-23", "2026-02-20"]
}
```

### Waste Type Mapping

The following mappings are applied:

- `metals_and_plastics` → "Plastic Garbage"
- `paper` → "Paper Garbage"
- `glass` → "Glass Garbage"
- `bio` → "Bio Garbage"
- `mixed` → "Mixed Garbage"

## Event Details

All events are created as:
- **All-day events**: Start and end dates are set according to Google Calendar requirements
- **Reminder**: 360 minutes (6 hours) before midnight = 6:00 PM the previous day
- **No duplicates**: Existing events with the same name and date are skipped

## Example Output

```
ℹ Reading waste calendar file...
ℹ Validating calendar data...
ℹ Authenticating with Google Calendar...
ℹ Syncing events to calendar...

✅ Sync Complete!
┌─────────────────┬────────────┬──────────────────┐
│ Type            │ Date       │ Status           │
├─────────────────┼────────────┼──────────────────┤
│ Bio Garbage     │ 2026-01-12 │ Added            │
│ Mixed Garbage   │ 2026-01-23 │ Skipped (Exists) │
│ Plastic Garbage │ 2026-01-27 │ Added            │
└─────────────────┴────────────┴──────────────────┘

Total Added: 2 | Total Skipped: 1
```

## Project Structure

```
waste-calendar-updater/
├── src/
│   ├── auth/           # OAuth2 authentication
│   ├── calendar/       # Google Calendar API client
│   ├── cli/            # CLI commands and output
│   ├── config/         # Configuration and environment
│   ├── utils/          # Date utilities
│   ├── validation/     # Zod schemas
│   └── index.ts        # Entry point
├── dist/               # Compiled output
├── .credentials/       # OAuth tokens (git-ignored)
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

## Development

### Type checking:

```bash
npm run type-check
```

### Watch mode:

```bash
npm run dev
```

## Security Notes

- The `.env` file and service account keys are git-ignored
- Never commit your `.env` file or service account JSON files
- The service account key allows access to your calendar - keep it secure
- For GitHub Actions deployment, use GitHub Secrets (see [SECURITY.md](./SECURITY.md))
- The repository can be safely made public if secrets are properly configured

## GitHub Actions

This project includes a GitHub Actions workflow for automated calendar syncing:

- **Workflow**: `.github/workflows/sync-calendar.yml`
- **Trigger**: Manual only (workflow_dispatch)
- **Input**: Calendar file name (e.g., `calendar_2026.json`)
- **Secrets Required**: `CALENDAR_ID` and `SERVICE_ACCOUNT_KEY_JSON`

See [SECURITY.md](./SECURITY.md) for complete setup instructions.

## License

MIT
