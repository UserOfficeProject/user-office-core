import MaterialTable, { Action, Options } from '@material-table/core';
import AssignmentInd from '@mui/icons-material/AssignmentInd';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import GetAppIcon from '@mui/icons-material/GetApp';
import Visibility from '@mui/icons-material/Visibility';
import { IconButton, Tooltip, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import { NumberParam, useQueryParams } from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import ProposalReviewContent, {
  PROPOSAL_MODAL_TAB_NAMES,
} from 'components/review/ProposalReviewContent';
import ProposalReviewModal from 'components/review/ProposalReviewModal';
import {
  SepAssignment,
  UserRole,
  ReviewWithNextProposalStatus,
  ProposalStatus,
  Review,
  SettingsId,
  Sep,
} from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import {
  useSEPProposalsData,
  SEPProposalType,
  SEPProposalAssignmentType,
} from 'hooks/SEP/useSEPProposalsData';
import { tableIcons } from 'utils/materialIcons';
import {
  average,
  getGradesFromReviews,
  standardDeviation,
} from 'utils/mathFunctions';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import AssignSEPMemberToProposal, {
  SepAssignedMember,
} from './AssignSEPMemberToProposal';
import SEPAssignedReviewersTable from './SEPAssignedReviewersTable';

type SEPProposalsAndAssignmentsTableProps = {
  /** SEP we are assigning members to */
  data: Sep;
  /** Call this function in case of SEP assigned members update */
  onAssignmentsUpdate: (sep: Sep) => void;
  /** Toolbar component shown in the table */
  Toolbar: (data: Options<JSX.Element>) => JSX.Element;
  /** Call id that we want to filter by */
  selectedCallId: number | null;
  /** Confirmation function that comes from withConfirm HOC */
  confirm: WithConfirmType;
};

const getReviewsFromAssignments = (assignments: SEPProposalAssignmentType[]) =>
  assignments
    .map((assignment) => assignment.review)
    .filter((review): review is Review => !!review);

const SEPProposalColumns = [
  {
    title: 'Actions',
    cellStyle: { padding: 0, minWidth: 80 },
    sorting: false,
    removable: false,
    field: 'rowActionButtons',
  },
  { title: 'ID', field: 'proposal.proposalId' },
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
    field: 'assignments.length',
    emptyValue: '-',
  },
  {
    title: 'Average grade',
    render: (rowData: SEPProposalType): string => {
      const avgGrade = average(
        getGradesFromReviews(
          getReviewsFromAssignments(rowData.assignments ?? [])
        )
      );

      return avgGrade === 0 ? '-' : `${avgGrade}`;
    },
    customSort: (a: SEPProposalType, b: SEPProposalType) =>
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
    render: (rowData: SEPProposalType): string => {
      const stdDeviation = standardDeviation(
        getGradesFromReviews(
          getReviewsFromAssignments(rowData.assignments ?? [])
        )
      );

      return isNaN(stdDeviation) ? '-' : `${stdDeviation}`;
    },
    customSort: (a: SEPProposalType, b: SEPProposalType) =>
      standardDeviation(
        getGradesFromReviews(getReviewsFromAssignments(a.assignments ?? []))
      ) -
      standardDeviation(
        getGradesFromReviews(getReviewsFromAssignments(b.assignments ?? []))
      ),
  },
];

const SEPProposalsAndAssignmentsTable: React.FC<
  SEPProposalsAndAssignmentsTableProps
