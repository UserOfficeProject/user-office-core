import { Sample } from '../models/Sample';
import { UpdateSampleArgs } from '../resolvers/mutations/UpdateSampleMutation';
import { SamplesArgs } from '../resolvers/queries/SamplesQuery';

export interface SampleDataSource {
  delete(sampleId: number): Promise<Sample>;
  updateSample(args: UpdateSampleArgs): Promise<Sample>;
  create(
    title: string,
    creatorId: number,
    proposalPk: number,
    questionaryId: number,
    questionId: string
  ): Promise<Sample>;
  getSample(sampleId: number): Promise<Sample | null>;
  getSamples(args: SamplesArgs): Promise<Sample[]>;
  getSamplesByCallId(callId: number): Promise<Sample[]>;
  getSamplesByShipmentId(shipmentId: number): Promise<Sample[]>;
  getSamplesByEsiId(esiId: number): Promise<Sample[]>;
}
