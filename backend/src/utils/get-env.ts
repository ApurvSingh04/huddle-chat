export const getEnv = (key: string, defaultValue?: string): string => {
  const env = process.env[key] ?? defaultValue;

  if (!env) {
    throw new Error(`Environment variable ${key} is not defined`);
  }

  return env;
};