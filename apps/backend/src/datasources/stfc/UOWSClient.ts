import { UOWS } from '../../generated';
import dotenv from 'dotenv';
dotenv.config({ path: process.env.CONFIG_PATH });

const UOWSClient = new UOWS({
  BASE: process.env.API_BASE,
  HEADERS: {
    Authorization: `Api-key ${process.env.API_KEY}`,
  },
});

export default UOWSClient;
