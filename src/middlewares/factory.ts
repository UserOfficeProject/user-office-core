import express, { Request, Response, NextFunction } from 'express';

import baseContext from '../buildContext';
import { DownloadType } from '../factory/service';
import { AuthJwtPayload, UserWithRole } from '../models/User';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/Logger';
import pdfDownload from './factory/pdf';
import xlsxDownload from './factory/xlsx';

export type RequestWithUser = Request & { user: UserWithRole };

const defaultErrorMessage = 'Failed to generate the requested file(s)';

const router = express.Router();

router.use(`/${DownloadType.PDF}`, pdfDownload());
router.use(`/${DownloadType.XLSX}`, xlsxDownload());
router.use(
  (
    err: Error | { error: Error; message: string } | string,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
  ) => {
    let message: string;

    if (err instanceof Error) {
      message = defaultErrorMessage;
    } else if (typeof err === 'string') {
      message = err;
    } else {
      message = err.message;
    }

    const ctx = {
      originalUrl: req.originalUrl,
      user: {
        id: (req as RequestWithUser).user.id,
        currentRole: (req as RequestWithUser).user.currentRole,
      },
    };

    err instanceof Error
      ? logger.logException(defaultErrorMessage, err, ctx)
      : logger.logError(defaultErrorMessage, { err, ...ctx });

    res.status(500).end(message);
  }
);

export default function factory() {
  return express.Router().use(
    '/download',
    (req, res, next) => {
      const decoded = verifyToken<AuthJwtPayload>(req.cookies.token);

      baseContext.queries.user
        .getAgent(decoded.user.id)
        .then(user => {
          if (!user) {
            return res.status(401).send('Unauthorized');
          }

          (req as RequestWithUser).user = {
            ...user,
            currentRole: decoded.currentRole,
          };
          next();
        })
        .catch(e => {
          logger.logException(defaultErrorMessage, e);
          res.status(500).send(defaultErrorMessage);
        });
    },
    router
  );
}
