import { Action, Column } from '@material-table/core';
import GetAppIcon from '@mui/icons-material/GetApp';
import Visibility from '@mui/icons-material/Visibility';
import { IconButton, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import CopyToClipboard from 'components/common/CopyToClipboard';
import MaterialTable from 'components/common/DenseMaterialTable';
import FapAssignedReviewersTable from 'components/fap/Proposals/FapAssignedReviewersTable';
import ProposalReviewContent, {
  PROPOSAL_MODAL_TAB_NAMES,
} from 'components/review/ProposalReviewContent';
import ProposalReviewModal from 'components/review/ProposalReviewModal';
import { Review, SettingsId, Fap } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import {
  FapProposalType,
  FapProposalAssignmentType,
  FapProposals,
} from 'hooks/fap/useFapProposalsData';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { tableIcons } from 'utils/materialIcons';
import {
  average,
  getGradesFromReviews,
  standardDeviation,
} from 'utils/mathFunctions';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

type FapLegacyProposalsTableProps = {
  /** Fap we are assigning members to */
  data: Fap;
  /** Call this function in case of Fap assigned members update */
  onAssignmentsUpdate: (fap: Fap) => void;
  /** Call id that we want to filter by */
  selectedCallId: number | null;
  /** Confirmation function that comes from withConfirm HOC */
  confirm: WithConfirmType;
  selectedInstrumentId: number | null;
  fapProposals: FapProposals;
};

const getReviewsFromAssignments = (assignments: FapProposalAssignmentType[]) =>
  assignments
    .map((assignment) => assignment.review)
    .filter((review): review is Review => !!review);

const FapProposalColumns: Column<FapProposalType>[] = [
  {
    title: 'Actions',
    cellStyle: { padding: 0, minWidth: 80 },
    sorting: false,
    removable: false,
    field: 'rowActionButtons',
  },
  {
    title: 'ID',
    field: 'proposal.proposalId',
    render: (rawData) => (
      <CopyToClipboard
        text={rawData.proposal.proposalId}
        successMessage={`'${rawData.proposal.proposalId}' copied to clipboard`}
        position="right"
      >
        {rawData.proposal.proposalId || ''}
      </CopyToClipboard>
    ),
  },
  {
    title: 'Title',
    field: 'proposal.title',
  },
  {
    title: 'Status',
    field: 'proposal.status.name',
  },
  {
    title: 'Date assigned',
    field: 'dateAssignedFormatted',
  },
  {
    title: 'Reviewers',
    render: (data) => data.assignments?.length,
  },
  {
    title: 'Reviews',
    render: (rowData) => {
      const totalReviews = rowData.assignments?.length;
      const gradedProposals = rowData.assignments?.filter(
        (assignment) =>
          assignment.review !== null && assignment.review.grade !== null
      );
      const countReviews = gradedProposals?.length || 0;

      return totalReviews === 0 ? '-' : `${countReviews} / ${totalReviews}`;
    },
  },
  {
    title: 'Average grade',
    render: (rowData) => {
      const avgGrade = average(
        getGradesFromReviews(
          getReviewsFromAssignments(rowData.assignments ?? [])
        )
      );

      return avgGrade === 0 ? '-' : `${avgGrade}`;
    },
    customSort: (a, b) =>
      average(
        getGradesFromReviews(getReviewsFromAssignments(a.assignments ?? []))
      ) -
      average(
        getGradesFromReviews(getReviewsFromAssignments(b.assignments ?? []))
      ),
  },
  {
    title: 'Deviation',
    field: 'deviation',
    render: (rowData) => {
      const stdDeviation = standardDeviation(
        getGradesFromReviews(
          getReviewsFromAssignments(rowData.assignments ?? [])
        )
      );

      return isNaN(stdDeviation) ? '-' : `${stdDeviation}`;
    },
    customSort: (a, b) =>
      standardDeviation(
        getGradesFromReviews(getReviewsFromAssignments(a.assignments ?? []))
      ) -
      standardDeviation(
        getGradesFromReviews(getReviewsFromAssignments(b.assignments ?? []))
      ),
  },
  {
    title: 'Instrument',
    field: 'instrument.name',
  },
];

const FapLegacyProposalsTable = ({
  data,
  onAssignmentsUpdate,
  fapProposals,
}: FapLegacyProposalsTableProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const reviewModal = searchParams.get('reviewModal');

  const { loadingFapProposals, FapProposalsData, setFapProposalsData } =
    fapProposals;
  const { api } = useDataApiWithFeedback();
  const downloadPDFProposal = useDownloadPDFProposal();
  const { toFormattedDateTime } = useFormattedDateTime({
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });
  const { t } = useTranslation();

  const translatedColumns = FapProposalColumns.map((column) =>
    column.title === 'Instrument'
      ? { ...column, title: t('instrument') }
      : column
  );

  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');
  const selection = searchParams.getAll('selection');
  /**
   * NOTE: Custom action buttons are here because when we have them inside actions on the material-table
   * and selection flag is true they are not working properly.
   */
  const RowActionButtons = (rowData: FapProposalType) => (
    <>
      <Tooltip title="View proposal">
        <IconButton
          data-cy="view-proposal"
          onClick={() => {
            setSearchParams((searchParams) => {
              searchParams.set('reviewModal', rowData.proposalPk.toString());

              return searchParams;
            });
          }}
        >
          <Visibility />
        </IconButton>
      </Tooltip>
    </>
  );

  const handleBulkDownloadClick = (
    event: React.MouseEventHandler<HTMLButtonElement>,
    rowData: FapProposalType | FapProposalType[]
  ) => {
    if (!Array.isArray(rowData)) {
      return;
    }

    downloadPDFProposal(
      rowData.map((row) => row.proposalPk),
      rowData[0].proposal.title
    );
  };

  const initialValues: FapProposalType[] = FapProposalsData;
  const tableActions: Action<FapProposalType>[] = [];

  tableActions.push({
    icon: () => <GetAppIcon data-cy="download-fap-proposals" />,
    tooltip: 'Download proposals',
    onClick: handleBulkDownloadClick,
    position: 'toolbarOnSelect',
  });

  const ReviewersTable = React.useCallback(
    ({ rowData }: Record<'rowData', FapProposalType>) => {
      const removeAssignedReviewer = async (
        assignedReviewer: FapProposalAssignmentType,
        proposalPk: number
      ): Promise<void> => {
        await api({
          toastSuccessMessage: 'Reviewer removed',
        }).removeMemberFromFapProposal({
          proposalPk,
          fapId: data.id,
          memberId: assignedReviewer.fapMemberUserId as number,
        });

        setFapProposalsData((fapProposalData) =>
          fapProposalData.map((proposalItem) => {
            if (proposalItem.proposalPk === proposalPk) {
              const newAssignments =
                proposalItem.assignments?.filter(
                  (oldAssignment) =>
                    oldAssignment.fapMemberUserId !==
                    assignedReviewer.fapMemberUserId
                ) || [];

              return {
                ...proposalItem,
                assignments: newAssignments,
              };
            } else {
              return proposalItem;
            }
          })
        );

        onAssignmentsUpdate({
          ...data,
          fapChairsCurrentProposalCounts:
            data.fapChairsCurrentProposalCounts.map((value) => {
              return {
                userId: value.userId,
                count:
                  assignedReviewer.fapMemberUserId === value.userId
                    ? value.count - 1
                    : value.count,
              };
            }),
          fapSecretariesCurrentProposalCounts:
            data.fapSecretariesCurrentProposalCounts.map((value) => {
              return {
                userId: value.userId,
                count:
                  assignedReviewer.fapMemberUserId === value.userId
                    ? value.count - 1
                    : value.count,
              };
            }),
        });
      };

      const loadFapProposal = async (proposalPk: number) => {
        return api()
          .getFapProposal({ fapId: data.id, proposalPk })
          .then((data) => {
            return data.fapProposal;
          });
      };

      const updateFapProposalAssignmentsView = async (proposalPk: number) => {
        const refreshedFapProposal = await loadFapProposal(proposalPk);

        if (refreshedFapProposal) {
          setFapProposalsData((fapProposalsData) => {
            return fapProposalsData.map((fapProposal) => ({
              ...fapProposal,
              proposal: {
                ...fapProposal.proposal,
                status:
                  refreshedFapProposal.proposalPk === fapProposal.proposalPk
                    ? refreshedFapProposal.proposal.status
                    : fapProposal.proposal.status,
              },
              assignments:
                refreshedFapProposal.proposalPk === fapProposal.proposalPk
                  ? refreshedFapProposal.assignments
                  : fapProposal.assignments,
            }));
          });
        }
      };

      return (
        <FapAssignedReviewersTable
          fapProposal={rowData}
          fapSecs={data.fapSecretaries.map((user) => user.id)}
          removeAssignedReviewer={removeAssignedReviewer}
          updateView={updateFapProposalAssignmentsView}
          editable={false}
        />
      );
    },
    [setFapProposalsData, data, onAssignmentsUpdate, api]
  );

  const FapProposalsWitIdAndFormattedDate = initialValues.map((fapProposal) =>
    Object.assign(fapProposal, {
      id: fapProposal.proposalPk,
      rowActionButtons: RowActionButtons(fapProposal),
      dateAssignedFormatted: toFormattedDateTime(fapProposal.dateAssigned),
      tableData: {
        checked: selection.includes(fapProposal.proposalPk.toString()),
      },
    })
  );

  const maxPageLength = FapProposalsWitIdAndFormattedDate.length;

  const pageSizeOptions = [5, 10, 20, maxPageLength]
    .sort((a, b) => a - b)
    .filter((n) => n <= maxPageLength);

  return (
    <>
      <ProposalReviewModal
        title={`${t('Fap')} - Proposal View`}
        proposalReviewModalOpen={!!reviewModal}
        setProposalReviewModalOpen={() => {
          setSearchParams((searchParams) => {
            searchParams.delete('reviewModal');

            return searchParams;
          });
        }}
      >
        <ProposalReviewContent
          proposalPk={reviewModal ? +reviewModal : undefined}
          tabNames={[
            PROPOSAL_MODAL_TAB_NAMES.PROPOSAL_INFORMATION,
            PROPOSAL_MODAL_TAB_NAMES.TECHNICAL_REVIEW,
          ]}
          fapSec={data.fapSecretaries.map((user) => user.id)}
        />
      </ProposalReviewModal>
      <div data-cy="fap-assignments-table">
        <MaterialTable
          icons={tableIcons}
          columns={translatedColumns}
          title={
            <Typography variant="h6" component="h2">
              {`${data.code} - ${t('Fap')} Proposals`}
            </Typography>
          }
          data={FapProposalsWitIdAndFormattedDate}
          isLoading={loadingFapProposals}
          localization={{
            toolbar: {
              nRowsSelected: '{0} proposal(s) selected',
            },
          }}
          detailPanel={[
            {
              tooltip: 'Show Reviewers',
              render: ReviewersTable,
            },
          ]}
          actions={tableActions}
          options={{
            search: true,
            selection: true,
            pageSize: pageSize ? +pageSize : Math.min(10, maxPageLength),
            initialPage: page ? +page : 0,
            pageSizeOptions: pageSizeOptions,
            headerSelectionProps: {
              inputProps: {
                'aria-label': 'Select all rows',
                id: 'select-all-table-rows',
              },
            },
          }}
          onPageChange={(page) => {
            setSearchParams((searchParams) => {
              searchParams.set('page', page.toString());

              return searchParams;
            });
          }}
          onRowsPerPageChange={(pageSize) => {
            setSearchParams((searchParams) => {
              searchParams.set('pageSize', pageSize.toString());

              return searchParams;
            });
          }}
          onSelectionChange={(selectedItems) => {
            const selectedProposalPks = selectedItems.map(
              (item) => item.proposalPk
            );

            setSearchParams((searchParams) => {
              searchParams.delete('selection');
              selectedProposalPks.forEach((pk) =>
                searchParams.append('selection', pk.toString())
              );

              return searchParams;
            });
          }}
        />
      </div>
    </>
  );
};

export default withConfirm(FapLegacyProposalsTable);
