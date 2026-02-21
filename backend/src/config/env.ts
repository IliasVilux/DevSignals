import dotenv from 'dotenv';

dotenv.config();

function getEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
}

export const env = {
  DATABASE_URL: getEnv("DATABASE_URL"),
  ADZUNA_API_KEY: getEnv("ADZUNA_API_KEY"),
  ADZUNA_APP_ID: getEnv("ADZUNA_APP_ID"),
};