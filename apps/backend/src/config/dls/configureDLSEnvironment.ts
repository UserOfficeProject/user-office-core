import { container } from 'tsyringe';

import { AdminDataSource } from '../../datasources/AdminDataSource';
import { FeatureId } from '../../models/Feature';
import { SettingsId } from '../../models/Settings';
import { isDevelopment, isStaging } from '../../utils/helperFunctions';
import { setTimezone, setDateTimeFormats } from '../setTimezoneAndFormat';
import { Tokens } from '../Tokens';
import { updateOIDCSettings } from '../updateOIDCSettings';

function getBaseURL() {
  let url = process.env.BASE_URL || 'https://uos.diamond.ac.uk';
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  return url;
}

async function setDLSColourTheme(primaryMainColour: string) {
  const db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);

  await db.waitForDBUpgrade();

  await Promise.all([
    db.updateSettings({
      settingsId: SettingsId.PALETTE_PRIMARY_DARK,
      settingsValue: '#202945',
    }),
    db.updateSettings({
      settingsId: SettingsId.PALETTE_PRIMARY_MAIN,
      settingsValue: primaryMainColour,
    }),
    db.updateSettings({
      settingsId: SettingsId.PALETTE_PRIMARY_LIGHT,
      settingsValue: '#202945',
    }),
    db.updateSettings({
      settingsId: SettingsId.PALETTE_PRIMARY_ACCENT,
      settingsValue: '#000000',
    }),
    db.updateSettings({
      settingsId: SettingsId.PALETTE_PRIMARY_CONTRAST,
      settingsValue: '#ffffff',
    }),
    db.updateSettings({
      settingsId: SettingsId.PALETTE_SECONDARY_DARK,
      settingsValue: '#202945',
    }),
    db.updateSettings({
      settingsId: SettingsId.PALETTE_SECONDARY_MAIN,
      settingsValue: '#202945',
    }),
    db.updateSettings({
      settingsId: SettingsId.PALETTE_SECONDARY_LIGHT,
      settingsValue: '#202945',
    }),
    db.updateSettings({
      settingsId: SettingsId.PALETTE_SECONDARY_CONTRAST,
      settingsValue: '#ffffff',
    }),
    db.updateSettings({
      settingsId: SettingsId.PALETTE_ERROR_MAIN,
      settingsValue: '#bd0000ff',
    }),
    db.updateSettings({
      settingsId: SettingsId.PALETTE_SUCCESS_MAIN,
      settingsValue: '#14ac00ff',
    }),
    db.updateSettings({
      settingsId: SettingsId.PALETTE_WARNING_MAIN,
      settingsValue: '#ceb902ff',
    }),
    db.updateSettings({
      settingsId: SettingsId.PALETTE_INFO_MAIN,
      settingsValue: '#202945',
    }),
    db.updateSettings({
      settingsId: SettingsId.HEADER_LOGO_FILENAME,
      settingsValue: 'diamond-white.svg',
    }),
  ]);
}

async function enableDefaultDLSFeatures() {
  const db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);

  await Promise.all([
    db.setFeatures(
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
    ),
    db.setFeatures(
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
    ),
    db.updateSettings({
      settingsId: SettingsId.DISPLAY_PRIVACY_STATEMENT_LINK,
      settingsValue: 'true',
    }),
    db.updateSettings({
      settingsId: SettingsId.DEFAULT_INST_SCI_REVIEWER_FILTER,
      settingsValue: 'ME',
    }),
    db.updateSettings({
      settingsId: SettingsId.DEFAULT_INST_SCI_STATUS_FILTER,
      settingsValue: 'FEASIBILITY_REVIEW',
    }),
    db.updateSettings({
      settingsId: SettingsId.INVITE_VALIDITY_PERIOD_DAYS,
      settingsValue: '180',
    }),
    db.updateSettings({
      settingsId: SettingsId.DISPLAY_FAQ_LINK,
      settingsValue: 'true',
    }),
    db.updateSettings({
      settingsId: SettingsId.PROFILE_PAGE_LINK,
      settingsValue: 'https://uas.diamond.ac.uk/uas/#PersonalDetailsPlace:',
    }),
  ]);
}

async function configureDLSEnvironment() {
  if (isDevelopment) {
    await setDLSColourTheme('#b3022b');
  }
  if (isStaging) {
    await setDLSColourTheme('#8B008B');
  }
  if (isDevelopment) {
    await Promise.all([
      enableDefaultDLSFeatures(),
      setTimezone(),
      setDateTimeFormats(),
      updateOIDCSettings(),
    ]);
  }
}

export { configureDLSEnvironment, getBaseURL };
