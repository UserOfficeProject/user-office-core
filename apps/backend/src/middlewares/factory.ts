import { logger } from '@user-office-software/duo-logger';
import express, { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import baseContext from '../buildContext';
import { Tokens } from '../config/Tokens';
import { DownloadType } from '../factory/DownloadService';
import { AuthJwtPayload, UserWithRole } from '../models/User';
import pdfDownload from './factory/pdf/download';
import pdfPreview from './factory/pdf/preview';
import xlsxDownload from './factory/xlsx';
import zipDownload from './factory/zip';

const defaultErrorMessage = 'Failed to generate the requested file(s)';

const getUserWithRoleFromExpressUser = async ({
  user,
  roles,
  currentRole,
  externalToken,
  impersonatingUserId,
  isInternalUser,
}: AuthJwtPayload): Promise<UserWithRole> => {
  const userAuthorization = container.resolve<UserAuthorization>(
    Tokens.UserAuthorization
  );

  return {
    ...(await baseContext.queries.user.getAgent(user.id)),
    currentRole: currentRole || (roles ? roles[0] : null),
    externalToken: externalToken,
    externalTokenValid:
      externalToken !== undefined
        ? await userAuthorization.isExternalTokenValid(externalToken)
        : false,
    isInternalUser: isInternalUser,
    impersonatingUserId: impersonatingUserId,
  } as UserWithRole;
};

const getUserWithRoleFromAccessTokenId = async (
  accessTokenId: string
): Promise<UserWithRole> => {
  const { accessPermissions } =
    await baseContext.queries.admin.getPermissionsByToken(accessTokenId);

  return {
    accessPermissions: accessPermissions ? JSON.parse(accessPermissions) : null,
    isApiAccessToken: true,
  } as UserWithRole;
};
const getLogContextFromRequest = (req: Request) => {
  if (req?.user) {
    const userReq = req.user?.accessTokenId
      ? {
          accessTokenId: req.user?.accessTokenId,
          isApiAccessToken: true,
        }
      : {
          id: req.user?.user.id,
          currentRole: req.user?.currentRole,
        };

    return {
      originalUrl: req.originalUrl,
      user: userReq,
    };
  }

  return {};
};

const factoryDownloadRouter = express.Router();

factoryDownloadRouter.use(`/${DownloadType.PDF}`, pdfDownload());
factoryDownloadRouter.use(`/${DownloadType.XLSX}`, xlsxDownload());
factoryDownloadRouter.use(`/${DownloadType.ZIP}`, zipDownload());
factoryDownloadRouter.use(
  (
    err: Error | { error: Error; message: string } | string,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
  ) => {
    let message: string;

    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'string') {
      message = err;
    } else {
      message = err.message;
    }

    err instanceof Error
      ? logger.logException(err.message, err, getLogContextFromRequest(req))
      : logger.logError(defaultErrorMessage, {
          err,
          ...getLogContextFromRequest(req),
        });

    if (
      message.includes('EXTERNAL_TOKEN_INVALID') ||
      message.includes('INSUFFICIENT_PERMISSIONS')
    ) {
      return res.status(401).send(message);
    }
    res.status(500).end(message);
  }
);

const factoryPreviewRouter = express.Router();

factoryPreviewRouter.use(`/${DownloadType.PDF}`, pdfPreview());

export default function factory() {
  const router = express.Router();

  const middleware = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const accessTokenId = req.user?.accessTokenId;
    const decodedUser = req.user;
    if (decodedUser) {
      if (accessTokenId) {
        await getUserWithRoleFromAccessTokenId(accessTokenId)
          .then((userWithRole) => {
            if (!userWithRole || !userWithRole.accessPermissions) {
              return res.status(401).send('INSUFFICIENT_PERMISSIONS');
            }
            res.locals.agent = userWithRole;
            next();
          })
          .catch((e) => {
            logger.logException(
              `${defaultErrorMessage} INSUFFICIENT_PERMISSIONS`,
              e
            );
            res
              .status(401)
              .send(`${defaultErrorMessage} INSUFFICIENT_PERMISSIONS`);
          });
      } else {
        baseContext.queries.user
          .getAgent(decodedUser.user.id)
          .then(async (user) => {
            if (!user) {
              return res.status(401).send('EXTERNAL_TOKEN_INVALID');
            }
            req.user = {
              user,
              currentRole: decodedUser.currentRole,
              isInternalUser: decodedUser.isInternalUser,
              roles: [],
            };
            res.locals.agent =
              await getUserWithRoleFromExpressUser(decodedUser);
            next();
          })
          .catch((e) => {
            logger.logException(defaultErrorMessage, e);
            res.status(500).send(defaultErrorMessage);
          });
      }
    } else {
      return res.status(401).send('EXTERNAL_TOKEN_INVALID');
    }
  };

  router.use('/download', middleware, factoryDownloadRouter);
  router.use('/preview', middleware, factoryPreviewRouter);

  return router;
}
