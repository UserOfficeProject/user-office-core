import { injectable } from 'tsyringe';

import { AssetRegistrar } from '../AssetRegistrar';
import { createContainer } from './api/createContainer';

@injectable()
export class EAMAssetRegistrar implements AssetRegistrar {
  async register(shipmentId: number) {
    const containerId = await createContainer(shipmentId);
    // await createTicket(shipmentId, containerId); // Commenting this, as the create Ticket API is not yet live.

    return containerId;
  }
}
