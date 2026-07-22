import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { GetExperimentSafetyQuery } from 'generated/sdk';
import { StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import ExperimentSafetyContainer from './ExperimentSafetyContainer';
import ExperimentSafetyNotification from './ExperimentSafetyNotification';

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

  return (
    <>
      <ExperimentSafetyNotification experimentSafety={experimentSafety} />
      <StyledPaper data-cy="experiment-safety-container" margin={[2, 0]}>
        <ExperimentSafetyContainer experimentSafety={experimentSafety} />
      </StyledPaper>
    </>
  );
}

export default ExperimentSafety;
