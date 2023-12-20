import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React, { Fragment, useContext } from 'react';

import { useCheckAccess } from 'components/common/Can';
import SimpleTabs from 'components/common/TabPanel';
import UOLoader from 'components/common/UOLoader';
import EventLogList from 'components/eventLog/EventLogList';
import ExternalReviews from 'components/fap/MeetingComponents/ProposalViewModal/ExternalReviews';
import FapMeetingDecision from 'components/fap/MeetingComponents/ProposalViewModal/FapMeetingDecision';
import GeneralInformation from 'components/proposal/GeneralInformation';
import ProposalAdmin, {
  AdministrationFormData,
} from 'components/proposal/ProposalAdmin';
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

import InternalReviews from '../internalReview/InternalReviews';
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
  fapId?: number | null;
  isInsideModal?: boolean;
};

const ProposalReviewContent = ({
  proposalPk,
  tabNames,
  reviewId,
  fapId,
  isInsideModal,
}: ProposalReviewContentProps) => {
  const { user } = useContext(UserContext);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const isInstrumentScientist = useCheckAccess([UserRole.INSTRUMENT_SCIENTIST]);
  const isInternalReviewer = useCheckAccess([UserRole.INTERNAL_REVIEWER]);
  const { reviewData, setReviewData } = useReviewData(reviewId, fapId);
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

  const TechnicalReviewTab = proposalData.technicalReviews?.map(
    (technicalReview) => {
      return isUserOfficer ||
        (isInstrumentScientist &&
          technicalReview?.technicalReviewAssigneeId === user.id) ||
        isInternalReviewer ? (
        <>
          <Typography variant="h6" component="h2" gutterBottom>
            Review for instrument: {technicalReview.instrumentId}
          </Typography>
          {!!technicalReview && (
            <InternalReviews
              technicalReviewId={technicalReview.id}
              technicalReviewSubmitted={technicalReview.submitted}
            />
          )}
          {!!proposalData.instrument && (
            <ProposalTechnicalReviewerAssignment
              proposalData={proposalData}
              setProposalData={setProposalData}
            />
          )}
          <ProposalTechnicalReview
            proposal={proposalData as Proposal}
            data={technicalReview}
            setReview={(data: CoreTechnicalReviewFragment | null | undefined) =>
              setProposalData({
                ...proposalData,
                technicalReviews: [
                  {
                    ...technicalReview,
                    ...data,
                  },
                ],
              })
            }
          />
        </>
      ) : (
        <TechnicalReviewInformation data={technicalReview as TechnicalReview} />
      );
    }
  );

  const GradeTab = (
    <ProposalGrade
      onChange={() => {}}
      review={reviewData}
      setReview={setReviewData}
      fapId={fapId as number} //grade is only used within Fap
    />
  );

  const AllProposalReviewsTab = isUserOfficer && (
    <>
      <ExternalReviews reviews={proposalData.reviews as Review[]} />
      <FapMeetingDecision
        fapMeetingDecision={proposalData.fapMeetingDecision}
        fap={proposalData.fap}
      />
    </>
  );

  const ProposalAdminTab = (isUserOfficer || isInstrumentScientist) && (
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
