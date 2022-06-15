import {
  getTranslation,
  ResourceId,
} from '@user-office-software/duo-localisation';
import React from 'react';
import { useParams } from 'react-router';

import SimpleTabs from 'components/common/TabPanel';
import UOLoader from 'components/common/UOLoader';
import { useProposalData } from 'hooks/proposal/useProposalData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import ProposalContainer from './ProposalContainer';

export default function ProposalEdit() {
  const { proposalPk } = useParams<{ proposalPk: string }>();

  const { proposalData } = useProposalData(+proposalPk);

  if (!proposalData) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  if (proposalData.notified) {
    return (
      <StyledContainer>
        <StyledPaper>
          <SimpleTabs tabNames={['Comment', 'Proposal']}>
            <>
              <p>
                Decision:{' '}
                {getTranslation(proposalData.finalStatus as ResourceId)}
              </p>
              <div
                dangerouslySetInnerHTML={{
                  __html: proposalData.commentForUser || '-',
                }}
              />
            </>
            <ProposalContainer proposal={proposalData} elevation={0} />
          </SimpleTabs>
        </StyledPaper>
      </StyledContainer>
    );
  }

  return <ProposalContainer proposal={proposalData} elevation={0} />;
}
