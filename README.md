# Waste Calendar Sync CLI

A modern Node.js CLI tool built with TypeScript to automate waste collection scheduling. The application reads a local JSON file, maps waste types to specific event names, and synchronizes them to a Google Calendar with proper reminders.

## Features

- **Automated Sync**: Sync waste collection schedules to Google Calendar
- **Smart Idempotency**: Prevents duplicate events by checking existing calendar entries
- **6 PM Reminders**: Sets popup reminders at 6:00 PM the evening before collection
- **OAuth 2.0 Authentication**: Secure Google Calendar API access with local token storage
- **Formatted Output**: Beautiful CLI tables showing sync results
- **Type-Safe**: Built with TypeScript in strict mode with Zod validation

## Prerequisites

- Node.js v20 or higher
- Google Cloud Project with Calendar API enabled
- OAuth 2.0 credentials (Client ID and Secret)

## Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Add authorized redirect URI: `http://localhost:3000/oauth2callback`
5. Download the credentials and note the Client ID and Client Secret

## Installation

```bash
npm install
```

## Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit `.env` and fill in your credentials:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
CALENDAR_ID=your-email@gmail.com
REDIRECT_URI=http://localhost:3000/oauth2callback
```

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

On the first run, the application will:
1. Open your browser for Google OAuth authentication
2. Ask you to authorize calendar access
3. Save the refresh token to `.credentials/token.json`
4. Subsequent runs will use the saved token

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

- The `.credentials/` directory is git-ignored
- Never commit your `.env` file or OAuth tokens
- The refresh token allows access to your calendar - keep it secure

## License

MIT
