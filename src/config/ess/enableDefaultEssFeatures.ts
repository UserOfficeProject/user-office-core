import { container } from 'tsyringe';

import { AdminDataSource } from '../../datasources/AdminDataSource';
import { FeatureId } from '../../models/Feature';
import { Tokens } from '../Tokens';

export default function enableDefaultEssFeatures() {
  const dataSource = container.resolve<AdminDataSource>(Tokens.AdminDataSource);
  dataSource.setFeatures([FeatureId.SCHEDULER, FeatureId.SHIPPING], true);
}
