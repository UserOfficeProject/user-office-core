import { GetSampleQuery } from 'generated/sdk';

export type SampleWithQuestionary = Exclude<GetSampleQuery['sample'], null>;
