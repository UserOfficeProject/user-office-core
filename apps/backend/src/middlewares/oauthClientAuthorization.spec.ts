const mockIntrospect = jest.fn();

const mockOpenIdClient = {
  hasConfig: jest.fn().mockReturnValue(true),
  getInstance: jest.fn().mockResolvedValue({
    introspect: mockIntrospect,
  }),
};

jest.mock('@user-office-software/openid', () => {
  return {
    OpenIdClient: mockOpenIdClient,
  };
});

const mockGetOAuthClientById = jest.fn();

jest.mock('../buildContext', () => ({
  __esModule: true,
  default: {
    queries: {
      admin: {
        getOAuthClientById: (clientId: string) =>
          mockGetOAuthClientById(clientId),
      },
    },
  },
}));

import 'reflect-metadata';
import { NextFunction, Request, Response } from 'express';

import oauthClientAuthorization from './oauthClientAuthorization';
import { dummyOAuthClient } from '../datasources/mockups/AdminDataSource';
import { signToken } from '../utils/jwt';

const buildRequest = (authorization?: string) =>
  ({ headers: authorization ? { authorization } : {} }) as Request;

describe('oauthClientAuthorization', () => {
  const response = {} as Response;
  let next: NextFunction;

  // An access token as an external identity provider would issue it: signed
  // with something other than the User Office HS256 secret. Successful
  // introspections are cached per token, so every test mints its own.
  let tokenCounter = 0;
  const externalTokenFor = (subject: string) =>
    [
      Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString(
        'base64url'
      ),
      Buffer.from(
        JSON.stringify({ sub: `${subject}-${++tokenCounter}` })
      ).toString('base64url'),
      'signature',
    ].join('.');

  let externalToken: string;

  beforeEach(() => {
    externalToken = externalTokenFor('a-client');
    jest.clearAllMocks();
    mockOpenIdClient.hasConfig.mockReturnValue(true);
    next = jest.fn();
  });

  it('passes through when there is no OpenId configuration', async () => {
    mockOpenIdClient.hasConfig.mockReturnValue(false);
    const request = buildRequest(`Bearer ${externalToken}`);

    await oauthClientAuthorization()(request, response, next);

    expect(mockIntrospect).not.toHaveBeenCalled();
    expect(request.oauthClient).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('passes through when there is no bearer token', async () => {
    const request = buildRequest();

    await oauthClientAuthorization()(request, response, next);

    expect(mockIntrospect).not.toHaveBeenCalled();
    expect(request.oauthClient).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('does not introspect tokens issued by User Office itself', async () => {
    const userOfficeToken = signToken({ user: { id: 1 } });
    const request = buildRequest(`Bearer ${userOfficeToken}`);

    await oauthClientAuthorization()(request, response, next);

    expect(mockIntrospect).not.toHaveBeenCalled();
    expect(request.oauthClient).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('attaches the registered client for an active external token', async () => {
    mockIntrospect.mockResolvedValue({
      active: true,
      client_id: dummyOAuthClient.id,
    });
    mockGetOAuthClientById.mockResolvedValue(dummyOAuthClient);
    const request = buildRequest(`Bearer ${externalToken}`);

    await oauthClientAuthorization()(request, response, next);

    expect(mockIntrospect).toHaveBeenCalledWith(externalToken, 'access_token');
    expect(mockGetOAuthClientById).toHaveBeenCalledWith(dummyOAuthClient.id);
    expect(request.oauthClient).toEqual(dummyOAuthClient);
    expect(next).toHaveBeenCalled();
  });

  it('does not attach a client when the token is not active', async () => {
    mockIntrospect.mockResolvedValue({ active: false });
    const request = buildRequest(`Bearer ${externalToken}`);

    await oauthClientAuthorization()(request, response, next);

    expect(mockGetOAuthClientById).not.toHaveBeenCalled();
    expect(request.oauthClient).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('does not attach a client that is not registered in User Office', async () => {
    mockIntrospect.mockResolvedValue({
      active: true,
      client_id: 'unregistered-client',
    });
    mockGetOAuthClientById.mockResolvedValue(null);
    const request = buildRequest(`Bearer ${externalToken}`);

    await oauthClientAuthorization()(request, response, next);

    expect(request.oauthClient).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('passes through when introspection fails', async () => {
    mockIntrospect.mockRejectedValue(new Error('introspection unavailable'));
    const request = buildRequest(`Bearer ${externalToken}`);

    await oauthClientAuthorization()(request, response, next);

    expect(request.oauthClient).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('caches a successful introspection for repeated requests', async () => {
    mockIntrospect.mockResolvedValue({
      active: true,
      client_id: dummyOAuthClient.id,
    });
    mockGetOAuthClientById.mockResolvedValue(dummyOAuthClient);
    const middleware = oauthClientAuthorization();

    await middleware(buildRequest(`Bearer ${externalToken}`), response, next);
    await middleware(buildRequest(`Bearer ${externalToken}`), response, next);

    expect(mockIntrospect).toHaveBeenCalledTimes(1);
  });

  it('does not cache a token that has already expired', async () => {
    const expiredToken = externalTokenFor('expiring-client');
    mockIntrospect.mockResolvedValue({
      active: true,
      client_id: dummyOAuthClient.id,
      exp: Math.floor(Date.now() / 1000) - 60,
    });
    mockGetOAuthClientById.mockResolvedValue(dummyOAuthClient);
    const middleware = oauthClientAuthorization();

    await middleware(buildRequest(`Bearer ${expiredToken}`), response, next);
    await middleware(buildRequest(`Bearer ${expiredToken}`), response, next);

    expect(mockIntrospect).toHaveBeenCalledTimes(2);
  });
});
