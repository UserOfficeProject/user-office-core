import { injectable } from 'tsyringe';

import { AssetRegistrar } from '../AssetRegistrar';
import { createContainer } from './api/createContainer';
import { createTicket } from './api/createTicket';

@injectable()
export class EAMAssetRegistrar implements AssetRegistrar {
  async register(shipmentId: number) {
    const containerId = await createContainer(shipmentId);
    await createTicket(shipmentId, containerId);

    return containerId;
  }
}
