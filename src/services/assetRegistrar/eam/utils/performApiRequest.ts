import axios from 'axios';

import { getToken } from '../api/getToken';
import { createAndLogError } from './createAndLogError';
import { getEnvOrThrow } from './getEnvOrThrow';

export async function performApiRequest(requestData: string) {
  const accessToken = await getToken();

  const response = await axios({
    method: 'post',
    url: getEnvOrThrow('EAM_API_URL'),
    data: requestData,
    headers: {
      'Content-Type': 'text/xml',
      Authorization: `Bearer ${accessToken.token.access_token}`,
    },
  }).catch((error) => {
    const { message, response } = error;
    throw createAndLogError('Error while calling EAM API', {
      message,
      requestData,
      responseData: response?.data,
    });
  });

  if (response.status !== 200) {
    throw createAndLogError('Failed to execute registerAssetInEAM', {
      response,
    });
  }

  return response.data as string;
}
