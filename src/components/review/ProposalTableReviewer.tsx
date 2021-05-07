import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DoneAll from '@material-ui/icons/DoneAll';
import GetAppIcon from '@material-ui/icons/GetApp';
import RateReviewIcon from '@material-ui/icons/RateReview';
import Visibility from '@material-ui/icons/Visibility';
import MaterialTable from 'material-table';
import React, { useState, useContext, useEffect } from 'react';
import { useQueryParams, NumberParam } from 'use-query-params';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import InstrumentFilter from 'components/common/proposalFilters/InstrumentFilter';
import { DefaultQueryParams } from 'components/common/SuperMaterialTable';
import { ReviewAndAssignmentContext } from 'context/ReviewAndAssignmentContextProvider';
import {
  ProposalIdWithReviewId,
  ReviewStatus,
  SepAssignment,
  UserWithReviewsQuery,
} from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { useUserWithReviewsData } from 'hooks/user/useUserData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import ProposalReviewContent, { TabNames } from './ProposalReviewContent';
import ProposalReviewModal from './ProposalReviewModal';
import ReviewStatusFilter, {
  defaultReviewStatusQueryFilter,
} from './ReviewStatusFilter';

type UserWithReview = {
  shortCode: string;
  proposalId: number;
  title: string;
  grade: number;
  reviewId: number;
  comment: string;
  status: ReviewStatus;
};

const getFilterStatus = (selected: string | ReviewStatus) =>
  selected === ReviewStatus.SUBMITTED
    ? ReviewStatus.SUBMITTED
    : selected === ReviewStatus.DRAFT
    ? ReviewStatus.DRAFT
    : undefined; // if the selected status is not a valid status assume we want to see everything

