import { createAndLogError } from './createAndLogError';

type EnvVars =
  | 'EAM_API_URL'
  | 'EAM_OAUTH_TOKEN_URL'
  | 'EAM_AUTH_CLIENT_ID'
  | 'EAM_AUTH_CLIENT_SECRET'
  | 'EAM_OAUTH_SCOPE'
  | 'EAM_OAUTH_AUDIENCE'
  | 'EAM_ORGANIZATION_CODE'
  | 'EAM_ORGANIZATION_NAME'
  | 'EAM_EQUIPMENT_PART_CODE'
  | 'EAM_LOCATION_CODE';

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
