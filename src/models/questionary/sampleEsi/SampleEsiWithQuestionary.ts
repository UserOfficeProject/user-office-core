import { ExcludeNull } from 'utils/utilTypes';

import { GetSampleEsiQuery } from '../../../generated/sdk';

export type SampleEsiWithQuestionary = ExcludeNull<
  GetSampleEsiQuery['sampleEsi']
>;