const ProposalTableReviewer: React.FC<{ confirm: WithConfirmType }> = ({
  confirm,
}) => {
  const downloadPDFProposal = useDownloadPDFProposal();
  const { currentAssignment } = useContext(ReviewAndAssignmentContext);
  const { calls, loadingCalls } = useCallsData();
  const { instruments, loadingInstruments } = useInstrumentsData();
  const { api } = useDataApiWithFeedback();
  const [urlQueryParams, setUrlQueryParams] = useQueryParams({
    ...DefaultQueryParams,
    call: NumberParam,
    instrument: NumberParam,
    reviewStatus: defaultReviewStatusQueryFilter,
    reviewModal: NumberParam,
  });

  const [selectedProposals, setSelectedProposals] = useState<
    (ProposalIdWithReviewId & { title: string })[]
  >([]);

  const [preselectedProposalsData, setPreselectedProposalsData] = useState<
    UserWithReview[]
  >([]);

  const [selectedCallId, setSelectedCallId] = useState<number>(
    urlQueryParams.call ? urlQueryParams.call : 0
  );
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<number>(
    urlQueryParams.instrument ? urlQueryParams.instrument : 0
  );

  const {
    loading,
    userData,
    setUserData,
    setUserWithReviewsFilter,
  } = useUserWithReviewsData({
    callId: selectedCallId,
    instrumentId: selectedInstrumentId,
    status: getFilterStatus(urlQueryParams.reviewStatus),
  });

  const handleStatusFilterChange = (reviewStatus: ReviewStatus) => {
    setUrlQueryParams((queries) => ({ ...queries, reviewStatus }));
    setUserWithReviewsFilter((filter) => ({
      ...filter,
      status: getFilterStatus(reviewStatus),
    }));
  };

  useEffect(() => {
    setPreselectedProposalsData(
      userData
        ? userData.reviews.map(
            (review) =>
              ({
                shortCode: review?.proposal?.shortCode,
                proposalId: review?.proposal?.id,
                title: review?.proposal?.title,
                grade: review.grade,
                reviewId: review.id,
                comment: review.comment,
                status: review.status,
              } as UserWithReview)
          )
        : []
    );
  }, [userData]);

  useEffect(() => {
    if (urlQueryParams.selection.length > 0) {
      const selection = new Set(urlQueryParams.selection);

      setPreselectedProposalsData((preselectedProposalsData) => {
        const selected: {
          proposalId: number;
          reviewId: number;
          title: string;
        }[] = [];
        const preselected = preselectedProposalsData.map((proposal) => {
          if (selection.has(proposal.proposalId.toString())) {
            selected.push({
              proposalId: proposal.proposalId,
              reviewId: proposal.reviewId,
              title: proposal.title,
            });
          }

          return {
            ...proposal,
            tableData: {
              checked: selection.has(proposal.proposalId.toString()),
            },
          };
        });

        setSelectedProposals(selected);

        return preselected;
      });
    } else {
      setPreselectedProposalsData((proposalsData) =>
        proposalsData.map((proposal) => ({
          ...proposal,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tableData: { ...(proposal as any).tableData, checked: false },
        }))
      );
      setSelectedProposals([]);
    }
  }, [userData, urlQueryParams.selection]);

  /**
   * NOTE: Custom action buttons are here because when we have them inside actions on the material-table
   * and selection flag is true they are not working properly.
   */
  const RowActionButtons = (rowData: UserWithReview) => (
    <>
      <Tooltip title="Review proposal">
        <IconButton
          onClick={() => {
            setUrlQueryParams({ reviewModal: rowData.reviewId });
          }}
        >
          {rowData.status === 'SUBMITTED' ? <Visibility /> : <RateReviewIcon />}
        </IconButton>
      </Tooltip>
      <Tooltip title="Download Proposal">
        <IconButton
          onClick={() =>
            downloadPDFProposal([rowData.proposalId], rowData.title)
          }
        >
          <GetAppIcon />
        </IconButton>
      </Tooltip>
    </>
  );
  const GetAppIconComponent = (): JSX.Element => <GetAppIcon />;
  const DoneAllIcon = (
    props: JSX.IntrinsicAttributes & {
      children?: React.ReactNode;
      'data-cy'?: string;
    }
  ): JSX.Element => <DoneAll {...props} />;

  const columns = [
    {
      title: 'Actions',
      cellStyle: { padding: 0, minWidth: 120 },
      sorting: false,
      render: RowActionButtons,
    },
    { title: 'Proposal ID', field: 'shortCode' },
    { title: 'Title', field: 'title' },
    { title: 'Grade', field: 'grade' },
    { title: 'Review status', field: 'status' },
  ];

  const updateView = () => {
    if (currentAssignment) {
      const currentReview = (currentAssignment as SepAssignment).review;

      const userDataUpdated = {
        ...userData,
        reviews: userData?.reviews.map((review) => {
          if (review.id === currentReview?.id) {
            return {
              ...review,
              grade: currentReview.grade,
              status: currentReview.status,
            };
          } else {
            return review;
          }
        }),
      };

      setUserData(userDataUpdated as UserWithReviewsQuery['me']);
    }
  };

  // Bulk submit proposal reviews.
  const submitProposalReviews = async () => {
    if (selectedProposals?.length) {
      const shouldAddPluralLetter = selectedProposals.length > 1 ? 's' : '';
      const submitProposalReviewsInput = selectedProposals.map((proposal) => ({
        proposalId: proposal.proposalId,
        reviewId: proposal.reviewId,
      }));

      const result = await api(
        `Proposal${shouldAddPluralLetter} review submitted successfully!`
      ).submitProposalsReview({ proposals: submitProposalReviewsInput });

      const isError = !!result.submitProposalsReview.error;

      if (!isError) {
        setUserData(
          (usersData) =>
            ({
              ...usersData,
              reviews: usersData?.reviews.map((review) => {
                const submittedReview = submitProposalReviewsInput.find(
                  (submittedReviewItem) =>
                    submittedReviewItem.reviewId === review.id
                );

                if (review.id === submittedReview?.reviewId) {
                  return {
                    ...review,
                    status: ReviewStatus.SUBMITTED,
                  };
                } else {
                  return {
                    ...review,
                  };
                }
              }),
            } as UserWithReviewsQuery['me'])
        );
      }
    }
  };

  const reviewerProposalReviewTabs: TabNames[] = [
    'Proposal information',
    'Technical review',
    'Grade',
  ];

  const proposalToReview = preselectedProposalsData.find(
    (review) => review.reviewId === urlQueryParams.reviewModal
  );

  return (
    <>
      <ReviewStatusFilter
        reviewStatus={urlQueryParams.reviewStatus}
        onChange={handleStatusFilterChange}
      />
      <CallFilter
        shouldShowAll
        calls={calls}
        isLoading={loadingCalls}
        callId={selectedCallId}
        onChange={(callId) => {
          setSelectedCallId(callId);
          setUserWithReviewsFilter((filters) => ({ ...filters, callId }));
        }}
      />
      <InstrumentFilter
        shouldShowAll
        instruments={instruments}
        isLoading={loadingInstruments}
        instrumentId={selectedInstrumentId}
        onChange={(instrumentId) => {
          setSelectedInstrumentId(instrumentId);
          setUserWithReviewsFilter((filters) => ({ ...filters, instrumentId }));
        }}
      />
      <ProposalReviewModal
        title={`Review proposal: ${proposalToReview?.title} (${proposalToReview?.shortCode})`}
        proposalReviewModalOpen={!!urlQueryParams.reviewModal}
        setProposalReviewModalOpen={() => {
          setUrlQueryParams({ reviewModal: undefined });
          updateView();
        }}
      >
        <ProposalReviewContent
          reviewId={urlQueryParams.reviewModal}
          tabNames={reviewerProposalReviewTabs}
        />
      </ProposalReviewModal>
      <MaterialTable
        icons={tableIcons}
        title={'Proposals to review'}
        columns={columns}
        data={preselectedProposalsData}
        isLoading={loading}
        options={{
          search: false,
          selection: true,
        }}
        onSelectionChange={(selectedItems) => {
          setUrlQueryParams((params) => ({
            ...params,
            selection:
              selectedItems.length > 0
                ? selectedItems.map((selectedItem) =>
                    selectedItem.proposalId.toString()
                  )
                : undefined,
          }));
        }}
        localization={{
          toolbar: {
            nRowsSelected: '{0} proposal(s) selected',
          },
        }}
        actions={[
          {
            icon: GetAppIconComponent,
            tooltip: 'Download proposals',
            onClick: () => {
              downloadPDFProposal(
                selectedProposals.map((proposal) => proposal.proposalId),
                selectedProposals[0].title
              );
            },
            position: 'toolbarOnSelect',
          },
          {
            icon: DoneAllIcon.bind(null, {
              'data-cy': 'submit-proposal-reviews',
            }),
            tooltip: 'Submit proposal reviews',
            onClick: () => {
              const reviewsToSubmit = userData?.reviews.filter((review) =>
                selectedProposals.find(
                  (rowItem) => rowItem.reviewId === review.id
                )
              );
              const shouldShowAlert = reviewsToSubmit?.some(
                (reviewToSubmit) =>
                  reviewToSubmit.status === ReviewStatus.SUBMITTED
              );

              confirm(
                () => {
                  submitProposalReviews();
                },
                {
                  title: 'Submit proposal reviews',
                  description:
                    'No further changes to proposal reviews are possible after submission. Are you sure you want to submit the proposal reviews?',
                  alertText: shouldShowAlert
                    ? 'Some of the selected proposals have already submitted reviews.'
                    : '',
                }
              )();
            },
            position: 'toolbarOnSelect',
          },
        ]}
      />
    </>
  );
};

export default withConfirm(ProposalTableReviewer);
