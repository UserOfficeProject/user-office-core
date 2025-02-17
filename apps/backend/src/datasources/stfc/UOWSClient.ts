import dotenv from 'dotenv';

import { UOWS } from '../../../generated';

dotenv.config({ path: process.env.CONFIG_PATH });

export function createUOWSClient() {
  return new UOWS({
    BASE: process.env.EXTERNAL_UOWS_API_URL,
    HEADERS: {
      Authorization: `Api-key ${process.env.EXTERNAL_UOWS_API_KEY}`,
    },
  });
}
