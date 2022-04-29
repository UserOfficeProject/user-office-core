import { createAndLogError } from './createAndLogError';

type EnvVars =
  | 'EAM_API_URL'
  | 'EAM_AUTH_CLIENT_ID'
  | 'EAM_AUTH_CLIENT_SECRET'
  | 'EAM_AUTH_HOST'
  | 'EAM_AUTH_PASS'
  | 'EAM_AUTH_USER'
  | 'EAM_PART_CODE';

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
