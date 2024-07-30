import { createAndLogError } from './createAndLogError';
import { getEnvOrThrow } from './getEnvOrThrow';

export async function performApiRequest(uri: string, requestData: object) {
  try {
    console.log('1-----------------');
    // const accessToken = await getToken();
    console.log('2-----------------');
    console.log(getEnvOrThrow('EAM_API_URL') + uri);
    const response = await fetch(getEnvOrThrow('EAM_API_URL') + uri, {
      method: 'POST',
      body: JSON.stringify(requestData),
      headers: {
        'Content-Type': 'application/json',
        // INFOR_USER: 'SRV_USEROFFICE',
        // INFOR_PASSWORD: 'Q500Xuib31977427',
        // INFOR_TENANT: 'DS_MP_1',
        // INFOR_ORGANIZATION: 'ESS',
      },
    });
    console.log('3-----------------');
    const data = await response.text();
    console.log('4-----------------');
    if (!response.ok) {
      throw createAndLogError('Failed to execute registerAssetInEAM', {
        data,
      });
    }
    console.log({ data });

    return data;
  } catch (error) {
    console.log('###########################');
    console.log({ error });
    throw createAndLogError('Error while calling EAM API', {
      error,
      requestData,
    });
  }
}
