import { useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';

import {
  GetPreviousCollaboratorsQuery,
  GetPreviousCollaboratorsQueryVariables,
} from '../../generated/sdk';

export function usePreviousCollaborators(
  params: GetPreviousCollaboratorsQueryVariables
) {
  const [previousCollaborators, setPreviousCollaborators] = useState<
    GetPreviousCollaboratorsQuery['previousCollaborators'] | null
  >(null);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    api()
      .getPreviousCollaborators(params)
      .then((data) => {
        if (unmounted) {
          return;
        }

        setPreviousCollaborators(data.previousCollaborators);
      });

    return () => {
      unmounted = true;
    };
  }, [api, params]);

  return previousCollaborators;
}
