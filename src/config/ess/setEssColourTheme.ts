import { container } from 'tsyringe';

import { AdminDataSource } from '../../datasources/AdminDataSource';
import { SettingsId } from '../../models/Settings';
import { Tokens } from '../Tokens';

export default function setEssColourTheme() {
  const dataSource = container.resolve<AdminDataSource>(Tokens.AdminDataSource);
  dataSource.updateSettings(SettingsId.PALETTE_PRIMARY_DARK, '#b33739');
  dataSource.updateSettings(SettingsId.PALETTE_PRIMARY_MAIN, '#FF4E50');
  dataSource.updateSettings(SettingsId.PALETTE_PRIMARY_LIGHT, '#FC913A');
  dataSource.updateSettings(SettingsId.PALETTE_PRIMARY_CONTRAST, '#ffffff');
  dataSource.updateSettings(SettingsId.PALETTE_SECONDARY_DARK, '#F9D423');
  dataSource.updateSettings(SettingsId.PALETTE_SECONDARY_MAIN, '#F9D423');
  dataSource.updateSettings(SettingsId.PALETTE_SECONDARY_LIGHT, '#E1F5C4');
  dataSource.updateSettings(SettingsId.PALETTE_SECONDARY_CONTRAST, '#ffffff');
  dataSource.updateSettings(SettingsId.PALETTE_ERROR_MAIN, '#f44336');
  dataSource.updateSettings(SettingsId.PALETTE_SUCCESS_MAIN, '#4caf50');
  dataSource.updateSettings(SettingsId.PALETTE_WARNING_MAIN, '#ff9800');
  dataSource.updateSettings(SettingsId.PALETTE_INFO_MAIN, '#2196f3');
  dataSource.updateSettings(SettingsId.HEADER_LOGO_FILENAME, 'ess-white.svg');
}
