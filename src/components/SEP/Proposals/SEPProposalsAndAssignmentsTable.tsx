import MaterialTable, { Options } from '@material-table/core';
import AssignmentInd from '@mui/icons-material/AssignmentInd';
import GetAppIcon from '@mui/icons-material/GetApp';
import Visibility from '@mui/icons-material/Visibility';
import { Typography } from '@mui/material';
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

import AssignSEPMemberToProposal, {
  SepAssignedMember,
} from './AssignSEPMemberToProposal';
import SEPAssignedReviewersTable from './SEPAssignedReviewersTable';

type SEPProposalsAndAssignmentsTableProps = {
  /** Id of the SEP we are assigning members to */
  sepId: number;
  /** Toolbar component shown in the table */
  Toolbar: (data: Options<JSX.Element>) => JSX.Element;
  /** Call id that we want to filter by */
  selectedCallId: number | null;
};

const getReviewsFromAssignments = (assignments: SEPProposalAssignmentType[]) =>
  assignments
    .map((assignment) => assignment.review)
    .filter((review): review is Review => !!review);

const SEPProposalColumns = [
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
> = ({ sepId, selectedCallId, Toolbar }) => {
  const [urlQueryParams, setUrlQueryParams] = useQueryParams({
    reviewModal: NumberParam,
  });
  const { loadingSEPProposals, SEPProposalsData, setSEPProposalsData } =
    useSEPProposalsData(sepId, selectedCallId);
  const { api } = useDataApiWithFeedback();
  const [proposalPk, setProposalPk] = useState<null | number>(null);
  const downloadPDFProposal = useDownloadPDFProposal();
  const { toFormattedDateTime } = useFormattedDateTime();

  const hasRightToAssignReviewers = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.SEP_CHAIR,
    UserRole.SEP_SECRETARY,
  ]);
  const hasRightToRemoveAssignedProposal = useCheckAccess([
    UserRole.USER_OFFICER,
  ]);

  const removeProposalFromSEP = async (
    proposalToRemove: SEPProposalType
  ): Promise<void> => {
    await api('Assignment removed').removeProposalsFromSep({
      proposalPks: [proposalToRemove.proposalPk],
      sepId,
    });

    setSEPProposalsData((sepProposalData) =>
      sepProposalData.filter(
        (proposalItem) =>
          proposalItem.proposalPk !== proposalToRemove.proposalPk
      )
    );
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
    } = await api('Members assigned').assignSepReviewersToProposal({
      memberIds: assignedMembers.map(({ id }) => id),
      proposalPk: proposalPk,
      sepId,
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
  };

  const initialValues: SEPProposalType[] = SEPProposalsData;
  const AssignmentIndIcon = (): JSX.Element => <AssignmentInd />;
  const ViewIcon = (): JSX.Element => <Visibility />;
  const GetAppIconComponent = (): JSX.Element => <GetAppIcon />;

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
        await api('Reviewer removed').removeMemberFromSEPProposal({
          proposalPk,
          sepId,
          memberId: assignedReviewer.sepMemberUserId as number,
        });

        assignedReviewer.review &&
          (await api().removeUserForReview({
            reviewId: assignedReviewer.review.id,
            sepId,
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
    [setSEPProposalsData, sepId, api]
  );

  const SEPProposalsWitIdAndFormattedDate = initialValues.map((sepProposal) =>
    Object.assign(sepProposal, {
      id: sepProposal.proposalPk,
      dateAssignedFormatted: toFormattedDateTime(sepProposal.dateAssigned),
    })
  );

  return (
    <React.Fragment>
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
            sepId={sepId}
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
            actions={
              hasRightToAssignReviewers
                ? [
                    (rowData) => ({
                      icon: AssignmentIndIcon,
                      onClick: () => setProposalPk(rowData.proposalPk),
                      tooltip: 'Assign SEP Member',
                    }),
                    (rowData) => ({
                      icon: ViewIcon,
                      onClick: () =>
                        setUrlQueryParams({
                          reviewModal: rowData.proposalPk,
                        }),
                      tooltip: 'View Proposal',
                    }),
                    {
                      icon: GetAppIconComponent,
                      tooltip: 'Download proposal',
                      onClick: (rowData) => {
                        downloadPDFProposal(
                          [rowData.proposalPk],
                          rowData.title
                        );
                      },
                    },
                  ]
                : []
            }
            editable={
              hasRightToRemoveAssignedProposal
                ? {
                    deleteTooltip: () => 'Remove assigned proposal',
                    onRowDelete: (rowData: SEPProposalType): Promise<void> =>
                      removeProposalFromSEP(rowData),
                  }
                : {}
            }
            options={{
              search: true,
            }}
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default SEPProposalsAndAssignmentsTable;
