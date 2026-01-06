import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import fs from 'fs/promises';
import { config, SCOPES } from '../config/index.js';

export class AuthManager {
  async getAuthenticatedClient(): Promise<JWT> {
    try {
      let keyData: { client_email: string; private_key: string };

      if (config.SERVICE_ACCOUNT_KEY_JSON) {
        // Use SERVICE_ACCOUNT_KEY_JSON from environment variable (for GitHub Actions)
        keyData = JSON.parse(config.SERVICE_ACCOUNT_KEY_JSON);
      } else if (config.SERVICE_ACCOUNT_KEY_PATH) {
        // Use SERVICE_ACCOUNT_KEY_PATH from file system (for local development)
        await fs.access(config.SERVICE_ACCOUNT_KEY_PATH);
        const keyFileContent = await fs.readFile(config.SERVICE_ACCOUNT_KEY_PATH, 'utf-8');
        keyData = JSON.parse(keyFileContent);
      } else {
        throw new Error(
          'Neither SERVICE_ACCOUNT_KEY_JSON nor SERVICE_ACCOUNT_KEY_PATH is configured'
        );
      }

      if (!keyData.client_email || !keyData.private_key) {
        throw new Error(
          'Invalid service account key: missing client_email or private_key'
        );
      }

      const jwtClient = new google.auth.JWT({
        email: keyData.client_email,
        key: keyData.private_key,
        scopes: SCOPES,
      });

      await jwtClient.authorize();

      return jwtClient;
    } catch (error) {
      if (error instanceof Error) {
        if ('code' in error && error.code === 'ENOENT') {
          throw new Error(
            `Service account key file not found at: ${config.SERVICE_ACCOUNT_KEY_PATH}\n` +
              'Please ensure the SERVICE_ACCOUNT_KEY_PATH in your .env file points to a valid service account JSON key file.'
          );
        }
        throw new Error(`Failed to authenticate with service account: ${error.message}`);
      }
      throw error;
    }
  }
}
