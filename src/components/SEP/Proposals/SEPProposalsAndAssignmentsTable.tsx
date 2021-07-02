import { Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import AssignmentInd from '@material-ui/icons/AssignmentInd';
import GetAppIcon from '@material-ui/icons/GetApp';
import Visibility from '@material-ui/icons/Visibility';
import dateformat from 'dateformat';
import MaterialTable, { Options } from 'material-table';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { NumberParam, useQueryParams } from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import ProposalReviewContent from 'components/review/ProposalReviewContent';
import ProposalReviewModal from 'components/review/ProposalReviewModal';
import {
  SepAssignment,
  UserRole,
  ReviewWithNextProposalStatus,
  ProposalStatus,
} from 'generated/sdk';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import {
  useSEPProposalsData,
  SEPProposalType,
  SEPProposalAssignmentType,
} from 'hooks/SEP/useSEPProposalsData';
import { tableIcons } from 'utils/materialIcons';
import { average, standardDeviation } from 'utils/mathFunctions';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import AssignSEPMemberToProposal, {
  SepAssignedMember,
} from './AssignSEPMemberToProposal';
import SEPAssignedReviewersTable from './SEPAssignedReviewersTable';

type SEPProposalsAndAssignmentsTableProps = {
  /** Id of the SEP we are assigning members to */
  sepId: number;
  /** Toolbar component shown in the table */
  Toolbar: (data: Options) => JSX.Element;
  /** Call id that we want to filter by */
  selectedCallId: number;
};

const SEPProposalsAndAssignmentsTable: React.FC<SEPProposalsAndAssignmentsTableProps> = ({
  sepId,
  selectedCallId,
  Toolbar,
}) => {
  const [urlQueryParams, setUrlQueryParams] = useQueryParams({
    reviewModal: NumberParam,
  });
  const {
    loadingSEPProposals,
    SEPProposalsData,
    setSEPProposalsData,
  } = useSEPProposalsData(sepId, selectedCallId);
  const { api } = useDataApiWithFeedback();
  const [proposalPk, setProposalPk] = useState<null | number>(null);
  const downloadPDFProposal = useDownloadPDFProposal();

  const hasRightToAssignReviewers = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.SEP_CHAIR,
    UserRole.SEP_SECRETARY,
  ]);
  const hasRightToRemoveAssignedProposal = useCheckAccess([
    UserRole.USER_OFFICER,
  ]);

  const getGradesFromAssignments = (assignments: SEPProposalAssignmentType[]) =>
    assignments?.map((assignment) => assignment.review?.grade) ?? [];

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
      field: 'dateAssigned',
      render: (rowData: SEPProposalType): string =>
        dateformat(new Date(rowData.dateAssigned), 'dd-mmm-yyyy HH:MM:ss'),
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
          getGradesFromAssignments(rowData.assignments ?? []) as number[]
        );

        return isNaN(avgGrade) ? '-' : `${avgGrade}`;
      },
      customSort: (a: SEPProposalType, b: SEPProposalType) =>
        (average(getGradesFromAssignments(a.assignments ?? []) as number[]) ||
          0) -
        (average(getGradesFromAssignments(b.assignments ?? []) as number[]) ||
          0),
    },
    {
      title: 'Deviation',
      field: 'deviation',
      render: (rowData: SEPProposalType): string => {
        const stdDeviation = standardDeviation(
          getGradesFromAssignments(rowData.assignments ?? []) as number[]
        );

        return isNaN(stdDeviation) ? '-' : `${stdDeviation}`;
      },
      customSort: (a: SEPProposalType, b: SEPProposalType) =>
        (standardDeviation(
          getGradesFromAssignments(a.assignments ?? []) as number[]
        ) || 0) -
        (standardDeviation(
          getGradesFromAssignments(b.assignments ?? []) as number[]
        ) || 0),
    },
  ];

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
            ...assignedMembers.map(({ role, ...user }) => ({
              sepMemberUserId: user.id,
              dateAssigned: Date.now(),
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

  const updateReviewStatusAndGrade = (
    sepProposalData: SEPProposalType[],
    editingProposalData: SEPProposalType,
    currentAssignment: SepAssignment
  ) => {
    const newProposalsData =
      sepProposalData?.map((sepProposalsData) => {
        if (sepProposalsData.proposalPk === editingProposalData.proposalPk) {
          const editingProposalStatus = (currentAssignment.review as ReviewWithNextProposalStatus)
            .nextProposalStatus
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

  const ReviewersTable = (rowData: SEPProposalType) => (
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
          tabNames={['Proposal information', 'Technical review']}
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
                {'SEP Proposals'}
              </Typography>
            }
            data={initialValues}
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
                        setUrlQueryParams({ reviewModal: rowData.proposalPk }),
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

SEPProposalsAndAssignmentsTable.propTypes = {
  sepId: PropTypes.number.isRequired,
  selectedCallId: PropTypes.number.isRequired,
  Toolbar: PropTypes.func.isRequired,
};

export default SEPProposalsAndAssignmentsTable;
