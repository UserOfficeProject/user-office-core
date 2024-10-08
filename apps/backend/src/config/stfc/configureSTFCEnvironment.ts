import 'reflect-metadata';
import { container } from 'tsyringe';

import { AdminDataSource } from '../../datasources/AdminDataSource';
import { FeatureId } from '../../models/Feature';
import { Roles } from '../../models/Role';
import { SettingsId } from '../../models/Settings';
import { setTimezone, setDateTimeFormats } from '../setTimezoneAndFormat';
import { Tokens } from '../Tokens';

async function setStfcColourTheme() {
  const db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);

  await db.waitForDBUpgrade();

  await db.updateSettings({
    settingsId: SettingsId.PALETTE_PRIMARY_DARK,
    settingsValue: '#2e2d62',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_PRIMARY_MAIN,
    settingsValue: '#003088',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_PRIMARY_ACCENT,
    settingsValue: '#003088',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_PRIMARY_LIGHT,
    settingsValue: '#1e5df8',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_PRIMARY_CONTRAST,
    settingsValue: '#ffffff',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SECONDARY_DARK,
    settingsValue: '#d77900',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SECONDARY_MAIN,
    settingsValue: '#ff9d1b',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SECONDARY_LIGHT,
    settingsValue: '#fbbe10',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SECONDARY_CONTRAST,
    settingsValue: '#000000',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_ERROR_MAIN,
    settingsValue: '#a91b2e',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SUCCESS_MAIN,
    settingsValue: '#157846',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_WARNING_MAIN,
    settingsValue: '#fbbe10',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_INFO_MAIN,
    settingsValue: '#1e5df8',
  });
  await db.updateSettings({
    settingsId: SettingsId.HEADER_LOGO_FILENAME,
    settingsValue: 'stfc-ukri-white.svg',
  });
}

async function enableDefaultStfcFeatures() {
  const db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);

  await db.waitForDBUpgrade();

  await db.setFeatures(
    [
      FeatureId.EMAIL_SEARCH,
      FeatureId.INSTRUMENT_MANAGEMENT,
      FeatureId.STFC_IDLE_TIMER,
      FeatureId.TECHNICAL_REVIEW,
      FeatureId.FAP_REVIEW,
      FeatureId.USER_SEARCH_FILTER,
    ],
    true
  );
  await db.updateSettings({
    settingsId: SettingsId.EXTERNAL_AUTH_LOGIN_URL,
    settingsValue: process.env.EXTERNAL_AUTH_LOGIN_URL,
  });
  await db.updateSettings({
    settingsId: SettingsId.EXTERNAL_AUTH_LOGOUT_URL,
    settingsValue: process.env.EXTERNAL_AUTH_LOGOUT_URL,
  });
  await db.updateSettings({
    settingsId: SettingsId.PROFILE_PAGE_LINK,
    settingsValue: process.env.PROFILE_PAGE_LINK,
  });
  await db.updateSettings({
    settingsId: SettingsId.DEFAULT_INST_SCI_REVIEWER_FILTER,
    settingsValue: 'ALL',
  });
  await db.updateSettings({
    settingsId: SettingsId.DEFAULT_INST_SCI_STATUS_FILTER,
    settingsValue: 'ALL',
  });
  await db.updateSettings({
    settingsId: SettingsId.IDLE_TIMEOUT,
    settingsValue: '1200000',
  });
  await db.updateSettings({
    settingsId: SettingsId.GRADE_PRECISION,
    settingsValue: '0.01',
  });
  await db.updateSettings({
    settingsId: SettingsId.TECH_REVIEW_OPTIONAL_WORKFLOW_STATUS,
    settingsValue: 'FEASIBILITY',
  });
  await db.updateSettings({
    settingsId: SettingsId.FAP_SECS_EDIT_TECH_REVIEWS,
    settingsValue: 'true',
  });
}

async function setSTFCRoleNames() {
  const db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);

  await db.waitForDBUpgrade();

  await db.updateRoleTitle({
    shortCode: Roles.INSTRUMENT_SCIENTIST,
    title: 'Experiment Scientist',
  });

  await db.updateRoleTitle({
    shortCode: Roles.FAP_CHAIR,
    title: 'FAP Chair',
  });

  await db.updateRoleTitle({
    shortCode: Roles.FAP_REVIEWER,
    title: 'FAP Reviewer',
  });

  await db.updateRoleTitle({
    shortCode: Roles.FAP_SECRETARY,
    title: 'FAP Secretary',
  });
}

export async function configureSTFCEnvironment() {
  await setStfcColourTheme();
  await enableDefaultStfcFeatures();
  await setSTFCRoleNames();
  await setTimezone();
  await setDateTimeFormats();
}
