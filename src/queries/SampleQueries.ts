import { logger } from '@esss-swap/duo-logger';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { Sample } from '../models/Sample';
import { UserWithRole } from '../models/User';
import { SamplesArgs } from '../resolvers/queries/SamplesQuery';
import { SampleAuthorization } from '../utils/SampleAuthorization';
import { ShipmentAuthorization } from '../utils/ShipmentAuthorization';

@injectable()
export default class SampleQueries {
  constructor(
    @inject(Tokens.SampleDataSource)
    private dataSource: SampleDataSource,

    @inject(Tokens.SampleAuthorization)
    private sampleAuthorization: SampleAuthorization,

    @inject(Tokens.ShipmentAuthorization)
    private shipmentAuthorization: ShipmentAuthorization
  ) {}

  async getSample(agent: UserWithRole | null, sampleId: number) {
    if (
      (await this.sampleAuthorization.hasReadRights(agent, sampleId)) !== true
    ) {
      logger.logWarn('Unauthorized getSample access', { agent, sampleId });

      return null;
    }

    return this.dataSource.getSample(sampleId);
  }

  async getSamples(agent: UserWithRole | null, args: SamplesArgs) {
    let samples = await this.dataSource.getSamples(args);

    samples = await Promise.all(
      samples.map((sample) =>
        this.sampleAuthorization.hasReadRights(agent, sample.id)
      )
    ).then((results) => samples.filter((_v, index) => results[index]));

    return samples;
  }

  @Authorized([Roles.USER_OFFICER, Roles.SAMPLE_SAFETY_REVIEWER])
  async getSamplesByCallId(user: UserWithRole | null, callId: number) {
    return await this.dataSource.getSamplesByCallId(callId);
  }

  async getSamplesByShipmentId(
    user: UserWithRole | null,
    shipmentId: number
  ): Promise<Sample[] | null> {
    if (
      (await this.shipmentAuthorization.hasReadRights(user, shipmentId)) ===
      false
    ) {
      logger.logWarn('Unauthorized getSamplesByShipmentId access', {
        user,
        shipmentId,
      });

      return null;
    }
    const response = await this.dataSource.getSamplesByShipmentId(shipmentId);

    return response;
  }
}
