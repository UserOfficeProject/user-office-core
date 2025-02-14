import React, { useEffect, useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { CreateExperimentSafetyMutation } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import ProposalEsiContainer from './ProposalEsiContainer';

interface CreateProposalEsiProps {
  experimentPk: number;
}
function CreateProposalEsi({ experimentPk }: CreateProposalEsiProps) {
  const { api } = useDataApiWithFeedback();
  const [experimentSafety, setExperimentSafety] = useState<
    CreateExperimentSafetyMutation['createExperimentSafety'] | null
  >(null);
  useEffect(() => {
    api()
      .createExperimentSafety({ experimentPk })
      .then((result) => {
        if (result.createExperimentSafety) {
          setExperimentSafety(result.createExperimentSafety);
        }
      });
  }, [experimentPk, api]);

  if (!experimentSafety) {
    return <UOLoader />;
  }

  return <ProposalEsiContainer esi={experimentSafety} />;
}

export default CreateProposalEsi;
