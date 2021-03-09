import { Button } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import React from 'react';

import { useCheckAccess } from 'components/common/Can';
import SimpleTabs from 'components/common/TabPanel';
import UOLoader from 'components/common/UOLoader';
import EventLogList from 'components/eventLog/EventLogList';
import GeneralInformation from 'components/proposal/GeneralInformation';
import ProposalAdmin, {
  AdministrationFormData,
} from 'components/proposal/ProposalAdmin';
import {
  CoreTechnicalReviewFragment,
  TechnicalReview,
  UserRole,
} from 'generated/sdk';
import { useProposalData } from 'hooks/proposal/useProposalData';

import ProposalTechnicalReview from './ProposalTechnicalReview';

type ProposalReviewProps = {
  proposalId: number;
  isInsideModal?: boolean;
};

const ProposalReview: React.FC<ProposalReviewProps> = ({
  proposalId,
  isInsideModal,
}) => {
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const { proposalData, setProposalData, loading } = useProposalData(
    proposalId
  );

  if (loading) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  if (!proposalData) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center">
        <h2>Proposal not found</h2>
        <Button onClick={() => console.log('Not implemented')}>Retry</Button>
      </Box>
    );
  }

  const tabNames = ['General', 'Technical'];

  if (isUserOfficer) {
    tabNames.push('Admin');
    tabNames.push('Logs');
  }

  return (
    <SimpleTabs tabNames={tabNames} isInsideModal={isInsideModal}>
      <GeneralInformation
        data={proposalData}
        onProposalChanged={(newProposal): void => setProposalData(newProposal)}
      />
      <ProposalTechnicalReview
        id={proposalData.id}
        data={proposalData.technicalReview}
        setReview={(data: CoreTechnicalReviewFragment | null | undefined) =>
          setProposalData({
            ...proposalData,
            technicalReview: {
              ...proposalData.technicalReview,
              ...data,
            } as TechnicalReview,
          })
        }
      />
      {isUserOfficer && (
        <ProposalAdmin
          data={proposalData}
          setAdministration={(data: AdministrationFormData) =>
            setProposalData({ ...proposalData, ...data })
          }
        />
      )}
      {isUserOfficer && (
        <EventLogList changedObjectId={proposalData.id} eventType="PROPOSAL" />
      )}
    </SimpleTabs>
  );
};

export default ProposalReview;
