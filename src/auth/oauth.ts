import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import http from 'http';
import open from 'open';
import fs from 'fs/promises';
import path from 'path';
import { config, CREDENTIALS_PATH, SCOPES } from '../config/index.js';

export class AuthManager {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      config.GOOGLE_CLIENT_ID,
      config.GOOGLE_CLIENT_SECRET,
      config.REDIRECT_URI
    );
  }

  async getAuthenticatedClient(): Promise<OAuth2Client> {
    try {
      const tokens = await this.loadSavedCredentials();
      if (tokens) {
        this.oauth2Client.setCredentials(tokens);
        return this.oauth2Client;
      }
    } catch (error) {
      // No saved credentials, proceed with OAuth flow
    }

    await this.performOAuthFlow();
    return this.oauth2Client;
  }

  private async loadSavedCredentials() {
    try {
      const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  private async saveCredentials(tokens: any): Promise<void> {
    const credentialsDir = path.dirname(CREDENTIALS_PATH);
    await fs.mkdir(credentialsDir, { recursive: true });
    await fs.writeFile(CREDENTIALS_PATH, JSON.stringify(tokens, null, 2));
  }

  private async performOAuthFlow(): Promise<void> {
    return new Promise((resolve, reject) => {
      const authUrl = this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent',
      });

      const server = http.createServer(async (req, res) => {
        try {
          if (req.url?.startsWith('/oauth2callback')) {
            const url = new URL(req.url, config.REDIRECT_URI);
            const code = url.searchParams.get('code');

            if (!code) {
              res.writeHead(400, { 'Content-Type': 'text/html' });
              res.end('<h1>Error: No authorization code received</h1>');
              reject(new Error('No authorization code received'));
              return;
            }

            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);
            await this.saveCredentials(tokens);

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(
              '<h1>Authentication successful!</h1><p>You can close this window and return to the terminal.</p>'
            );

            server.close();
            resolve();
          }
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end('<h1>Authentication failed</h1>');
          server.close();
          reject(error);
        }
      });

      const port = new URL(config.REDIRECT_URI).port || '3000';
      server.listen(parseInt(port), async () => {
        console.log(`Opening browser for authentication...`);
        console.log(`If the browser doesn't open, visit this URL manually:`);
        console.log(authUrl);
        await open(authUrl);
      });

      server.on('error', (error) => {
        reject(error);
      });
    });
  }
}
