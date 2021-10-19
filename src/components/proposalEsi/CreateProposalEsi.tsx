import React, { useEffect, useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { CreateEsiMutation } from 'generated/sdk';
import { ProposalEsiWithQuestionary } from 'models/questionary/proposalEsi/ProposalEsiWithQuestionary';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import ProposalEsiContainer from './ProposalEsiContainer';

interface CreateProposalEsiProps {
  onCreate?: (esi: ProposalEsiWithQuestionary) => void;
  onUpdate?: (esi: ProposalEsiWithQuestionary) => void;
  onSubmitted?: (esi: ProposalEsiWithQuestionary) => void;
  scheduledEventId: number;
}
function CreateProposalEsi({
  onCreate,
  onUpdate,
  onSubmitted,
  scheduledEventId,
}: CreateProposalEsiProps) {
  const { api } = useDataApiWithFeedback();
  const [esi, setEsi] = useState<CreateEsiMutation['createEsi']['esi']>(null);

  useEffect(() => {
    api()
      .createEsi({ scheduledEventId })
      .then((result) => {
        if (result.createEsi.esi) {
          setEsi(result.createEsi.esi);
        }
      });
  }, [scheduledEventId, api]);

  if (!esi) {
    return <UOLoader />;
  }

  return (
    <ProposalEsiContainer
      esi={esi}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onSubmitted={onSubmitted}
    />
  );
}

export default CreateProposalEsi;
