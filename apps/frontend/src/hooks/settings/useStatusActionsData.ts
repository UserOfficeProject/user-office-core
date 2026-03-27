import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';

import { FeatureContext } from 'context/FeatureContextProvider';
import { FeatureId, StatusAction, StatusActionType } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useStatusActionsData(): {
  loadingStatusActions: boolean;
  statusActions: StatusAction[];
  setStatusActions: Dispatch<SetStateAction<StatusAction[]>>;
} {
  const [statusActions, setStatusActions] = useState<StatusAction[]>([]);
  const [loadingStatusActions, setLoadingStatusActions] = useState(true);

  const featureContext = useContext(FeatureContext);
  const isPregeneratedProposalPdfsEnabled = featureContext.featuresMap.get(
    FeatureId.PREGENERATED_PROPOSAL_PDF
  )?.isEnabled;

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoadingStatusActions(true);
    api()
      .getStatusActions()
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.statusActions) {
          if (!isPregeneratedProposalPdfsEnabled) {
            data.statusActions = data.statusActions.filter(
              (action) => action.type !== StatusActionType.PROPOSALDOWNLOAD
            );
          }
          setStatusActions(data.statusActions);
        }
        setLoadingStatusActions(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api]);

  return {
    loadingStatusActions,
    statusActions,
    setStatusActions,
  };
}
