import { Column, OrderByCollection } from '@material-table/core';
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
import { useSearchParams } from 'react-router-dom';

import MaterialTable from 'components/common/DenseMaterialTable';
import CallFilter from 'components/common/proposalFilters/CallFilter';
import InstrumentFilter from 'components/common/proposalFilters/InstrumentFilter';
import {
  ReviewerFilter,
  ReviewStatus,
  UserWithReviewsQuery,
} from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { useUserWithReviewsData } from 'hooks/user/useUserData';
import { capitalize, setSortDirectionOnSortField } from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import ProposalReviewContent, {
  PROPOSAL_MODAL_TAB_NAMES,
} from './ProposalReviewContent';
import ProposalReviewModal from './ProposalReviewModal';
import ReviewStatusFilter from './ReviewStatusFilter';

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
  t: TFunction<'translation', undefined>
) => Column<UserWithReview>[] = (t) => [
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
];

const ProposalTableReviewer = ({ confirm }: { confirm: WithConfirmType }) => {
  const downloadPDFProposal = useDownloadPDFProposal();
  const { calls, loadingCalls } = useCallsData();
  const { instruments, loadingInstruments } = useInstrumentsData();
  const { api } = useDataApiWithFeedback();
  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();
  const call = searchParams.get('call');
  const instrument = searchParams.get('instrument');
  const reviewStatus = searchParams.get('reviewStatus') ?? ReviewStatus.DRAFT;
  const reviewModal = searchParams.get('reviewModal');
  const selection = searchParams.getAll('selection');
  const sortField = searchParams.get('sortField');
  const sortDirection = searchParams.get('sortDirection');

  const [preselectedProposalsData, setPreselectedProposalsData] = useState<
    UserWithReview[]
  >([]);

  const [selectedCallId, setSelectedCallId] = useState<number>(
    call ? +call : 0
  );
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<
    number | null | undefined
  >(instrument ? +instrument : null);

  const { loading, userData, setUserData, setUserWithReviewsFilter } =
    useUserWithReviewsData({
      callId: selectedCallId,
      instrumentId: selectedInstrumentId,
      status: getFilterStatus(reviewStatus),
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
        instrumentShortCodes: review.proposal!.instruments?.map(
          (instrument) => instrument?.shortCode
        ),
        tableData: {
          checked:
            selection?.has(review.proposal!.primaryKey.toString() || null) ||
            false,
        },
      })) || [];

    if (selection.length > 0) {
      const selectionSet = new Set(selection);
      setPreselectedProposalsData(
        getProposalsToGradeDataFromUserData(selectionSet)
      );
    } else {
      setPreselectedProposalsData(getProposalsToGradeDataFromUserData());
    }
  }, [userData, selection]);

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

  const sortedColumns = setSortDirectionOnSortField(
    columns(t),
    sortField,
    sortDirection
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
              setSearchParams((searchParams) => {
                searchParams.set('reviewModal', rowData.reviewId.toString());
                searchParams.set(
                  'modalTab',
                  rowData.status === ReviewStatus.DRAFT
                    ? reviewerProposalReviewTabs
                        .indexOf(PROPOSAL_MODAL_TAB_NAMES.GRADE)
                        .toString()
                    : reviewerProposalReviewTabs
                        .indexOf(PROPOSAL_MODAL_TAB_NAMES.PROPOSAL_INFORMATION)
                        .toString()
                );

                return searchParams;
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
    setSearchParams((searchParams) => {
      searchParams.set('reviewStatus', reviewStatus);

      return searchParams;
    });
    setUserWithReviewsFilter((filter) => ({
      ...filter,
      status: getFilterStatus(reviewStatus),
    }));
  };

  const handleColumnSelectionChange = (selectedItems: UserWithReview[]) => {
    setSearchParams((searchParams) => {
      searchParams.delete('selection');
      if (selectedItems.length > 0) {
        selectedItems.forEach((selectedItem) => {
          searchParams.append('selection', selectedItem.proposalPk.toString());
        });
      }

      return searchParams;
    });
  };

  const handleColumnSortOrderChange = (
    orderByCollection: OrderByCollection[]
  ) => {
    const [orderBy] = orderByCollection;

    setSearchParams((searchParams) => {
      searchParams.set('sortField', orderBy?.orderByField);
      searchParams.set('sortDirection', orderBy?.orderDirection);

      return searchParams;
    });
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
          }) as UserWithReviewsQuery['me']
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
      const isValidSchema =
        await proposalGradeValidationSchema.isValid(proposal);
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
    (review) => reviewModal && review.reviewId === +reviewModal
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
            reviewStatus={reviewStatus}
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
            onChange={(instrumentFilter) => {
              setSelectedInstrumentId(instrumentFilter.instrumentId);
              setUserWithReviewsFilter((filters) => ({
                ...filters,
                instrumentId: instrumentFilter.instrumentId,
              }));
            }}
          />
        </Grid>
      </Grid>
      <ProposalReviewModal
        title={`Proposal: ${proposalToReview?.title} (${proposalToReview?.proposalId})`}
        proposalReviewModalOpen={!!reviewModal}
        setProposalReviewModalOpen={() => {
          updateView(reviewModal ? +reviewModal : undefined);

          setSearchParams((searchParams) => {
            searchParams.delete('reviewModal');
            searchParams.delete('modalTab');

            return searchParams;
          });
        }}
      >
        <ProposalReviewContent
          proposalPk={proposalToReview?.proposalPk}
          reviewId={reviewModal ? +reviewModal : undefined}
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
        onOrderCollectionChange={handleColumnSortOrderChange}
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
