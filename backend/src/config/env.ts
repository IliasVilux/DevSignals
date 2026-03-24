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
  PORT: getEnv("PORT"),
  REDIS_URL: process.env.REDIS_URL,
  JWT_SECRET: getEnv("JWT_SECRET"),
  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
  GITHUB_CLIENT_ID: getEnv("GITHUB_CLIENT_ID"),
  GITHUB_CLIENT_SECRET: getEnv("GITHUB_CLIENT_SECRET"),
  FRONTEND_URL: getEnv("FRONTEND_URL"),
  CALLBACK_BASE_URL: getEnv("CALLBACK_BASE_URL"),
};
