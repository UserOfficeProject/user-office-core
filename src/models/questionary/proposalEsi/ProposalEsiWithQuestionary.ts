import { ExcludeNull } from 'utils/utilTypes';

import { GetEsiQuery } from '../../../generated/sdk';

export type ProposalEsiWithQuestionary = ExcludeNull<GetEsiQuery['esi']>;
