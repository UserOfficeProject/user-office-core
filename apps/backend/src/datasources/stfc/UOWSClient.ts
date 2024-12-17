import dotenv from 'dotenv';
import { UOWS } from '../../generated';

dotenv.config({ path: process.env.CONFIG_PATH });

export function createUOWSClient() {
  return new UOWS({
    BASE: process.env.BASE_URL,
    HEADERS: {
      Authorization: `Api-key ${process.env.API_KEY}`,
    },
  });
}