import { container } from 'tsyringe';

import { AdminDataSource } from '../../datasources/AdminDataSource';
import { SettingsId } from '../../models/Settings';
import { Tokens } from '../Tokens';

export default function setStfcColourTheme() {
  const dataSource = container.resolve<AdminDataSource>(Tokens.AdminDataSource);
  dataSource.updateSettings(SettingsId.PALETTE_PRIMARY_DARK, '#2e2d62');
  dataSource.updateSettings(SettingsId.PALETTE_PRIMARY_MAIN, '#003088');
  dataSource.updateSettings(SettingsId.PALETTE_PRIMARY_ACCENT, '#003088');
  dataSource.updateSettings(SettingsId.PALETTE_PRIMARY_LIGHT, '#1e5df8');
  dataSource.updateSettings(SettingsId.PALETTE_PRIMARY_CONTRAST, '#ffffff');
  dataSource.updateSettings(SettingsId.PALETTE_SECONDARY_DARK, '#d77900');
  dataSource.updateSettings(SettingsId.PALETTE_SECONDARY_MAIN, '#ff9d1b');
  dataSource.updateSettings(SettingsId.PALETTE_SECONDARY_LIGHT, '#fbbe10');
  dataSource.updateSettings(SettingsId.PALETTE_SECONDARY_CONTRAST, '#000000');
  dataSource.updateSettings(SettingsId.PALETTE_ERROR_MAIN, '#a91b2e');
  dataSource.updateSettings(SettingsId.PALETTE_SUCCESS_MAIN, '#157846');
  dataSource.updateSettings(SettingsId.PALETTE_WARNING_MAIN, '#fbbe10');
  dataSource.updateSettings(SettingsId.PALETTE_INFO_MAIN, '#1e5df8');
  dataSource.updateSettings(
    SettingsId.HEADER_LOGO_FILENAME,
    'stfc-ukri-white.svg'
  );
}
