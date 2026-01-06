import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

dotenv.config();

const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  CALENDAR_ID: z.string().min(1, 'CALENDAR_ID is required'),
  REDIRECT_URI: z.string().url().default('http://localhost:3000/oauth2callback'),
});

let cachedConfig: z.infer<typeof envSchema> | null = null;

function validateEnv() {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    cachedConfig = envSchema.parse(process.env);
    return cachedConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => err.path.join('.')).join(', ');
      throw new Error(
        `Missing or invalid environment variables: ${missingVars}\n` +
          'Please check your .env file. See .env.example for reference.'
      );
    }
    throw error;
  }
}

export function getConfig() {
  return validateEnv();
}

export const config = {
  get GOOGLE_CLIENT_ID() {
    return getConfig().GOOGLE_CLIENT_ID;
  },
  get GOOGLE_CLIENT_SECRET() {
    return getConfig().GOOGLE_CLIENT_SECRET;
  },
  get CALENDAR_ID() {
    return getConfig().CALENDAR_ID;
  },
  get REDIRECT_URI() {
    return getConfig().REDIRECT_URI;
  },
};

export const CREDENTIALS_PATH = path.join(process.cwd(), '.credentials', 'token.json');

export const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export const WASTE_TYPE_MAPPING: Record<string, string> = {
  metals_and_plastics: 'Plastic Garbage',
  paper: 'Paper Garbage',
  glass: 'Glass Garbage',
  bio: 'Bio Garbage',
  mixed: 'Mixed Garbage',
};

export const REMINDER_MINUTES = 360;
