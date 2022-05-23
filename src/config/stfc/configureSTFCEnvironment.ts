import 'reflect-metadata';
import { container } from 'tsyringe';

import { AdminDataSource } from '../../datasources/AdminDataSource';
import { FeatureId } from '../../models/Feature';
import { SettingsId } from '../../models/Settings';
import { setTimezone, setDateTimeFormats } from '../setTimezoneAndFormat';
import { Tokens } from '../Tokens';

async function setStfcColourTheme() {
  const db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);
  await db.updateSettings(SettingsId.PALETTE_PRIMARY_DARK, '#2e2d62');
  await db.updateSettings(SettingsId.PALETTE_PRIMARY_MAIN, '#003088');
  await db.updateSettings(SettingsId.PALETTE_PRIMARY_ACCENT, '#003088');
  await db.updateSettings(SettingsId.PALETTE_PRIMARY_LIGHT, '#1e5df8');
  await db.updateSettings(SettingsId.PALETTE_PRIMARY_CONTRAST, '#ffffff');
  await db.updateSettings(SettingsId.PALETTE_SECONDARY_DARK, '#d77900');
  await db.updateSettings(SettingsId.PALETTE_SECONDARY_MAIN, '#ff9d1b');
  await db.updateSettings(SettingsId.PALETTE_SECONDARY_LIGHT, '#fbbe10');
  await db.updateSettings(SettingsId.PALETTE_SECONDARY_CONTRAST, '#000000');
  await db.updateSettings(SettingsId.PALETTE_ERROR_MAIN, '#a91b2e');
  await db.updateSettings(SettingsId.PALETTE_SUCCESS_MAIN, '#157846');
  await db.updateSettings(SettingsId.PALETTE_WARNING_MAIN, '#fbbe10');
  await db.updateSettings(SettingsId.PALETTE_INFO_MAIN, '#1e5df8');
  await db.updateSettings(
    SettingsId.HEADER_LOGO_FILENAME,
    'stfc-ukri-white.svg'
  );
}

async function enableDefaultStfcFeatures() {
  const db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);
  await db.setFeatures(
    [
      FeatureId.EXTERNAL_AUTH,
      FeatureId.EMAIL_SEARCH,
      FeatureId.INSTRUMENT_MANAGEMENT,
    ],
    true
  );
  await db.updateSettings(
    SettingsId.EXTERNAL_AUTH_LOGIN_URL,
    process.env.EXTERNAL_AUTH_LOGIN_URL
  );
}

export async function configureSTFCEnvironment() {
  await setStfcColourTheme();
  await enableDefaultStfcFeatures();
  await setTimezone();
  await setDateTimeFormats();
}
