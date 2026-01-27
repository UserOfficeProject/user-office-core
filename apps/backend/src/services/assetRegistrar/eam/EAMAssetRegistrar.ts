import { injectable } from 'tsyringe';

import { AssetRegistrar } from '../AssetRegistrar';
import { createContainer } from './api/addAssetEquipment';
import { createCaseManagement } from './api/addCaseManagement';

@injectable()
export class EAMAssetRegistrar implements AssetRegistrar {
  async register(shipmentId: number) {
    const containerId = await createContainer(shipmentId);
    await createCaseManagement(shipmentId, containerId);

    return containerId;
  }
}
