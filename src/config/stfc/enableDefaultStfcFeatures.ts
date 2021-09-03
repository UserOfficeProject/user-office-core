import { container } from 'tsyringe';

import { AdminDataSource } from '../../datasources/AdminDataSource';
import { FeatureId } from '../../models/Feature';
import { SettingsId } from '../../models/Settings';
import { Tokens } from '../Tokens';

export default function enableDefaultStfcFeatures() {
  const dataSource = container.resolve<AdminDataSource>(Tokens.AdminDataSource);
  dataSource.setFeatures([FeatureId.EXTERNAL_AUTH], true);
  dataSource.updateSettings(
    SettingsId.EXTERNAL_AUTH_LOGIN_URL,
    process.env.EXTERNAL_AUTH_LOGIN_URL
  );
}
