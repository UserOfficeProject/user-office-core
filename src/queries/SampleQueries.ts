import { logger } from '@user-office-software/duo-logger';
import { container, inject, injectable } from 'tsyringe';

import { SampleAuthorization } from '../auth/SampleAuthorization';
import { ShipmentAuthorization } from '../auth/ShipmentAuthorization';
import { Tokens } from '../config/Tokens';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { Sample } from '../models/Sample';
import { UserWithRole } from '../models/User';
import { SamplesArgs } from '../resolvers/queries/SamplesQuery';

@injectable()
export default class SampleQueries {
  private sampleAuth = container.resolve(SampleAuthorization);
  private shipmentAuth = container.resolve(ShipmentAuthorization);

  constructor(
    @inject(Tokens.SampleDataSource)
    private dataSource: SampleDataSource
  ) {}

  @Authorized()
  async getSample(agent: UserWithRole | null, sampleId: number) {
    if ((await this.sampleAuth.hasReadRights(agent, sampleId)) !== true) {
      logger.logWarn('Unauthorized getSample access', { agent, sampleId });

      return null;
    }

    return this.dataSource.getSample(sampleId);
  }

  @Authorized()
  async getSamples(agent: UserWithRole | null, args: SamplesArgs) {
    let samples = await this.dataSource.getSamples(args);

    samples = await Promise.all(
      samples.map((sample) => this.sampleAuth.hasReadRights(agent, sample.id))
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
    const hasRights = await this.shipmentAuth.hasReadRights(user, shipmentId);
    if (hasRights === false) {
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
