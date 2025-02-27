import React, { useEffect, useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { CreateOrGetExperimentSafetyMutation } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import ExperimentSafetyContainer from './ExperimentSafetyContainer';

interface ExperimentSafetyProps {
  experimentPk: number;
}
function ExperimentSafety({ experimentPk }: ExperimentSafetyProps) {
  const { api } = useDataApiWithFeedback();
  const [experimentSafety, setExperimentSafety] = useState<
    CreateOrGetExperimentSafetyMutation['createExperimentSafety'] | null
  >(null);

  useEffect(() => {
    api()
      .createOrGetExperimentSafety({ experimentPk })
      .then((result) => {
        if (result.createExperimentSafety) {
          setExperimentSafety(result.createExperimentSafety);
        }
      });
  }, [experimentPk, api]);

  if (!experimentSafety) {
    return <UOLoader />;
  }

  return <ExperimentSafetyContainer experimentSafety={experimentSafety} />;
}

export default ExperimentSafety;
