import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { GetExperimentSafetyQuery } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import ExperimentSafetyContainer from './ExperimentSafetyContainer';

interface ExperimentSafetyProps {
  experimentSafetyPk: number;
}
function ExperimentSafety({ experimentSafetyPk }: ExperimentSafetyProps) {
  const { api } = useDataApiWithFeedback();
  const { enqueueSnackbar } = useSnackbar();
  const [experimentSafety, setExperimentSafety] = useState<
    GetExperimentSafetyQuery['experimentSafety'] | null
  >(null);

  useEffect(() => {
    api()
      .getExperimentSafety({ experimentSafetyPk })
      .then((result) => {
        if (result.experimentSafety) {
          setExperimentSafety(result.experimentSafety);
        } else {
          enqueueSnackbar('Experiment Safety data not found', {
            variant: 'error',
            className: 'snackbar-error',
          });
        }
      });
  }, [experimentSafetyPk, api, enqueueSnackbar]);

  if (!experimentSafety) {
    return <UOLoader />;
  }

  return <ExperimentSafetyContainer experimentSafety={experimentSafety} />;
}

export default ExperimentSafety;
