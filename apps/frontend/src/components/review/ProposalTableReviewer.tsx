import MaterialTable, { Column } from '@material-table/core';
import DoneAll from '@mui/icons-material/DoneAll';
import GetAppIcon from '@mui/icons-material/GetApp';
import RateReviewIcon from '@mui/icons-material/RateReview';
import Visibility from '@mui/icons-material/Visibility';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { proposalGradeValidationSchema } from '@user-office-software/duo-validation';
import { TFunction } from 'i18next';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryParams, NumberParam } from 'use-query-params';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import InstrumentFilter from 'components/common/proposalFilters/InstrumentFilter';
import { DefaultQueryParams } from 'components/common/SuperMaterialTable';
import {
  ReviewerFilter,
  ReviewStatus,
  UserWithReviewsQuery,
} from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { useUserWithReviewsData } from 'hooks/user/useUserData';
import {
  capitalize,
  denseTableColumns,
  setSortDirectionOnSortColumn,
} from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import ProposalReviewContent, {
  PROPOSAL_MODAL_TAB_NAMES,
} from './ProposalReviewContent';
import ProposalReviewModal from './ProposalReviewModal';
import ReviewStatusFilter, {
  defaultReviewStatusQueryFilter,
} from './ReviewStatusFilter';

type UserWithReview = {
  proposalId: string;
  proposalPk: number;
  title: string;
  grade: number | null;
  reviewId: number;
  comment: string | null;
  status: ReviewStatus;
  callShortCode?: string;
  instrumentShortCode?: string;
};

const getFilterStatus = (selected: string | ReviewStatus) =>
  selected === ReviewStatus.SUBMITTED
    ? ReviewStatus.SUBMITTED
    : selected === ReviewStatus.DRAFT
    ? ReviewStatus.DRAFT
    : undefined; // if the selected status is not a valid status assume we want to see everything

const columns: (
  t: TFunction<'translation', undefined, 'translation'>
) => Column<UserWithReview>[] = (t) =>
  denseTableColumns([
    {
      title: 'Actions',
      cellStyle: { padding: 0, minWidth: 120 },
      sorting: false,
      field: 'rowActions',
    },
    { title: 'Proposal ID', field: 'proposalId' },
    { title: 'Title', field: 'title' },
    { title: 'Grade', field: 'grade' },
    {
      title: 'Review status',
      render: (user) => capitalize(user.status),
      customSort: (a, b) => a.status.localeCompare(b.status),
    },
    { title: 'Call', field: 'callShortCode' },
    { title: t('instrument') as string, field: 'instrumentShortCode' },
  ]);

