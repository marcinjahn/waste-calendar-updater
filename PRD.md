# PRD: Waste Calendar Sync CLI (TypeScript/Node.js)

## 1. Project Overview

A modern Node.js CLI tool built with TypeScript to automate waste collection scheduling. The application reads a local JSON file, maps waste types to specific event names, and synchronizes them to a Google Calendar. It must ensure no duplicate events are created and set a reminder for 6:00 PM the evening before the collection.

## 2. Technical Requirements

    Runtime: Node.js (v20+)

    Language: TypeScript (Strict Mode)

    APIs: Google Calendar API v3

    Auth: OAuth 2.0 (User-based flow with local token storage)

    Validation: zod for JSON schema enforcement

    Date Handling: date-fns for manipulation and formatting

## 3. Functional Requirements

### 3.1 Data Schema & Mapping

The input JSON must be validated against the following structure:

    metals_and_plastics → "Plastic Garbage"

    paper → "Paper Garbage"

    glass → "Glass Garbage"

    bio → "Bio Garbage"

    mixed → "Mixed Garbage"

### 3.2 Google Calendar Logic

    Event Type: Create "All-day" events. In Google API, this means setting start.date and end.date (YYYY-MM-DD).

        Note: For a single-day all-day event, end.date must be the day after the start.date.

    Reminder Logic: * useDefault: false

        overrides: [{ method: 'popup', minutes: 360 }]

        Context: Google treats all-day events as starting at 00:00. A 360-minute (6-hour) lead time triggers the notification at 18:00 (6:00 PM) the previous day.

    Idempotency (No Duplicates): Before creating an event, the app must search the calendar for an existing event with the same Summary and Start Date. If found, skip creation.

    Add-Only: The app must never delete or modify existing events.

## 4. CLI Interface & Output

### 4.1 CLI Commands

The app should be executable via: npx waste-sync --file ./schedule.json

### 4.2 Post-Sync Summary

Upon completion, the CLI must print a formatted table or list using a library like cli-table3 or chalk to show exactly what was added.

Example Output:

```
✅ Sync Complete!
-----------------------------------------
Type            | Date         | Status
-----------------------------------------
Plastic Garbage | 2026-01-15   | Added
Bio Garbage     | 2026-01-12   | Added
Mixed Garbage   | 2026-01-07   | Skipped (Exists)
-----------------------------------------
Total Added: 2 | Total Skipped: 1
```

## 5. Implementation Roadmap for AI Agent

### Step 1: Configuration & Auth

    Implement OAuth2 flow. On first run, open the browser for user consent.

    Save the refresh_token to a local .credentials/token.json (git-ignored).

    Support GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and CALENDAR_ID via .env.

### Step 2: Parsing & Validation

    Read the JSON file provided in the CLI flag.

    Validate using zod to ensure every entry in the arrays is a valid YYYY-MM-DD string.

### Step 3: API Integration

    Fetch events from the target calendar to build a local cache of existing dates.

    Iterate through the JSON categories.

    For each date not in the cache:

        Calculate the reminder minutes (360).

        Insert the event.

        Store the result for the final summary.

### Step 4: Final Output

    Print the results summary to the console as specified in section 4.2.
