import { createAndLogError } from './createAndLogError';

type EnvVars =
  | 'EAM_API_URL'
  | 'EAM_AUTH_URL'
  | 'EAM_AUTH_SECRET'
  | 'EAM_AUTH_USER'
  | 'EAM_AUTH_PASS';

export function getEnvOrThrow(envVariable: EnvVars) {
  const value = process.env[envVariable];
  if (!value) {
    throw createAndLogError(
      `Environmental variable ${envVariable} is not set`,
      {
        envVariable,
        value,
      }
    );
  }

  return value;
}
