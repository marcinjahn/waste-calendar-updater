import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  SERVICE_ACCOUNT_KEY_PATH: z.string().min(1, 'SERVICE_ACCOUNT_KEY_PATH is required'),
  CALENDAR_ID: z.string().min(1, 'CALENDAR_ID is required'),
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
  get SERVICE_ACCOUNT_KEY_PATH() {
    return getConfig().SERVICE_ACCOUNT_KEY_PATH;
  },
  get CALENDAR_ID() {
    return getConfig().CALENDAR_ID;
  },
};

export const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export const WASTE_TYPE_MAPPING: Record<string, string> = {
  metals_and_plastics: 'Plastic Garbage',
  paper: 'Paper Garbage',
  glass: 'Glass Garbage',
  bio: 'Bio Garbage',
  mixed: 'Mixed Garbage',
};

export const REMINDER_MINUTES = 360;
