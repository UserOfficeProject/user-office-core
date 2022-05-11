import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import React, { Fragment, useContext } from 'react';

import { useCheckAccess } from 'components/common/Can';
import SimpleTabs from 'components/common/TabPanel';
import UOLoader from 'components/common/UOLoader';
import EventLogList from 'components/eventLog/EventLogList';
import GeneralInformation from 'components/proposal/GeneralInformation';
import ProposalAdmin, {
  AdministrationFormData,
} from 'components/proposal/ProposalAdmin';
import ExternalReviews from 'components/SEP/MeetingComponents/ProposalViewModal/ExternalReviews';
import SEPMeetingDecision from 'components/SEP/MeetingComponents/ProposalViewModal/SEPMeetingDecision';
import { UserContext } from 'context/UserContextProvider';
import {
  CoreTechnicalReviewFragment,
  Proposal,
  Review,
  TechnicalReview,
  UserRole,
} from 'generated/sdk';
import { useProposalData } from 'hooks/proposal/useProposalData';
import { useReviewData } from 'hooks/review/useReviewData';
import { StyledPaper } from 'styles/StyledComponents';

import ProposalGrade from './ProposalGrade';
import ProposalTechnicalReview from './ProposalTechnicalReview';
import ProposalTechnicalReviewerAssignment from './ProposalTechnicalReviewerAssignment';
import TechnicalReviewInformation from './TechnicalReviewInformation';

export enum PROPOSAL_MODAL_TAB_NAMES {
  PROPOSAL_INFORMATION = 'Proposal information',
  TECHNICAL_REVIEW = 'Technical review',
  REVIEWS = 'Reviews',
  ADMIN = 'Admin',
  GRADE = 'Grade',
  LOGS = 'Logs',
}

type ProposalReviewContentProps = {
  tabNames: PROPOSAL_MODAL_TAB_NAMES[];
  proposalPk?: number | null;
  reviewId?: number | null;
  sepId?: number | null;
  isInsideModal?: boolean;
};

const ProposalReviewContent: React.FC<ProposalReviewContentProps> = ({
  proposalPk,
  tabNames,
  reviewId,
  sepId,
  isInsideModal,
}) => {
  const { user } = useContext(UserContext);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const { reviewData, setReviewData } = useReviewData(reviewId, sepId);
  const { proposalData, setProposalData, loading } = useProposalData(
    proposalPk || reviewData?.proposal?.primaryKey
  );

  if (loading) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  if (!proposalData) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center">
        <h2>Proposal not found</h2>
        <Button variant="text" onClick={() => console.log('Not implemented')}>
          Retry
        </Button>
      </Box>
    );
  }

  const ProposalInformationTab = (
    <GeneralInformation
      data={proposalData}
      onProposalChanged={(newProposal): void =>
        setProposalData({
          ...proposalData,
          ...newProposal,
          call: proposalData.call,
        })
      }
    />
  );

  const TechnicalReviewTab =
    isUserOfficer ||
    proposalData.technicalReview?.technicalReviewAssigneeId === user.id ? (
      <>
        {!!proposalData.instrument && (
          <ProposalTechnicalReviewerAssignment
            proposalData={proposalData}
            setProposalData={setProposalData}
          />
        )}
        <ProposalTechnicalReview
          proposal={proposalData as Proposal}
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
      </>
    ) : (
      <TechnicalReviewInformation
        data={proposalData.technicalReview as TechnicalReview}
      />
    );

  const GradeTab = (
    <ProposalGrade
      onChange={() => {}}
      review={reviewData}
      setReview={setReviewData}
    />
  );

  const AllProposalReviewsTab = isUserOfficer && (
    <>
      <ExternalReviews reviews={proposalData.reviews as Review[]} />
      <SEPMeetingDecision
        sepMeetingDecision={proposalData.sepMeetingDecision}
        sep={proposalData.sep}
      />
    </>
  );

  const ProposalAdminTab = isUserOfficer && (
    <ProposalAdmin
      data={proposalData}
      setAdministration={(data: AdministrationFormData) =>
        setProposalData({ ...proposalData, ...data })
      }
    />
  );

  const EventLogsTab = isUserOfficer && (
    <EventLogList
      changedObjectId={proposalData.primaryKey}
      eventType="PROPOSAL"
    />
  );

  const tabsContent = tabNames.map((tab, index) => {
    switch (tab) {
      case 'Proposal information':
        return <Fragment key={index}>{ProposalInformationTab}</Fragment>;
      case 'Technical review':
        return <Fragment key={index}>{TechnicalReviewTab}</Fragment>;
      case 'Reviews':
        return <Fragment key={index}>{AllProposalReviewsTab}</Fragment>;
      case 'Admin':
        return <Fragment key={index}>{ProposalAdminTab}</Fragment>;
      case 'Logs':
        return <Fragment key={index}>{EventLogsTab}</Fragment>;
      case 'Grade':
        return <Fragment key={index}>{GradeTab}</Fragment>;
      default:
        return null;
    }
  });

  return (
    <StyledPaper>
      {tabNames.length > 1 ? (
        <SimpleTabs tabNames={tabNames} isInsideModal={isInsideModal}>
          {tabsContent}
        </SimpleTabs>
      ) : (
        <>{tabsContent}</>
      )}
    </StyledPaper>
  );
};

export default ProposalReviewContent;
