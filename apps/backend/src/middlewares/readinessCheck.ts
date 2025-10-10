import { logger } from '@user-office-software/duo-logger';
import express, { Request, Response } from 'express';

import baseContext from '../buildContext';

const router = express.Router();

router.get('/readiness', (req: Request, res: Response) => {
  try {
    baseContext.queries.system.connectivityCheck().then((success) => {
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

      res.end();
    });
  } catch (e) {
    res.status(500).json({
      application: {
        status: 'DOWN',
        database: {
          status: 'DOWN',
          message: 'Could not perform readiness check',
        },
      },
    });

    logger.logException('Readiness check failed', e);
    res.end();
  }
});

export default function () {
  return router;
}
