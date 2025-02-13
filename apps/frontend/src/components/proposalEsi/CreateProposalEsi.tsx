import React, { useEffect, useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { CreateEsiMutation } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import ProposalEsiContainer from './ProposalEsiContainer';

interface CreateProposalEsiProps {
  experimentPk: number;
}
function CreateProposalEsi({ experimentPk }: CreateProposalEsiProps) {
  const { api } = useDataApiWithFeedback();
  const [esi, setEsi] = useState<CreateEsiMutation['createEsi'] | null>(null);

  useEffect(() => {
    api()
      .createEsi({ experimentPk })
      .then((result) => {
        if (result.createEsi) {
          setEsi(result.createEsi);
        }
      });
  }, [experimentPk, api]);

  if (!esi) {
    return <UOLoader />;
  }

  return <ProposalEsiContainer esi={esi} />;
}

export default CreateProposalEsi;
