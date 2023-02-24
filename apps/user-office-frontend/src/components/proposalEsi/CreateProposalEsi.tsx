import React, { useEffect, useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { CreateEsiMutation } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import ProposalEsiContainer from './ProposalEsiContainer';

interface CreateProposalEsiProps {
  scheduledEventId: number;
}
function CreateProposalEsi({ scheduledEventId }: CreateProposalEsiProps) {
  const { api } = useDataApiWithFeedback();
  const [esi, setEsi] = useState<CreateEsiMutation['createEsi'] | null>(null);

  useEffect(() => {
    api()
      .createEsi({ scheduledEventId })
      .then((result) => {
        if (result.createEsi) {
          setEsi(result.createEsi);
        }
      });
  }, [scheduledEventId, api]);

  if (!esi) {
    return <UOLoader />;
  }

  return <ProposalEsiContainer esi={esi} />;
}

export default CreateProposalEsi;
