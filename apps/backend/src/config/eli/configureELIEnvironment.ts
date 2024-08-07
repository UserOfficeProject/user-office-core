import { container } from 'tsyringe';

import { AdminDataSource } from '../../datasources/AdminDataSource';
import { FeatureId } from '../../models/Feature';
import { SettingsId } from '../../models/Settings';
import { setTimezone, setDateTimeFormats } from '../setTimezoneAndFormat';
import { Tokens } from '../Tokens';
import { updateOIDCSettings } from '../updateOIDCSettings';

async function setELIColourTheme() {
  const db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_PRIMARY_DARK,
    settingsValue: '#519548',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_PRIMARY_MAIN,
    settingsValue: '#519548',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_PRIMARY_LIGHT,
    settingsValue: '#BEF202',
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
    settingsValue: '#1B676B',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SECONDARY_MAIN,
    settingsValue: '#1B676B',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SECONDARY_LIGHT,
    settingsValue: '#1B676B',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SECONDARY_CONTRAST,
    settingsValue: '#ffffff',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_ERROR_MAIN,
    settingsValue: '#f44336',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SUCCESS_MAIN,
    settingsValue: '#4caf50',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_WARNING_MAIN,
    settingsValue: '#ff9800',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_INFO_MAIN,
    settingsValue: '#2196f3',
  });
  await db.updateSettings({
    settingsId: SettingsId.HEADER_LOGO_FILENAME,
    settingsValue: 'eli-white.svg',
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
      FeatureId.SAMPLE_SAFETY,
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
  /*await db.updateSettings({
      settingsId: SettingsId.GRADE_PRECISION,
      settingsValue: '1',
    });*/
}

export async function configureELIDevelopmentEnvironment() {
  await setELIColourTheme();
  await enableDefaultELIFeatures();
  await setTimezone();
  await setDateTimeFormats();
  await updateOIDCSettings();
}