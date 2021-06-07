import { Button, Link, makeStyles, Paper, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import React, { Fragment, useContext, useState } from 'react';

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
  Review,
  TechnicalReview,
  UserRole,
} from 'generated/sdk';
import { ProposalData, useProposalData } from 'hooks/proposal/useProposalData';
import { useReviewData } from 'hooks/review/useReviewData';

import AssignTechnicalReview from './AssignTechnicalReview';
import ProposalGrade from './ProposalGrade';
import ProposalTechnicalReview from './ProposalTechnicalReview';
import TechnicalReviewInformation from './TechnicalReviewInformation';

export type TabNames =
  | 'Proposal information'
  | 'Technical review'
  | 'Reviews'
  | 'Admin'
  | 'Grade'
  | 'Logs';

type ProposalReviewContentProps = {
  tabNames: TabNames[];
  proposalId?: number | null;
  reviewId?: number | null;
  sepId?: number | null;
  isInsideModal?: boolean;
};

const useStyles = makeStyles((theme) => ({
  reassignContainer: {
    padding: theme.spacing(2),
    marginTop: 0,
    marginBottom: theme.spacing(6),
  },
  showReassignLink: {
    cursor: 'pointer',
  },
}));

const ProposalReviewContent: React.FC<ProposalReviewContentProps> = ({
  proposalId,
  tabNames,
  reviewId,
  sepId,
  isInsideModal,
}) => {
  const classes = useStyles();
  const { user } = useContext(UserContext);
  const [showReassign, setShowReassign] = useState(false);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const { reviewData, setReviewData } = useReviewData(reviewId, sepId);
  const { proposalData, setProposalData, loading } = useProposalData(
    proposalId || reviewData?.proposal?.id
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

  const assignAnotherReviewerView = (proposal: ProposalData) => {
    if (proposal.technicalReview?.submitted) {
      return null;
    }

    return (
      <Paper elevation={1} className={classes.reassignContainer}>
        <Typography variant="h6" gutterBottom>
          Assign to someone else?
        </Typography>
        If you think there is a better candidate to do the review for the
        proposal, you can re-assign it to someone else
        <div>
          {showReassign ? (
            <AssignTechnicalReview
              proposal={proposal}
              onProposalUpdated={(updatedProposal) => {
                setProposalData(updatedProposal);
                setShowReassign(false);
              }}
            />
          ) : (
            <Link
              onClick={() => setShowReassign(true)}
              className={classes.showReassignLink}
              data-cy="re-assign"
            >
              Re-assign...
            </Link>
          )}
        </div>
      </Paper>
    );
  };

  const TechnicalReviewTab =
    isUserOfficer || proposalData.technicalReviewAssignee === user.id ? (
      <>
        {assignAnotherReviewerView(proposalData)}
        <ProposalTechnicalReview
          proposal={proposalData}
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
    <EventLogList changedObjectId={proposalData.id} eventType="PROPOSAL" />
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
        break;
    }
  });

  return (
    <SimpleTabs tabNames={tabNames} isInsideModal={isInsideModal}>
      {tabsContent}
    </SimpleTabs>
  );
};

export default ProposalReviewContent;
