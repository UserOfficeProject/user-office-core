import { logger } from '@user-office-software/duo-logger';
import express, { Request, Response } from 'express';

import baseContext from '../buildContext';

const router = express.Router();

router.get('/readiness', (req: Request, res: Response) => {
  baseContext.queries.system
    .connectivityCheck()
    .then((success) => {
      success ? res.status(200) : res.status(500);
      res.end();
    })
    .catch((e) => {
      logger.logException('Readiness check failed', e);
      res.status(500).end();
    });
});

export default function () {
  return router;
}
