# Quick Start Guide

## Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and add your Google credentials:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
CALENDAR_ID=your-email@gmail.com
REDIRECT_URI=http://localhost:3000/oauth2callback
```

### 3. Build
```bash
npm run build
```

## Usage

### Sync Calendar
```bash
npm start -- --file ./calendar_2026.json
```

Or directly:
```bash
node dist/index.js --file ./calendar_2026.json
```

### First Run
The first time you run the application:
1. Your browser will open automatically
2. Sign in to your Google account
3. Grant calendar access
4. Return to the terminal

The token is saved to `.credentials/token.json` for future use.

### Expected Output
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
│ Mixed Garbage   │ 2026-01-23 │ Added            │
│ Plastic Garbage │ 2026-01-27 │ Added            │
└─────────────────┴────────────┴──────────────────┘

Total Added: 3 | Total Skipped: 0
```

## Troubleshooting

### Missing Environment Variables
**Error:** `Missing or invalid environment variables`
**Solution:** Make sure your `.env` file exists and contains all required variables

### Authentication Failed
**Error:** Browser doesn't open or authentication fails
**Solution:**
- Ensure the redirect URI in Google Console matches your `.env`
- Check that port 3000 is available
- Try copying the URL manually from the terminal

### Events Not Created
**Error:** No events appear in calendar
**Solution:**
- Verify `CALENDAR_ID` is correct (usually your email)
- Check calendar permissions in Google Calendar settings
- Ensure the API is enabled in Google Cloud Console

## File Format

Your JSON file should contain waste collection dates:

```json
{
  "metals_and_plastics": ["2026-01-27"],
  "paper": ["2026-02-17"],
  "glass": ["2026-03-31"],
  "bio": ["2026-01-12"],
  "mixed": ["2026-01-23"]
}
```

All dates must be in `YYYY-MM-DD` format.
