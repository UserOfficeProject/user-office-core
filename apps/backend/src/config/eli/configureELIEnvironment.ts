import { container } from 'tsyringe';

import { AdminDataSource } from '../../datasources/AdminDataSource';
import { FeatureId } from '../../models/Feature';
import { Roles } from '../../models/Role';
import { SettingsId } from '../../models/Settings';
import { setDateTimeFormats, setTimezone } from '../setTimezoneAndFormat';
import { Tokens } from '../Tokens';
import { updateOIDCSettings } from '../updateOIDCSettings';

async function setELIColourTheme() {
  const db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_PRIMARY_DARK,
    settingsValue: '#000000',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_PRIMARY_MAIN,
    settingsValue: '#ff6600',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_PRIMARY_LIGHT,
    settingsValue: '#ffbe8a',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_PRIMARY_ACCENT,
    settingsValue: '#000000',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_PRIMARY_CONTRAST,
    settingsValue: '#ffffff',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SECONDARY_DARK,
    settingsValue: '#bbbddc',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SECONDARY_MAIN,
    settingsValue: '#ebedf9',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SECONDARY_LIGHT,
    settingsValue: '#ffffff',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SECONDARY_CONTRAST,
    settingsValue: '#000000',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_ERROR_MAIN,
    settingsValue: '#eb2f1e',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SUCCESS_MAIN,
    settingsValue: '#4caf50',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_WARNING_MAIN,
    settingsValue: '#e09f00',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_INFO_MAIN,
    settingsValue: '#47a6e3',
  });
  await db.updateSettings({
    settingsId: SettingsId.HEADER_LOGO_FILENAME,
    settingsValue: 'eli-white.svg',
  });
  await db.updateSettings({
    settingsId: SettingsId.DISPLAY_FAQ_LINK,
    settingsValue: 'true',
  });
  await db.updateSettings({
    settingsId: SettingsId.DISPLAY_PRIVACY_STATEMENT_LINK,
    settingsValue: 'true',
  });
}

async function enableDefaultELIFeatures() {
  const db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);
  await db.setFeatures(
    [
      FeatureId.SCHEDULER,
      FeatureId.SHIPPING,
      FeatureId.RISK_ASSESSMENT,
      FeatureId.EMAIL_INVITE,
      FeatureId.INSTRUMENT_MANAGEMENT,
      FeatureId.TECHNICAL_REVIEW,
      FeatureId.FAP_REVIEW,
      FeatureId.USER_MANAGEMENT,
      FeatureId.VISIT_MANAGEMENT,
      FeatureId.EXPERIMENT_SAFETY_REVIEW,
      FeatureId.OAUTH,
    ],
    true
  );
  await db.updateSettings({
    settingsId: SettingsId.DEFAULT_INST_SCI_REVIEWER_FILTER,
    settingsValue: 'ME',
  });
  await db.updateSettings({
    settingsId: SettingsId.DEFAULT_INST_SCI_STATUS_FILTER,
    settingsValue: 'FEASIBILITY_REVIEW',
  });
}

async function setELIRoleNames() {
  const db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);

  await db.waitForDBUpgrade();

  await db.updateRole(Roles.FAP_CHAIR, {
    title: 'PRP Chair',
  });

  await db.updateRole(Roles.FAP_REVIEWER, {
    title: 'PRP Reviewer',
  });

  await db.updateRole(Roles.FAP_SECRETARY, {
    title: 'PRP Secretary',
  });
}

export async function configureELIDevelopmentEnvironment() {
  await setELIColourTheme();
  await enableDefaultELIFeatures();
  await setTimezone();
  await setDateTimeFormats();
  await updateOIDCSettings();
  await setELIRoleNames();
}