> = ({ data, onAssignmentsUpdate, selectedCallId, Toolbar, confirm }) => {
  const [urlQueryParams, setUrlQueryParams] = useQueryParams({
    reviewModal: NumberParam,
  });
  const { loadingSEPProposals, SEPProposalsData, setSEPProposalsData } =
    useSEPProposalsData(data.id, selectedCallId);
  const { api } = useDataApiWithFeedback();
  const [proposalPk, setProposalPk] = useState<null | number>(null);
  const downloadPDFProposal = useDownloadPDFProposal();
  const { toFormattedDateTime } = useFormattedDateTime({
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });

  const hasRightToAssignReviewers = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.SEP_CHAIR,
    UserRole.SEP_SECRETARY,
  ]);
  const hasRightToRemoveAssignedProposal = useCheckAccess([
    UserRole.USER_OFFICER,
  ]);

  /**
   * NOTE: Custom action buttons are here because when we have them inside actions on the material-table
   * and selection flag is true they are not working properly.
   */
  const RowActionButtons = (rowData: SEPProposalType) => (
    <>
      <Tooltip title="View proposal">
        <IconButton
          data-cy="view-proposal"
          onClick={() => {
            setUrlQueryParams({ reviewModal: rowData.proposalPk });
          }}
        >
          <Visibility />
        </IconButton>
      </Tooltip>
      <Tooltip title="Assign SEP Member">
        <IconButton
          data-cy="assign-sep-member"
          onClick={() => setProposalPk(rowData.proposalPk)}
        >
          <AssignmentInd />
        </IconButton>
      </Tooltip>
    </>
  );

  const handleBulkDownloadClick = (
    event: React.MouseEventHandler<HTMLButtonElement>,
    rowData: SEPProposalType | SEPProposalType[]
  ) => {
    if (!Array.isArray(rowData)) {
      return;
    }

    downloadPDFProposal(
      rowData.map((row) => row.proposalPk),
      rowData[0].proposal.title
    );
  };

  const removeProposalsFromSEP = async (
    proposalsToRemove: SEPProposalType[]
  ): Promise<void> => {
    await api({
      toastSuccessMessage: 'Assignment/s removed',
    }).removeProposalsFromSep({
      proposalPks: proposalsToRemove.map(
        (proposalToRemove) => proposalToRemove.proposalPk
      ),
      sepId: data.id,
    });

    setSEPProposalsData((sepProposalData) =>
      sepProposalData.filter((proposalItem) =>
        proposalsToRemove.every(
          (proposalToRemove) =>
            proposalToRemove.proposalPk !== proposalItem.proposalPk
        )
      )
    );
  };

  const handleBulkRemoveProposalsFromSEP = async (
    _: React.MouseEventHandler<HTMLButtonElement>,
    proposalsToRemove: SEPProposalType | SEPProposalType[]
  ): Promise<void> => {
    if (!Array.isArray(proposalsToRemove)) {
      return;
    }
    confirm(() => removeProposalsFromSEP(proposalsToRemove), {
      title: 'Remove SEP assignment/s',
      description: `Are you sure you want to remove the selected proposal/s from this SEP?`,
    })();
  };

  const assignMemberToSEPProposal = async (
    assignedMembers: SepAssignedMember[]
  ) => {
    setProposalPk(null);

    if (!proposalPk) {
      return;
    }

    const {
      assignSepReviewersToProposal: { rejection },
    } = await api({
      toastSuccessMessage: 'Members assigned',
    }).assignSepReviewersToProposal({
      memberIds: assignedMembers.map(({ id }) => id),
      proposalPk: proposalPk,
      sepId: data.id,
    });

    if (rejection) {
      return;
    }

    const { proposalReviews } = await api().getProposalReviews({
      proposalPk,
    });

    if (!proposalReviews) {
      return;
    }

    setSEPProposalsData((sepProposalData) =>
      sepProposalData.map((proposalItem) => {
        if (proposalItem.proposalPk === proposalPk) {
          const newAssignments: SEPProposalAssignmentType[] = [
            ...(proposalItem.assignments ?? []),
            ...assignedMembers.map(({ role = null, ...user }) => ({
              sepMemberUserId: user.id,
              dateAssigned: DateTime.now(),
              user,
              role,
              review:
                proposalReviews.find(({ userID }) => userID === user.id) ??
                null,
            })),
          ];

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
      sepChairProposalCount: assignedMembers.find(
        (assignedMember) => assignedMember.id === data.sepChair?.id
      )
        ? (data.sepChairProposalCount || 0) + 1
        : data.sepChairProposalCount,
      sepSecretaryProposalCount: assignedMembers.find(
        (assignedMember) => assignedMember.id === data.sepSecretary?.id
      )
        ? (data.sepSecretaryProposalCount || 0) + 1
        : data.sepSecretaryProposalCount,
    });
  };

  const initialValues: SEPProposalType[] = SEPProposalsData;
  const tableActions: Action<SEPProposalType>[] = [];
  hasRightToAssignReviewers &&
    tableActions.push({
      icon: () => <GetAppIcon data-cy="download-sep-proposals" />,
      tooltip: 'Download proposals',
      onClick: handleBulkDownloadClick,
      position: 'toolbarOnSelect',
    });
  hasRightToRemoveAssignedProposal &&
    tableActions.push({
      icon: () => <DeleteOutline data-cy="remove-assigned-sep-proposal" />,
      tooltip: 'Remove assigned proposal',
      onClick: handleBulkRemoveProposalsFromSEP,
      position: 'toolbarOnSelect',
    });

  const proposalAssignments = initialValues.find(
    (assignment) => assignment.proposalPk === proposalPk
  )?.assignments;

  const ReviewersTable = React.useCallback(
    ({ rowData }: Record<'rowData', SEPProposalType>) => {
      const updateReviewStatusAndGrade = (
        sepProposalData: SEPProposalType[],
        editingProposalData: SEPProposalType,
        currentAssignment: SepAssignment
      ) => {
        const newProposalsData =
          sepProposalData?.map((sepProposalsData) => {
            if (
              sepProposalsData.proposalPk === editingProposalData.proposalPk
            ) {
              const editingProposalStatus = (
                currentAssignment.review as ReviewWithNextProposalStatus
              ).nextProposalStatus
                ? ((currentAssignment.review as ReviewWithNextProposalStatus)
                    .nextProposalStatus as ProposalStatus)
                : editingProposalData.proposal.status;

              return {
                ...editingProposalData,
                proposal: {
                  ...editingProposalData.proposal,
                  status: editingProposalStatus,
                },
                assignments:
                  editingProposalData.assignments?.map((proposalAssignment) => {
                    if (
                      proposalAssignment?.review?.id ===
                      currentAssignment?.review?.id
                    ) {
                      return currentAssignment;
                    } else {
                      return proposalAssignment;
                    }
                  }) ?? [],
              };
            } else {
              return sepProposalsData;
            }
          }) || [];

        return newProposalsData;
      };

      const removeAssignedReviewer = async (
        assignedReviewer: SepAssignment,
        proposalPk: number
      ): Promise<void> => {
        /**
         * TODO(asztalos): merge `removeMemberFromSEPProposal` and `removeUserForReview` (same goes for creation)
         *                otherwise if one of them fails we may end up with an broken state
         */
        await api({
          toastSuccessMessage: 'Reviewer removed',
        }).removeMemberFromSEPProposal({
          proposalPk,
          sepId: data.id,
          memberId: assignedReviewer.sepMemberUserId as number,
        });

        assignedReviewer.review &&
          (await api().removeUserForReview({
            reviewId: assignedReviewer.review.id,
            sepId: data.id,
          }));

        setSEPProposalsData((sepProposalData) =>
          sepProposalData.map((proposalItem) => {
            if (proposalItem.proposalPk === proposalPk) {
              const newAssignments =
                proposalItem.assignments?.filter(
                  (oldAssignment) =>
                    oldAssignment.sepMemberUserId !==
                    assignedReviewer.sepMemberUserId
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
          sepChairProposalCount:
            assignedReviewer.sepMemberUserId === data.sepChair?.id
              ? data.sepChairProposalCount! - 1
              : data.sepChairProposalCount,
          sepSecretaryProposalCount:
            assignedReviewer.sepMemberUserId === data.sepSecretary?.id
              ? data.sepSecretaryProposalCount! - 1
              : data.sepSecretaryProposalCount,
        });
      };

      return (
        <SEPAssignedReviewersTable
          sepProposal={rowData}
          removeAssignedReviewer={removeAssignedReviewer}
          updateView={(currentAssignment) => {
            setSEPProposalsData((sepProposalData) =>
              updateReviewStatusAndGrade(
                sepProposalData,
                rowData,
                currentAssignment
              )
            );
          }}
        />
      );
    },
    [setSEPProposalsData, data, onAssignmentsUpdate, api]
  );

  const SEPProposalsWitIdAndFormattedDate = initialValues.map((sepProposal) =>
    Object.assign(sepProposal, {
      id: sepProposal.proposalPk,
      rowActionButtons: RowActionButtons(sepProposal),
      dateAssignedFormatted: toFormattedDateTime(sepProposal.dateAssigned),
    })
  );

  return (
    <>
      <ProposalReviewModal
        title="SEP - Proposal View"
        proposalReviewModalOpen={!!urlQueryParams.reviewModal}
        setProposalReviewModalOpen={() => {
          setUrlQueryParams({ reviewModal: undefined });
        }}
      >
        <ProposalReviewContent
          proposalPk={urlQueryParams.reviewModal}
          tabNames={[
            PROPOSAL_MODAL_TAB_NAMES.PROPOSAL_INFORMATION,
            PROPOSAL_MODAL_TAB_NAMES.TECHNICAL_REVIEW,
          ]}
        />
      </ProposalReviewModal>
      <Dialog
        maxWidth="sm"
        fullWidth
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={!!proposalPk}
        onClose={(): void => setProposalPk(null)}
      >
        <DialogContent>
          <AssignSEPMemberToProposal
            sepId={data.id}
            assignedMembers={
              proposalAssignments?.map((assignment) => assignment.user) ?? []
            }
            assignMemberToSEPProposal={(memberUser) =>
              assignMemberToSEPProposal(memberUser)
            }
          />
        </DialogContent>
      </Dialog>
      <Grid container spacing={3}>
        <Grid data-cy="sep-assignments-table" item xs={12}>
          <MaterialTable
            icons={tableIcons}
            columns={SEPProposalColumns}
            components={{
              Toolbar: Toolbar,
            }}
            title={
              <Typography variant="h6" component="h2" gutterBottom>
                SEP Proposals
              </Typography>
            }
            data={SEPProposalsWitIdAndFormattedDate}
            isLoading={loadingSEPProposals}
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
              headerSelectionProps: {
                inputProps: {
                  'aria-label': 'Select all rows',
                  'data-cy': 'select-all-table-rows',
                },
              },
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default withConfirm(SEPProposalsAndAssignmentsTable);
