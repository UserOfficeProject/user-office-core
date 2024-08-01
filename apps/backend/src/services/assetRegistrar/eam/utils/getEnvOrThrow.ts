import { createAndLogError } from './createAndLogError';

type EnvVars =
  | 'EAM_API_URL'
  | 'EAM_AUTH_USER'
  | 'EAM_AUTH_PASSWORD'
  | 'EAM_AUTH_TENANT'
  | 'EAM_AUTH_ORGANIZATION'
  | 'EAM_SKIP_SSL_CERT_SECURITY'
  | 'EAM_EQUIPMENT_PART_CODE';

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
