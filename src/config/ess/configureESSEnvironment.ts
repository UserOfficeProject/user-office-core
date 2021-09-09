import { container } from 'tsyringe';

import { AdminDataSource } from '../../datasources/AdminDataSource';
import { FeatureId } from '../../models/Feature';
import { SettingsId } from '../../models/Settings';
import { Tokens } from '../Tokens';

async function setEssColourTheme() {
  const db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);
  await db.updateSettings(SettingsId.PALETTE_PRIMARY_DARK, '#B33739');
  await db.updateSettings(SettingsId.PALETTE_PRIMARY_MAIN, '#FF4E50');
  await db.updateSettings(SettingsId.PALETTE_PRIMARY_ACCENT, '#0000008A');
  await db.updateSettings(SettingsId.PALETTE_PRIMARY_LIGHT, '#FC913A');
  await db.updateSettings(SettingsId.PALETTE_PRIMARY_CONTRAST, '#ffffff');
  await db.updateSettings(SettingsId.PALETTE_SECONDARY_DARK, '#B33739');
  await db.updateSettings(SettingsId.PALETTE_SECONDARY_MAIN, '#FF4E50');
  await db.updateSettings(SettingsId.PALETTE_SECONDARY_LIGHT, '#E1F5C4');
  await db.updateSettings(SettingsId.PALETTE_SECONDARY_CONTRAST, '#ffffff');
  await db.updateSettings(SettingsId.PALETTE_ERROR_MAIN, '#f44336');
  await db.updateSettings(SettingsId.PALETTE_SUCCESS_MAIN, '#4caf50');
  await db.updateSettings(SettingsId.PALETTE_WARNING_MAIN, '#ff9800');
  await db.updateSettings(SettingsId.PALETTE_INFO_MAIN, '#2196f3');
  await db.updateSettings(SettingsId.HEADER_LOGO_FILENAME, 'ess-white.svg');
}

async function enableDefaultEssFeatures() {
  const db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);
  await db.setFeatures(
    [FeatureId.SCHEDULER, FeatureId.SHIPPING, FeatureId.RISK_ASSESSMENT],
    true
  );
}

export async function configureESSDevelopmentEnvironment() {
  await setEssColourTheme();
  await enableDefaultEssFeatures();
}