const ProposalTableReviewer = ({ confirm }: { confirm: WithConfirmType }) => {
  const downloadPDFProposal = useDownloadPDFProposal();
  const { calls, loadingCalls } = useCallsData();
  const { instruments, loadingInstruments } = useInstrumentsData();
  const { api } = useDataApiWithFeedback();
  const { t } = useTranslation();
  const [urlQueryParams, setUrlQueryParams] = useQueryParams({
    ...DefaultQueryParams,
    call: NumberParam,
    instrument: NumberParam,
    reviewStatus: defaultReviewStatusQueryFilter,
    reviewModal: NumberParam,
    modalTab: NumberParam,
  });

  const [preselectedProposalsData, setPreselectedProposalsData] = useState<
    UserWithReview[]
  >([]);

  const [selectedCallId, setSelectedCallId] = useState<number>(
    urlQueryParams.call || 0
  );
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<number>(
    urlQueryParams.instrument || 0
  );

  const { loading, userData, setUserData, setUserWithReviewsFilter } =
    useUserWithReviewsData({
      callId: selectedCallId,
      instrumentId: selectedInstrumentId,
      status: getFilterStatus(urlQueryParams.reviewStatus),
      reviewer: ReviewerFilter.ME,
    });

  useEffect(() => {
    const getProposalsToGradeDataFromUserData = (
      selection?: Set<string | null>
    ) =>
      userData?.reviews.map((review) => ({
        proposalId: review.proposal!.proposalId,
        proposalPk: review.proposal!.primaryKey,
        title: review.proposal!.title,
        grade: review.grade,
        reviewId: review.id,
        comment: review.comment,
        status: review.status,
        callShortCode: review.proposal!.call?.shortCode,
        instrumentShortCode: review.proposal!.instrument?.shortCode,
        tableData: {
          checked:
            selection?.has(review.proposal!.primaryKey.toString() || null) ||
            false,
        },
      })) || [];

    if (urlQueryParams.selection.length > 0) {
      const selection = new Set(urlQueryParams.selection);
      setPreselectedProposalsData(
        getProposalsToGradeDataFromUserData(selection)
      );
    } else {
      setPreselectedProposalsData(getProposalsToGradeDataFromUserData());
    }
  }, [userData, urlQueryParams.selection]);

  const reviewerProposalReviewTabs = [
    PROPOSAL_MODAL_TAB_NAMES.PROPOSAL_INFORMATION,
    PROPOSAL_MODAL_TAB_NAMES.TECHNICAL_REVIEW,
    PROPOSAL_MODAL_TAB_NAMES.GRADE,
  ];

  const GetAppIconComponent = (): JSX.Element => <GetAppIcon />;
  const DoneAllIcon = (
    props: JSX.IntrinsicAttributes & {
      children?: React.ReactNode;
      'data-cy'?: string;
    }
  ): JSX.Element => <DoneAll {...props} />;

  const sortedColumns = setSortDirectionOnSortColumn(
    columns(t),
    urlQueryParams.sortColumn,
    urlQueryParams.sortDirection
  );

  /**
   * NOTE: Custom action buttons are here because when we have them inside actions on the material-table
   * and selection flag is true they are not working properly.
   */
  const RowActionButtons = (rowData: UserWithReview) => (
    <>
      {!loading && (
        <Tooltip
          title={
            rowData.status === ReviewStatus.DRAFT
              ? 'Grade proposal'
              : 'View proposal'
          }
        >
          <IconButton
            onClick={() => {
              setUrlQueryParams({
                reviewModal: rowData.reviewId,
                modalTab:
                  rowData.status === ReviewStatus.DRAFT
                    ? reviewerProposalReviewTabs.indexOf(
                        PROPOSAL_MODAL_TAB_NAMES.GRADE
                      )
                    : reviewerProposalReviewTabs.indexOf(
                        PROPOSAL_MODAL_TAB_NAMES.PROPOSAL_INFORMATION
                      ),
              });
            }}
          >
            {rowData.status === ReviewStatus.DRAFT ? (
              <RateReviewIcon data-cy="grade-proposal-icon" />
            ) : (
              <Visibility data-cy="view-proposal-details-icon" />
            )}
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Download Proposal">
        <IconButton
          onClick={() =>
            downloadPDFProposal([rowData.proposalPk], rowData.title)
          }
        >
          <GetAppIcon />
        </IconButton>
      </Tooltip>
    </>
  );

  const updateView = async (reviewId?: number | null) => {
    if (!reviewId) {
      return;
    }

    const { review: freshReview } = await api().getReview({
      reviewId: reviewId,
    });

    if (freshReview) {
      const userDataUpdated = {
        ...userData,
        reviews: userData?.reviews.map((review) => {
          if (review.id === freshReview.id) {
            return {
              ...review,
              grade: freshReview.grade,
              status: freshReview.status,
              comment: freshReview.comment,
            };
          } else {
            return review;
          }
        }),
      };

      setUserData(userDataUpdated as UserWithReviewsQuery['me']);
    }
  };

  const handleStatusFilterChange = (reviewStatus: ReviewStatus) => {
    setUrlQueryParams((queries) => ({ ...queries, reviewStatus }));
    setUserWithReviewsFilter((filter) => ({
      ...filter,
      status: getFilterStatus(reviewStatus),
    }));
  };

  const handleColumnSelectionChange = (selectedItems: UserWithReview[]) => {
    setUrlQueryParams((params) => ({
      ...params,
      selection:
        selectedItems.length > 0
          ? selectedItems.map((selectedItem) =>
              selectedItem.proposalPk.toString()
            )
          : undefined,
    }));
  };

  const handleColumnSortOrderChange = (
    orderedColumnId: number,
    orderDirection: 'desc' | 'asc'
  ) => {
    setUrlQueryParams((params) => ({
      ...params,
      sortColumn: orderedColumnId >= 0 ? orderedColumnId : undefined,
      sortDirection: orderDirection ? orderDirection : undefined,
    }));
  };

  const handleBulkDownLoadClick = (
    _: React.MouseEventHandler<HTMLButtonElement>,
    selectedProposals: UserWithReview | UserWithReview[]
  ) => {
    if (!Array.isArray(selectedProposals)) {
      return;
    }

    downloadPDFProposal(
      selectedProposals.map((proposal) => proposal.proposalPk),
      selectedProposals[0].title
    );
  };

  const submitProposalReviews = async (selectedProposals: UserWithReview[]) => {
    if (selectedProposals?.length) {
      const shouldAddPluralLetter = selectedProposals.length > 1 ? 's' : '';
      const submitProposalReviewsInput = selectedProposals.map((proposal) => ({
        proposalPk: proposal.proposalPk,
        reviewId: proposal.reviewId,
      }));

      await api({
        toastSuccessMessage: `Proposal${shouldAddPluralLetter} review submitted successfully!`,
      }).submitProposalsReview({ proposals: submitProposalReviewsInput });

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
  };

  const handleBulkReviewsSubmitClick = async (
    _: React.MouseEventHandler<HTMLButtonElement>,
    selectedProposals: UserWithReview | UserWithReview[]
  ) => {
    if (!Array.isArray(selectedProposals)) {
      return;
    }

    const invalid = [];

    for await (const proposal of selectedProposals) {
      const isValidSchema = await proposalGradeValidationSchema.isValid(
        proposal
      );
      if (!isValidSchema) {
        invalid.push(proposal);
      }
    }

    confirm(
      async () => {
        await submitProposalReviews(selectedProposals);
      },
      {
        title: 'Submit proposal reviews',
        description:
          'No further changes to proposal reviews are possible after submission. Are you sure you want to submit the proposal reviews?',
        alertText:
          invalid.length > 0
            ? `Some of the selected proposals are missing review grade or comment. Please correct the grade and comment for the proposal(s) with ID: ${invalid
                .map((proposal) => proposal.proposalId)
                .join(', ')}`
            : '',
      }
    )();
  };

  const proposalToReview = preselectedProposalsData.find(
    (review) => review.reviewId === urlQueryParams.reviewModal
  );

  const preselectedProposalsDataWithIdAndRowActions =
    preselectedProposalsData.map((proposal) => ({
      ...proposal,
      id: proposal.proposalPk,
      rowActions: RowActionButtons(proposal),
    }));

  return (
    <>
      <Grid container spacing={2}>
        <Grid item sm={3} xs={12}>
          <ReviewStatusFilter
            reviewStatus={urlQueryParams.reviewStatus}
            onChange={handleStatusFilterChange}
          />
        </Grid>
        <Grid item sm={3} xs={12}>
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
        </Grid>
        <Grid item sm={3} xs={12}>
          <InstrumentFilter
            shouldShowAll
            instruments={instruments}
            isLoading={loadingInstruments}
            instrumentId={selectedInstrumentId}
            onChange={(instrumentId) => {
              setSelectedInstrumentId(instrumentId);
              setUserWithReviewsFilter((filters) => ({
                ...filters,
                instrumentId,
              }));
            }}
          />
        </Grid>
      </Grid>
      <ProposalReviewModal
        title={`Proposal: ${proposalToReview?.title} (${proposalToReview?.proposalId})`}
        proposalReviewModalOpen={!!urlQueryParams.reviewModal}
        setProposalReviewModalOpen={() => {
          updateView(urlQueryParams.reviewModal);
          setUrlQueryParams({ reviewModal: undefined, modalTab: undefined });
        }}
      >
        <ProposalReviewContent
          reviewId={urlQueryParams.reviewModal}
          tabNames={reviewerProposalReviewTabs}
          fapId={
            userData?.reviews.find((review) => {
              return (
                review.proposal?.proposalId === proposalToReview?.proposalId
              );
            })?.fapID
          }
        />
      </ProposalReviewModal>
      <MaterialTable
        icons={tableIcons}
        title={'Proposals to grade'}
        columns={sortedColumns}
        data={preselectedProposalsDataWithIdAndRowActions}
        isLoading={loading}
        options={{
          search: false,
          selection: true,
          headerSelectionProps: {
            inputProps: { 'aria-label': 'Select All Rows' },
          },
          selectionProps: (rowData: UserWithReview) => ({
            inputProps: {
              'aria-label': `${rowData.title}-select`,
            },
          }),
        }}
        onSelectionChange={handleColumnSelectionChange}
        onOrderChange={handleColumnSortOrderChange}
        localization={{
          toolbar: {
            nRowsSelected: '{0} proposal(s) selected',
          },
        }}
        actions={[
          {
            icon: GetAppIconComponent,
            tooltip: 'Download proposals',
            onClick: handleBulkDownLoadClick,
            position: 'toolbarOnSelect',
          },
          {
            icon: DoneAllIcon.bind(null, {
              'data-cy': 'submit-proposal-reviews',
            }),
            tooltip: 'Submit proposal reviews',
            onClick: handleBulkReviewsSubmitClick,
            position: 'toolbarOnSelect',
          },
        ]}
      />
    </>
  );
};

export default withConfirm(ProposalTableReviewer);
