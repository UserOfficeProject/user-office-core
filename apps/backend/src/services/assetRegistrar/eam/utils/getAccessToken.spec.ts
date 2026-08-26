import 'reflect-metadata';
import { getAccessToken } from './getAccessToken';

jest.mock('./getEnvOrThrow', () => ({
  getEnvOrThrow: (key: string) => {
    switch (key) {
      case 'EAM_OAUTH_TOKEN_URL':
        return 'https://auth.example.ess.eu/as/token.oauth2';
      case 'EAM_AUTH_CLIENT_ID':
        return 'client-id';
      case 'EAM_AUTH_CLIENT_SECRET':
        return 'client-secret';
      case 'EAM_OAUTH_SCOPE':
        return 'uos.api.read';
      case 'EAM_OAUTH_AUDIENCE':
        return 'https://api.example.ess.eu/';
      default:
        return 'MOCK_VALUE';
    }
  },
}));

describe('getAccessToken', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('requests a token with client_credentials grant and Basic auth', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'the-token', expires_in: 600 }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const token = await getAccessToken();

    expect(token).toBe('the-token');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://auth.example.ess.eu/as/token.oauth2');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe(
      'application/x-www-form-urlencoded'
    );

    const expectedBasic = Buffer.from('client-id:client-secret').toString(
      'base64'
    );
    expect(options.headers.Authorization).toBe(`Basic ${expectedBasic}`);

    const body = options.body as URLSearchParams;
    expect(body.get('grant_type')).toBe('client_credentials');
    expect(body.get('scope')).toBe('uos.api.read');
    expect(body.get('aud')).toBe('https://api.example.ess.eu/');
  });

  it('throws when the token response is not ok', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'invalid_client' }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(getAccessToken()).rejects.toThrow(
      'Failed to obtain EAM access token'
    );
  });

  it('throws when the token response has no access_token', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(getAccessToken()).rejects.toThrow(
      'Failed to obtain EAM access token'
    );
  });
});
