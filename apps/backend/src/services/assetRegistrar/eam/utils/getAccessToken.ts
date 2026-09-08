import { createAndLogError } from './createAndLogError';
import { getEnvOrThrow } from './getEnvOrThrow';

type TokenResponse = {
  access_token?: string;
};

/**
 * Obtains an OAuth2 access token using the client_credentials grant.
 * The token is used as a Bearer token when calling the EAM Camel API.
 */
export async function getAccessToken(): Promise<string> {
  const tokenUrl = getEnvOrThrow('EAM_OAUTH_TOKEN_URL');
  let response: Response;
  let data: TokenResponse;

  try {
    const base64Credentials = Buffer.from(
      `${getEnvOrThrow('EAM_AUTH_CLIENT_ID')}:${getEnvOrThrow(
        'EAM_AUTH_CLIENT_SECRET'
      )}`
    ).toString('base64');

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      scope: getEnvOrThrow('EAM_OAUTH_SCOPE'),
      aud: getEnvOrThrow('EAM_OAUTH_AUDIENCE'),
    });

    response = await fetch(tokenUrl, {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${base64Credentials}`,
      },
    });
    data = await response.json();
  } catch (error) {
    throw createAndLogError('Error while requesting EAM access token', {
      error,
      tokenUrl,
    });
  }

  if (!response.ok || !data?.access_token) {
    throw createAndLogError('Failed to obtain EAM access token', {
      data,
      tokenUrl,
    });
  }

  return data.access_token;
}
