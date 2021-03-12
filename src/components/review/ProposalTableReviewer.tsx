import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import GetAppIcon from '@material-ui/icons/GetApp';
import RateReviewIcon from '@material-ui/icons/RateReview';
import Visibility from '@material-ui/icons/Visibility';
import MaterialTable from 'material-table';
import React, { useState, useContext } from 'react';
import { useQueryParams, NumberParam } from 'use-query-params';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import InstrumentFilter from 'components/common/proposalFilters/InstrumentFilter';
import { ReviewAndAssignmentContext } from 'context/ReviewAndAssignmentContextProvider';
import {
  ReviewStatus,
  SepAssignment,
  UserWithReviewsQuery,
} from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { useUserWithReviewsData } from 'hooks/user/useUserData';
import { tableIcons } from 'utils/materialIcons';

import ProposalReviewModal from './ProposalReviewModal';
import ProposalReview from './ProposalReviewReviewer';
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

const ProposalTableReviewer: React.FC = () => {
  const downloadPDFProposal = useDownloadPDFProposal();
  const { currentAssignment } = useContext(ReviewAndAssignmentContext);
  const { calls, loadingCalls } = useCallsData();
  const { instruments, loadingInstruments } = useInstrumentsData();
  const [urlQueryParams, setUrlQueryParams] = useQueryParams({
    call: NumberParam,
    instrument: NumberParam,
    reviewStatus: defaultReviewStatusQueryFilter,
    reviewModal: NumberParam,
  });

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

  const reviewData = userData
    ? (userData.reviews.map((review) => {
        return {
          shortCode: review?.proposal?.shortCode,
          proposalId: review?.proposal?.id,
          title: review?.proposal?.title,
          grade: review.grade,
          reviewId: review.id,
          comment: review.comment,
          status: review.status,
        };
      }) as UserWithReview[])
    : [];

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
        title="Review"
        proposalReviewModalOpen={!!urlQueryParams.reviewModal}
        setProposalReviewModalOpen={() => {
          setUrlQueryParams({ reviewModal: undefined });
          updateView();
        }}
      >
        <ProposalReview reviewId={urlQueryParams.reviewModal} />
      </ProposalReviewModal>
      <MaterialTable
        icons={tableIcons}
        title={'Proposals to review'}
        columns={columns}
        data={reviewData}
        isLoading={loading}
        options={{
          search: false,
          selection: true,
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
            onClick: (event, rowData) => {
              downloadPDFProposal(
                (rowData as UserWithReview[]).map((row) => row.proposalId),
                (rowData as UserWithReview[])[0].title
              );
            },
            position: 'toolbarOnSelect',
          },
        ]}
      />
    </>
  );
};

export default ProposalTableReviewer;
