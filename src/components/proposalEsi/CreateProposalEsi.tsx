import React, { useEffect, useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { CreateEsiMutation } from 'generated/sdk';
import { useVisit } from 'hooks/visit/useVisit';
import { ProposalEsiWithQuestionary } from 'models/questionary/proposalEsi/ProposalEsiWithQuestionary';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import ProposalEsiContainer from './ProposalEsiContainer';

interface CreateProposalEsiProps {
  onCreate?: (esi: ProposalEsiWithQuestionary) => void;
  onUpdate?: (esi: ProposalEsiWithQuestionary) => void;
  onSubmitted?: (esi: ProposalEsiWithQuestionary) => void;
  visitId: number;
}
function CreateProposalEsi({
  onCreate,
  onUpdate,
  onSubmitted,
  visitId,
}: CreateProposalEsiProps) {
  const { api } = useDataApiWithFeedback();
  const { visit } = useVisit(visitId);
  const [esi, setEsi] = useState<CreateEsiMutation['createEsi']['esi']>(null);

  useEffect(() => {
    if (visit) {
      api()
        .createEsi({ visitId: visit.id })
        .then((result) => {
          if (result.createEsi.esi) {
            setEsi(result.createEsi.esi);
          }
        });
    }
  }, [visit, api]);

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
