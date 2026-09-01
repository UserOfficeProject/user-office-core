import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { FeatureContext } from 'context/FeatureContextProvider';
import { Fap, FeatureId, ReviewStatus } from 'generated/sdk';
import {
  FapProposalAssignmentType,
  FapProposals,
} from 'hooks/fap/useFapProposalsData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { FapAssignedMember } from './ProposalsView/AssignFapMemberToProposalModal';
import FapProposalsAndAssignmentsTable from './ProposalsView/FapProposalsAndAssignmentsTable';
import FapReviewersAndAssignmentsTable from './ReviewersView/FapReviewersAndAssignmentsTable';

type AssignmentsTableProps = {
  /** Fap we are assigning members to */
  fap: Fap;
  /** Call this function in case of Fap assigned members update */
  onAssignmentsUpdate: (fap: Fap) => void;
  confirm: WithConfirmType;
  fapProposals: FapProposals;
  proposalView: boolean;
};

type ProposalReview = {
  id: number;
  userID: number;
  comment: string | null;
  grade: string | null;
  status: ReviewStatus;
  fapID: number;
  proposalPk?: number;
  questionaryID: number;
};

const AssignmentsTable = ({
  fap,
  onAssignmentsUpdate,
  confirm,
  fapProposals,
  proposalView,
}: AssignmentsTableProps) => {
  const { featuresMap } = useContext(FeatureContext);
  const { enqueueSnackbar } = useSnackbar();
  const { api } = useDataApiWithFeedback();
  const { t } = useTranslation();

  const { FapProposalsData, setFapProposalsData } = fapProposals;

  const isUseConflictOfInterestWarningEnabled = featuresMap.get(
    FeatureId.CONFLICT_OF_INTEREST_WARNING
  )?.isEnabled;

  const assignMembersToFapProposals = async (
    assignedMembers: FapAssignedMember[],
    proposalPks: number[]
  ) => {
    if (proposalPks.length === 0) {
      return;
    }

    const existingProposalAssignments = FapProposalsData.flatMap(
      (assignment) => assignment.assignments
    );

    const proposalAssignments: {
      memberId: number;
      proposalPk: number;
      rank?: number | null;
    }[] = [];
    const updatedMembers = new Set<FapAssignedMember>();

    for (const proposalPk of proposalPks) {
      for (const assignedMember of assignedMembers) {
        const isExistingAssignment = !!existingProposalAssignments.find(
          (existingProposalAssignment) =>
            assignedMember.id === existingProposalAssignment?.user?.id &&
            proposalPk === existingProposalAssignment.proposalPk
        );
        if (!isExistingAssignment) {
          proposalAssignments.push({
            memberId: assignedMember.id,
            proposalPk,
            rank: assignedMember.rank ?? null,
          });
          updatedMembers.add(assignedMember);
        }
      }
    }

    const fapMemberPluralMsg =
      assignedMembers.length === 1
        ? `The ${t('FAP')} member is`
        : `All ${t('FAP')} members are`;
    const proposalPluralMsg = proposalPks.length === 1 ? '' : 's';

    if (proposalAssignments.length === 0) {
      enqueueSnackbar(
        `${fapMemberPluralMsg} already assigned to the selected proposal${proposalPluralMsg}`,
        {
          variant: 'error',
          className: 'snackbar-error',
        }
      );

      return;
    }

    await api({
      toastSuccessMessage:
        Array.from(updatedMembers).length === 1
          ? 'Member assigned'
          : 'Members assigned',
    }).assignFapReviewersToProposals({
      assignments: proposalAssignments,
      fapId: fap.id,
    });

    const allProposalReviews: ProposalReview[] = [];

    for (const proposalPk of proposalPks) {
      const { proposalReviews } = await api().getProposalReviews({
        proposalPk,
        fapId: fap.id,
      });

      if (!proposalReviews) {
        continue;
      }

      proposalReviews.forEach((proposalReview) =>
        allProposalReviews.push({ ...proposalReview, proposalPk })
      );
    }

    if (allProposalReviews.length === 0) {
      return;
    }

    setFapProposalsData((fapProposalData) => {
      const proposalAssignmentsPks = proposalAssignments.map(
        (proposalAssignment) => proposalAssignment.proposalPk
      );
      const updatedMembersValues = Array.from(updatedMembers);

      return fapProposalData.map((proposalItem) => {
        if (proposalAssignmentsPks.includes(proposalItem.proposalPk)) {
          const newlyAssignedFapMemberIds = proposalAssignments
            .filter(
              (proposalAssignment) =>
                proposalAssignment.proposalPk === proposalItem.proposalPk
            )
            .map((proposalAssignment) => proposalAssignment.memberId);
          const newlyAssignedFapMembers = updatedMembersValues.filter(
            (updatedMember) =>
              newlyAssignedFapMemberIds.includes(updatedMember.id)
          );

          const newAssignments: FapProposalAssignmentType[] = [
            ...(proposalItem.assignments ?? []),
            ...newlyAssignedFapMembers.map(({ role = null, ...user }) => ({
              proposalPk: proposalItem.proposalPk,
              fapMemberUserId: user.id,
              dateAssigned: DateTime.now(),
              user,
              role,
              rank: user.rank ?? null,
              review:
                allProposalReviews.find(
                  (review) =>
                    review.userID === user.id &&
                    review.proposalPk === proposalItem.proposalPk
                ) ?? null,
            })),
          ];

          return {
            ...proposalItem,
            assignments: newAssignments,
          };
        } else {
          return proposalItem;
        }
      });
    });

    onAssignmentsUpdate({
      ...fap,
      fapChairsCurrentProposalCounts: fap.fapChairsCurrentProposalCounts.map(
        (value) => {
          return {
            userId: value.userId,
            count: assignedMembers.find(
              (assignedMember) => assignedMember.id === value.userId
            )
              ? value.count + 1
              : value.count,
          };
        }
      ),
      fapSecretariesCurrentProposalCounts:
        fap.fapSecretariesCurrentProposalCounts.map((value) => {
          return {
            userId: value.userId,
            count: assignedMembers.find(
              (assignedMember) => assignedMember.id === value.userId
            )
              ? value.count + 1
              : value.count,
          };
        }),
    });
  };

  const handleMemberAssignmentToFapProposals = (
    memberUsers: FapAssignedMember[],
    proposalPks: number[]
  ) => {
    const selectedProposals = FapProposalsData.filter((fapProposal) =>
      proposalPks.includes(fapProposal.proposalPk)
    );

    if (selectedProposals.length === 0) {
      return;
    }

    const proposalPIsMap = new Map<number, FapAssignedMember>();
    const proposalCoIsMap = new Map<number, FapAssignedMember[]>();
    const pIInstitutionConflictMap = new Map<number, FapAssignedMember>();
    const coIInstitutionConflictMap = new Map<number, FapAssignedMember[]>();

    for (const fapProposal of selectedProposals) {
      const selectedPI = memberUsers.find(
        (member) => member.id === fapProposal.proposal.proposer?.id
      );

      if (selectedPI) {
        proposalPIsMap.set(fapProposal.proposalPk, selectedPI);
      }

      const selectedCoProposers = memberUsers.filter((member) =>
        fapProposal.proposal.users.find((user) => user.id === member.id)
      );

      if (selectedCoProposers.length > 0) {
        proposalCoIsMap.set(fapProposal.proposalPk, selectedCoProposers);
      }

      const selectedReviewerWithSameInstitutionAsPI = memberUsers.find(
        (member) =>
          member.institutionId === fapProposal.proposal.proposer?.institutionId
      );

      if (selectedReviewerWithSameInstitutionAsPI) {
        pIInstitutionConflictMap.set(
          fapProposal.proposalPk,
          selectedReviewerWithSameInstitutionAsPI
        );
      }

      const selectedReviewerWithSameInstitutionAsCoProposers =
        memberUsers.filter((member) =>
          fapProposal.proposal.users.find(
            (user) => user.institutionId === member.institutionId
          )
        );

      if (selectedReviewerWithSameInstitutionAsCoProposers.length > 0) {
        coIInstitutionConflictMap.set(
          fapProposal.proposalPk,
          selectedReviewerWithSameInstitutionAsCoProposers
        );
      }
    }

    const shouldShowWarning =
      isUseConflictOfInterestWarningEnabled &&
      (proposalPIsMap.size > 0 ||
        proposalCoIsMap.size > 0 ||
        pIInstitutionConflictMap.size > 0 ||
        coIInstitutionConflictMap.size > 0);

    const alertText: React.ReactNode[] = [];

    const selectedProposalPks = selectedProposals.map(
      (selectedProposal) => selectedProposal.proposalPk
    );

    for (const selectedProposalPk of selectedProposalPks) {
      alertText.push(
        <ul>
          {(!!proposalPIsMap.get(selectedProposalPk) ||
            !!proposalCoIsMap.get(selectedProposalPk) ||
            !!pIInstitutionConflictMap.get(selectedProposalPk) ||
            !!coIInstitutionConflictMap.get(selectedProposalPk)) && (
            <li>Proposal: {selectedProposalPk}</li>
          )}
          {!!proposalPIsMap.get(selectedProposalPk) && (
            <li>
              PI: {getFullUserName(proposalPIsMap.get(selectedProposalPk))}
            </li>
          )}
          {!!proposalCoIsMap.get(selectedProposalPk) && (
            <li>
              Co-proposers:{' '}
              {proposalCoIsMap
                .get(selectedProposalPk)
                ?.map((selectedCoProposer) =>
                  getFullUserName(selectedCoProposer)
                )
                .join(', ')}
            </li>
          )}
          {!!pIInstitutionConflictMap.get(selectedProposalPk) && (
            <li>
              Same institution as PI:{' '}
              {getFullUserName(
                pIInstitutionConflictMap.get(selectedProposalPk)
              )}
            </li>
          )}
          {!!coIInstitutionConflictMap.get(selectedProposalPk) && (
            <li>
              Same institution as co-proposers:{' '}
              {coIInstitutionConflictMap
                .get(selectedProposalPk)
                ?.map((selectedCoProposer) =>
                  getFullUserName(selectedCoProposer)
                )
                .join(', ')}
            </li>
          )}
        </ul>
      );
    }

    if (shouldShowWarning) {
      confirm(() => assignMembersToFapProposals(memberUsers, proposalPks), {
        title: `${t('Fap')} reviewers assignment`,
        description: ' ',
        shouldEnableOKWithAlert: true,
        alertText: (
          <>
            Some of the selected reviewers are already part of the proposal(s)
            as a PI/Co-proposer or belong to the same institution{' '}
            <strong>{alertText}</strong>
            {`Are you sure you want to assign all selected users to the ${t('Fap')} proposal(s)?`}
          </>
        ),
      })();
    } else {
      assignMembersToFapProposals(memberUsers, proposalPks);
    }
  };

  const loadFapProposal = async (proposalPk: number) => {
    return api()
      .getFapProposal({ fapId: fap.id, proposalPk })
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

  return proposalView ? (
    <FapProposalsAndAssignmentsTable
      fap={fap}
      onAssignmentsUpdate={onAssignmentsUpdate}
      fapProposals={fapProposals}
      handleMemberAssignmentToFapProposals={
        handleMemberAssignmentToFapProposals
      }
      updateFapProposalAssignmentsView={updateFapProposalAssignmentsView}
    />
  ) : (
    <FapReviewersAndAssignmentsTable
      fap={fap}
      onAssignmentsUpdate={onAssignmentsUpdate}
      fapProposals={fapProposals}
      handleMemberAssignmentToFapProposals={
        handleMemberAssignmentToFapProposals
      }
      updateFapProposalAssignmentsView={updateFapProposalAssignmentsView}
    />
  );
};

export default withConfirm(AssignmentsTable);
