import { OpenIdClient } from '@user-office-software/openid';
import { container } from 'tsyringe';

import { AdminDataSource } from '../datasources/AdminDataSource';
import { SettingsId } from '../models/Settings';
import { Tokens } from './Tokens';

export async function updateOIDCSettings() {
  if (OpenIdClient.hasConfig() === false) {
    return;
  }

  const loginUrl = await OpenIdClient.loginUrl();
  const logoutUrl = await OpenIdClient.logoutUrl();
  const db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);

  await db.updateSettings({
    settingsId: SettingsId.EXTERNAL_AUTH_LOGIN_URL,
    settingsValue: loginUrl,
  });

  await db.updateSettings({
    settingsId: SettingsId.EXTERNAL_AUTH_LOGOUT_URL,
    settingsValue: logoutUrl,
  });
}
