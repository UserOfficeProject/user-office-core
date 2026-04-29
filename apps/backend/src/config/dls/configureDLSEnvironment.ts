import { container } from 'tsyringe';

import { AdminDataSource } from '../../datasources/AdminDataSource';
import { FeatureId } from '../../models/Feature';
import { SettingsId } from '../../models/Settings';
import { setTimezone, setDateTimeFormats } from '../setTimezoneAndFormat';
import { Tokens } from '../Tokens';
import { updateOIDCSettings } from '../updateOIDCSettings';

function getUASInstance() {
  let instance = process.env.UAS_INSTANCE || 'https://uas.diamond.ac.uk/uas';
  if (instance.endsWith('/')) {
    instance = instance.slice(0, -1);
  }

  return instance;
}

async function setDLSColourTheme() {
  const db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);

  await db.waitForDBUpgrade();

  await db.updateSettings({
    settingsId: SettingsId.PALETTE_PRIMARY_DARK,
    settingsValue: '#202945',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_PRIMARY_MAIN,
    settingsValue: '#202945',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_PRIMARY_LIGHT,
    settingsValue: '#202945',
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
    settingsValue: '#202945',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SECONDARY_MAIN,
    settingsValue: '#202945',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SECONDARY_LIGHT,
    settingsValue: '#202945',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SECONDARY_CONTRAST,
    settingsValue: '#ffffff',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_ERROR_MAIN,
    settingsValue: '#bd0000ff',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SUCCESS_MAIN,
    settingsValue: '#14ac00ff',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_WARNING_MAIN,
    settingsValue: '#ceb902ff',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_INFO_MAIN,
    settingsValue: '#202945',
  });

  await db.updateSettings({
    settingsId: SettingsId.HEADER_LOGO_FILENAME,
    settingsValue: 'diamond-white.svg',
  });
}

async function enableDefaultDLSFeatures() {
  const db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);

  await db.setFeatures(
    [
      FeatureId.PREGENERATED_PROPOSAL_PDF,
      FeatureId.OAUTH,
      FeatureId.RISK_ASSESSMENT,
      FeatureId.INSTRUMENT_MANAGEMENT,
      FeatureId.TECHNICAL_REVIEW,
      FeatureId.USER_MANAGEMENT,
      FeatureId.FAP_REVIEW,
      FeatureId.USER_SEARCH_FILTER,
      FeatureId.CONFLICT_OF_INTEREST_WARNING,
      FeatureId.EXPERIMENT_SAFETY_REVIEW,
      FeatureId.EMAIL_INVITE,
    ],
    true
  );

  await db.setFeatures(
    [
      FeatureId.EMAIL_SEARCH,
      FeatureId.SCHEDULER,
      FeatureId.SHIPPING,
      FeatureId.VISIT_MANAGEMENT,
      FeatureId.TECHNIQUE_PROPOSALS,
      FeatureId.TAGS,
      FeatureId.STFC_IDLE_TIMER,
      FeatureId.DATA_ACCESS_USERS,
    ],
    false
  );

  await db.updateSettings({
    settingsId: SettingsId.DISPLAY_PRIVACY_STATEMENT_LINK,
    settingsValue: 'true',
  });

  await db.updateSettings({
    settingsId: SettingsId.DEFAULT_INST_SCI_REVIEWER_FILTER,
    settingsValue: 'ME',
  });

  await db.updateSettings({
    settingsId: SettingsId.DEFAULT_INST_SCI_STATUS_FILTER,
    settingsValue: 'FEASIBILITY_REVIEW',
  });

  await db.updateSettings({
    settingsId: SettingsId.INVITE_VALIDITY_PERIOD_DAYS,
    settingsValue: '180',
  });

  await db.updateSettings({
    settingsId: SettingsId.DISPLAY_FAQ_LINK,
    settingsValue: 'true',
  });

  await db.updateSettings({
    settingsId: SettingsId.PROFILE_PAGE_LINK,
    settingsValue: getUASInstance() + '/#PersonalDetailsPlace:',
  });
}

async function configureDLSEnvironment() {
  await setDLSColourTheme();
  await enableDefaultDLSFeatures();
  await setTimezone();
  await setDateTimeFormats();
  await updateOIDCSettings();
}

export { configureDLSEnvironment, getUASInstance };
