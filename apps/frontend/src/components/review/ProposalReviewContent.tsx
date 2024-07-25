import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import React, { Fragment, useContext } from 'react';

import { useCheckAccess } from 'components/common/Can';
import SimpleTabs from 'components/common/SimpleTabs';
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
  InstrumentWithManagementTime,
  Proposal,
  Review,
  TechnicalReview,
  UserRole,
} from 'generated/sdk';
import {
  ProposalDataTechnicalReview,
  useProposalData,
} from 'hooks/proposal/useProposalData';
import { useReviewData } from 'hooks/review/useReviewData';
import { useBasicUserData } from 'hooks/user/useUserData';

import ProposalTechnicalReview from './ProposalTechnicalReview';
import ProposalTechnicalReviewerAssignment from './ProposalTechnicalReviewerAssignment';
import ReviewQuestionary from './ReviewQuestionary';
import TechnicalReviewInformation from './TechnicalReviewInformation';
import InternalReviews from '../internalReview/InternalReviews';

export enum PROPOSAL_MODAL_TAB_NAMES {
  PROPOSAL_INFORMATION = 'Proposal information',
  TECHNICAL_REVIEW = 'Technical reviews',
  REVIEWS = 'FAP reviews',
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
  const { reviewData } = useReviewData(reviewId, fapId);
  const { proposalData, setProposalData, loading } = useProposalData(
    proposalPk || reviewData?.proposal?.primaryKey
  );

  const { userData } = useBasicUserData(user.id);

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

  const getTechnicalReviewInstrument = (instrumentId: number) =>
    proposalData.instruments?.find(
      (instrument) => instrument?.id === instrumentId
    );

  const technicalReviewsContent = proposalData.technicalReviews.map(
    (technicalReview) => {
      const technicalReviewInstrument = getTechnicalReviewInstrument(
        technicalReview.instrumentId
      );

      return isUserOfficer ||
        (isInstrumentScientist &&
          technicalReview?.technicalReviewAssigneeId === user.id) ||
        isInternalReviewer ? (
        <Fragment key={technicalReview.id}>
          {!!technicalReview && (
            <InternalReviews
              technicalReviewId={technicalReview.id}
              technicalReviewSubmitted={technicalReview.submitted}
            />
          )}
          {!!technicalReviewInstrument && (
            <ProposalTechnicalReviewerAssignment
              technicalReview={technicalReview}
              instrument={technicalReviewInstrument}
              onTechnicalReviewUpdated={(
                updatedTechnicalReview: ProposalDataTechnicalReview
              ) => {
                setProposalData({
                  ...proposalData,
                  technicalReviews:
                    proposalData.technicalReviews.map((tReview) =>
                      updatedTechnicalReview.id === tReview.id
                        ? updatedTechnicalReview
                        : tReview
                    ) || [],
                });
              }}
            />
          )}
          <ProposalTechnicalReview
            proposal={proposalData as Proposal}
            data={technicalReview}
            setReview={(data: CoreTechnicalReviewFragment | null | undefined) =>
              setProposalData({
                ...proposalData,
                technicalReviews:
                  proposalData.technicalReviews.map((technicalReview) => {
                    if (technicalReview.id === data?.id) {
                      return { ...technicalReview, ...data };
                    } else {
                      return {
                        ...technicalReview,
                      };
                    }
                  }) || null,
              })
            }
          />
        </Fragment>
      ) : (
        <TechnicalReviewInformation data={technicalReview as TechnicalReview} />
      );
    }
  );

  const TechnicalReviewTab = proposalData.technicalReviews.length ? (
    proposalData.technicalReviews.length > 1 ? (
      <SimpleTabs
        orientation="vertical"
        isInsideModal={isInsideModal}
        tabNames={
          proposalData.technicalReviews?.map(
            (technicalReview) =>
              getTechnicalReviewInstrument(technicalReview.instrumentId)
                ?.name || 'None'
          ) || []
        }
      >
        {technicalReviewsContent as JSX.Element[]}
      </SimpleTabs>
    ) : (
      technicalReviewsContent
    )
  ) : (
    <div>No technical reviews found for the selected proposal</div>
  );

  if (!userData) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  const GradeTab = (
    <>{reviewData ? <ReviewQuestionary review={reviewData} /> : <></>}</>
  );

  const AllProposalReviewsTab = isUserOfficer && (
    <>
      <ExternalReviews
        reviews={proposalData.reviews as Review[]}
        faps={proposalData.faps}
      />
      <FapMeetingDecision
        fapMeetingDecisions={proposalData.fapMeetingDecisions}
        faps={proposalData.faps}
        instruments={proposalData.instruments}
      />
    </>
  );

  const ProposalAdminTab = (isUserOfficer || isInstrumentScientist) && (
    <ProposalAdmin
      data={proposalData}
      setAdministration={(data: AdministrationFormData) =>
        setProposalData({
          ...proposalData,
          ...data,
          instruments:
            proposalData.instruments?.map((instrument) => ({
              ...(instrument as InstrumentWithManagementTime),
              managementTimeAllocation:
                data.managementTimeAllocations?.find(
                  (item) => item.instrumentId === instrument?.id
                )?.value ?? null,
            })) || [],
        })
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
      case PROPOSAL_MODAL_TAB_NAMES.PROPOSAL_INFORMATION:
        return <Fragment key={index}>{ProposalInformationTab}</Fragment>;
      case PROPOSAL_MODAL_TAB_NAMES.TECHNICAL_REVIEW:
        return <Fragment key={index}>{TechnicalReviewTab}</Fragment>;
      case PROPOSAL_MODAL_TAB_NAMES.REVIEWS:
        return <Fragment key={index}>{AllProposalReviewsTab}</Fragment>;
      case PROPOSAL_MODAL_TAB_NAMES.ADMIN:
        return <Fragment key={index}>{ProposalAdminTab}</Fragment>;
      case PROPOSAL_MODAL_TAB_NAMES.LOGS:
        return <Fragment key={index}>{EventLogsTab}</Fragment>;
      case PROPOSAL_MODAL_TAB_NAMES.GRADE:
        return <Fragment key={index}>{GradeTab}</Fragment>;
      default:
        return null;
    }
  });

  return (
    <>
      {tabNames.length > 1 ? (
        <SimpleTabs tabNames={tabNames} isInsideModal={isInsideModal}>
          {tabsContent}
        </SimpleTabs>
      ) : (
        <>{tabsContent}</>
      )}
    </>
  );
};

export default ProposalReviewContent;
