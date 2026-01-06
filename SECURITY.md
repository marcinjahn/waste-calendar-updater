# Security Configuration for GitHub Actions

This document explains how to securely configure this repository to run the waste calendar sync via GitHub Actions while keeping the repository public.

## Overview

The application requires two sensitive pieces of information:
1. **CALENDAR_ID**: Your Google Calendar ID
2. **SERVICE_ACCOUNT_KEY_JSON**: Your Google Service Account credentials (JSON format)

These are stored as **GitHub repository secrets**, which are encrypted and only accessible to GitHub Actions workflows in your repository.

## Setting Up GitHub Secrets

### Step 1: Access Repository Secrets

1. Go to your GitHub repository
2. Click on **Settings** (top menu)
3. In the left sidebar, under "Security", click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Step 2: Add CALENDAR_ID Secret

1. Name: `CALENDAR_ID`
2. Value: Your Google Calendar ID (from your `.env` file)
   - Example: `b2a9683336abce84b3ef4512bd9a83a516402e4eaa2d62bb6467dccc8af6eead@group.calendar.google.com`
3. Click **Add secret**

### Step 3: Add SERVICE_ACCOUNT_KEY_JSON Secret

1. Name: `SERVICE_ACCOUNT_KEY_JSON`
2. Value: The **entire contents** of your service account JSON file
   - Open your service account JSON file (e.g., `home-automation-483512-0407e4c8de71.json`)
   - Copy the **entire JSON content** (it should start with `{` and end with `}`)
   - Paste it as the secret value
3. Click **Add secret**

Example of what the service account JSON looks like:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

## Running the GitHub Action

The workflow is configured to run **manually only** for security and cost control.

### Manual Trigger

1. Go to **Actions** tab in your repository
2. Select **Sync Waste Calendar** workflow
3. Click **Run workflow**
4. Select the branch (usually `main`)
5. Enter the calendar file name (e.g., `calendar_2026.json`, `calendar_2027.json`)
6. Click **Run workflow**

The workflow will:
- Check out your repository
- Install dependencies
- Build the application
- Run the sync with the specified calendar file
- Use the encrypted secrets for authentication

## Security Best Practices

### ✅ What Makes This Secure

1. **Secrets are encrypted**: GitHub encrypts secrets at rest and only exposes them during workflow execution
2. **Not visible in logs**: Secret values are masked in workflow logs
3. **Repository-scoped**: Only workflows in **your** repository can access these secrets
4. **Branch protection**: You can configure branch protection to prevent unauthorized workflow changes
5. **No secrets in code**: The `.env` file and service account JSON files are in `.gitignore`

### ✅ Additional Security Measures

1. **Enable Branch Protection** (Recommended):
   - Go to **Settings** → **Branches**
   - Add a branch protection rule for `main`
   - Enable "Require pull request reviews before merging"
   - Enable "Require status checks to pass before merging"
   - This prevents direct pushes to `main` that could modify the workflow

2. **Limit Workflow Permissions**:
   - Go to **Settings** → **Actions** → **General**
   - Under "Workflow permissions", select "Read repository contents and packages permissions"
   - This limits what workflows can do

3. **Monitor Workflow Runs**:
   - Regularly check the **Actions** tab for unexpected workflow runs
   - Review the workflow history

4. **Restrict Who Can Approve Workflow Runs**:
   - Go to **Settings** → **Actions** → **General**
   - Under "Fork pull request workflows", ensure appropriate settings are selected

### ⚠️ Important: What NOT to Do

1. ❌ **Never commit** `.env` files or service account JSON files to the repository
2. ❌ **Never hardcode** secrets in your code or workflow files
3. ❌ **Never share** your GitHub repository secrets with others
4. ❌ **Never log** secret values in your code (they will be masked, but still avoid it)

## Verifying Security

### Check What's Ignored by Git

Run this command to verify sensitive files are not tracked:
```bash
git status --ignored
```

You should see:
- `.env`
- Any `*service-account*.json` files
- Any `*credentials*.json` files

### Check for Leaked Secrets

Before pushing any commits, run:
```bash
git diff --cached
```

Make sure no secrets appear in the output.

## Rotating Secrets

If you suspect your secrets have been compromised:

1. **For Service Account**:
   - Go to Google Cloud Console
   - Navigate to IAM & Admin → Service Accounts
   - Delete the old key
   - Create a new key
   - Update the `SERVICE_ACCOUNT_KEY_JSON` secret in GitHub

2. **For Calendar ID**:
   - If needed, create a new calendar
   - Update the `CALENDAR_ID` secret in GitHub

## Access Control

### Who Can Run the Workflow?

By default, only users with **write access** to the repository can:
- Manually trigger workflows
- Modify workflow files
- View secret names (but not values)

### Making the Repository Public Safely

You can make the repository public because:
1. Secrets are stored separately and not in the code
2. The workflow only runs when triggered by you (manually or on schedule)
3. External contributors cannot access secrets in pull requests from forks

However, be aware:
- Anyone can see your **workflow configuration** (but not the secret values)
- Anyone can see your **waste calendar data** (if that's public information, this is fine)

## Questions?

If you're unsure about any security aspect:
1. Keep the repository **private** until you're confident
2. Test the workflow thoroughly
3. Review the GitHub Actions logs to ensure no secrets are exposed
4. Consider using GitHub's security features like Dependabot and CodeQL
