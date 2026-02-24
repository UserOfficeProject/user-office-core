import { env } from 'process';

import { logger } from '@user-office-software/duo-logger';

export interface RorInstitution {
  name: string;
  country: string;
}

interface RorResponse {
  names: {
    types: string[];
    value: string;
  }[];
  locations: {
    geonames_details: {
      country_name: string;
    };
  }[];
}

const getInstitutionNameFromResponse = (
  rorResponseData: RorResponse
): string | undefined => {
  return rorResponseData.names.find((n) => n.types.includes('ror_display'))
    ?.value;
};

const getInstitutionCountryFromResponse = (
  rorResponseData: RorResponse
): string | undefined => {
  return rorResponseData.locations[0]?.geonames_details?.country_name;
};

export const getInstitutionFromRor = async (
  rorId: string
): Promise<RorInstitution | null> => {
  const ROR_API_URL = env.ROR_API_URL || 'https://api.ror.org/organizations';
  const cleanRorId = rorId.startsWith('http')
    ? rorId.replace(/\/+$/, '').split('/').pop()
    : rorId;

  try {
    const response = await fetch(`${ROR_API_URL}/${cleanRorId}`);

    if (response.status === 404) {
      logger.logError('Institution not found in ROR', { rorId });

      return null;
    }

    if (!response.ok) {
      logger.logError('Failed to fetch institution from ROR', {
        rorId,
        status: response.status,
      });

      return null;
    }

    const rorResponseData = (await response.clone().json()) as RorResponse;

    const rorName = getInstitutionNameFromResponse(rorResponseData);
    const rorCountry = getInstitutionCountryFromResponse(rorResponseData);

    if (!rorName || !rorCountry) {
      logger.logError('ROR response missing name or country', {
        rorId,
        rorResponseData,
      });

      return null;
    }

    return {
      name: rorName,
      country: rorCountry,
    };
  } catch (error) {
    logger.logError('Error fetching institution from ROR', { rorId, error });

    return null;
  }
};
