import dotenv from 'dotenv';

dotenv.config({
  path:
    (process.env.CONFIG_PATH || './') + (process.env.NODE_ENV || '') + '.env',
});
