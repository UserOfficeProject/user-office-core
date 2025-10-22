import { logger } from '@user-office-software/duo-logger';
import express, { Request, Response } from 'express';

import baseContext from '../buildContext';

const router = express.Router();

router.get('/readiness', async (req: Request, res: Response) => {
  try {
    const success = await baseContext.queries.system.connectivityCheck();
    const responseStatus = success ? 200 : 503;
    res.status(responseStatus).json({
      application: {
        status: 'UP',
        database: {
          status: success ? 'UP' : 'DOWN',
          message: success ? 'Connected' : 'Not connected',
        },
      },
    });
  } catch (e) {
    logger.logException('Readiness check failed', e);
    res.status(500).json({
      application: {
        status: 'DOWN',
        database: {
          status: 'DOWN',
          message: 'Could not perform readiness check',
        },
      },
    });
  }
});

export default function () {
  return router;
}
