export function getPingAuthTokenFromCallbackUrl() {
  const hashFragment = window.location.hash;
  const urlParamsAsString = hashFragment.replace(/^#/, '');
  const params = new URLSearchParams(urlParamsAsString);
  const accessTokenQueryParam = params.get('access_token');

  return accessTokenQueryParam;
}
