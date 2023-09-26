import { logger } from '@user-office-software/duo-logger';
import express, { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import baseContext from '../buildContext';
import { Tokens } from '../config/Tokens';
import { DownloadType } from '../factory/service';
import { UserWithRole } from '../models/User';
import pdfDownload from './factory/pdf';
import xlsxDownload from './factory/xlsx';
import zipDownload from './factory/zip';

const defaultErrorMessage = 'Failed to generate the requested file(s)';

const getUserWithRoleFromExpressUser = async (
  user: Express.User
): Promise<UserWithRole> => {
  const userAuthorization = container.resolve<UserAuthorization>(
    Tokens.UserAuthorization
  );

  return {
    ...(await baseContext.queries.user.getAgent(user.user.id)),
    currentRole: user.currentRole || (user.roles ? user.roles[0] : null),
    externalToken: user.externalToken,
    externalTokenValid:
      user.externalToken !== undefined
        ? await userAuthorization.isExternalTokenValid(user.externalToken)
        : false,
    isInternalUser: user.isInternalUser,
    impersonatingUserId: user.impersonatingUserId,
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

const router = express.Router();

router.use(`/${DownloadType.PDF}`, pdfDownload());
router.use(`/${DownloadType.XLSX}`, xlsxDownload());
router.use(`/${DownloadType.ZIP}`, zipDownload());
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

export default function factory() {
  return express.Router().use(
    '/download',
    async (req, res, next) => {
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
              res.locals.agent = await getUserWithRoleFromExpressUser(
                decodedUser
              );
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
    },
    router
  );
}
