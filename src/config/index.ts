import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  SERVICE_ACCOUNT_KEY_PATH: z.string().optional(),
  SERVICE_ACCOUNT_KEY_JSON: z.string().optional(),
  CALENDAR_ID: z.string().min(1, 'CALENDAR_ID is required'),
}).refine(
  (data) => data.SERVICE_ACCOUNT_KEY_PATH || data.SERVICE_ACCOUNT_KEY_JSON,
  {
    message: 'Either SERVICE_ACCOUNT_KEY_PATH or SERVICE_ACCOUNT_KEY_JSON must be provided',
  }
);

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
      const issues = error.errors.map((err) => err.message).join(', ');
      throw new Error(
        `Missing or invalid environment variables: ${issues}\n` +
          'Please check your .env file or GitHub secrets configuration.'
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
  get SERVICE_ACCOUNT_KEY_JSON() {
    return getConfig().SERVICE_ACCOUNT_KEY_JSON;
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
