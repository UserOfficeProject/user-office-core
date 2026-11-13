import { logger } from '@user-office-software/duo-logger';
import { OpenIdClient } from '@user-office-software/openid';
import { NextFunction, Request, Response } from 'express';
import jsonwebtoken from 'jsonwebtoken';

import baseContext from '../buildContext';
import { JwtAlg } from '../utils/jwt';

// Introspecting the identity provider on every single request would add a
// network round trip to each call, so successful introspections are cached for
// a short while. The entry never outlives the token it was created from.
const INTROSPECTION_CACHE_TTL_MS = 60 * 1000;

type CacheEntry = { clientId: string; expiresAt: number };

const introspectionCache = new Map<string, CacheEntry>();

const getCachedClientId = (token: string): string | null => {
  const entry = introspectionCache.get(token);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    introspectionCache.delete(token);

    return null;
  }

  return entry.clientId;
};

const cacheClientId = (token: string, clientId: string, exp?: number) => {
  const tokenExpiresAt = exp ? exp * 1000 : Infinity;
  const expiresAt = Math.min(
    Date.now() + INTROSPECTION_CACHE_TTL_MS,
    tokenExpiresAt
  );

  if (expiresAt > Date.now()) {
    introspectionCache.set(token, { clientId, expiresAt });
  }
};

const getBearerToken = (req: Request): string | null => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return null;
  }

  const [scheme, credentials] = authorizationHeader.split(' ');

  if (!/^Bearer$/i.test(scheme) || !credentials) {
    return null;
  }

  return credentials;
};

/**
 * User Office issues its own tokens as HS256 JWTs. Anything else that arrives
 * as a bearer token is a candidate for being an access token issued by the
 * external identity provider, and is worth introspecting.
 */
const isUserOfficeIssuedToken = (token: string): boolean => {
  try {
    const decoded = jsonwebtoken.decode(token, { complete: true });

    return decoded?.header?.alg === JwtAlg;
  } catch {
    return false;
  }
};

const resolveClientId = async (token: string): Promise<string | null> => {
  const cachedClientId = getCachedClientId(token);

  if (cachedClientId) {
    return cachedClientId;
  }

  const client = await OpenIdClient.getInstance();
  const introspection = await client.introspect(token, 'access_token');

  if (!introspection.active || !introspection.client_id) {
    return null;
  }

  cacheClientId(token, introspection.client_id, introspection.exp);

  return introspection.client_id;
};

/**
 * Resolves bearer tokens issued by the external identity provider to an OAuth
 * client registered in User Office. When the token belongs to a registered
 * client, the client is attached to the request and the regular JWT
 * authorization middleware is skipped.
 *
 * Anything this middleware does not recognise is passed through untouched, so
 * an unregistered or invalid token is still rejected further down the chain.
 */
const oauthClientAuthorization =
  () => async (req: Request, res: Response, next: NextFunction) => {
    if (!OpenIdClient.hasConfig()) {
      return next();
    }

    const token = getBearerToken(req);

    if (!token || isUserOfficeIssuedToken(token)) {
      return next();
    }

    try {
      const clientId = await resolveClientId(token);

      if (!clientId) {
        return next();
      }

      const oauthClient =
        await baseContext.queries.admin.getOAuthClientById(clientId);

      if (!oauthClient) {
        logger.logWarn('Access token presented by an unregistered client', {
          clientId,
        });

        return next();
      }

      req.oauthClient = oauthClient;

      return next();
    } catch (error) {
      logger.logWarn('Could not resolve the access token to an OAuth client', {
        message: (error as Error)?.message,
      });

      return next();
    }
  };

export default oauthClientAuthorization;
