import { createAndLogError } from './createAndLogError';
import { getAccessToken } from './getAccessToken';
import { getEnvOrThrow } from './getEnvOrThrow';

export async function performApiRequest(uri: string, requestData: object) {
  const url = getEnvOrThrow('EAM_API_URL') + uri;
  let response: Response;
  let data: any;

  const accessToken = await getAccessToken();

  try {
    response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(requestData),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    data = await response.json();
  } catch (error) {
    throw createAndLogError('Error while calling EAM API', {
      error,
      url,
      requestData,
    });
  }

  // Some EAM responses might be wrapped in a 'data' property
  const responseBody = data?.data || data;
  const eamErrors = responseBody?.ErrorAlert as
    | { Message: string }[]
    | undefined;

  if (eamErrors && eamErrors.length > 0) {
    const combinedMessage = Array.from(
      new Set(eamErrors.map((error) => error.Message))
    ).join(' ');

    throw createAndLogError(`EAM Service Error: ${combinedMessage}`, {
      data,
      url,
      requestData,
    });
  }

  if (!response.ok) {
    throw createAndLogError('Failed to execute registerAssetInEAM', {
      data,
      url,
      requestData,
    });
  }

  return responseBody;
}
