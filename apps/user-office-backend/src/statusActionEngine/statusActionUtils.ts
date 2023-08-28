import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { SEPDataSource } from '../datasources/SEPDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { BasicUserDetails } from '../models/User';
import {
  EmailStatusActionRecipients,
  EmailStatusActionRecipientsWithTemplate,
} from '../resolvers/types/ProposalStatusActionConfig';
import { WorkflowEngineProposalType } from '../workflowEngine';

interface GroupedObjectType {
  [key: string]: WorkflowEngineProposalType[];
}

export const groupProposalsByProperties = (
  proposals: WorkflowEngineProposalType[],
  props: string[]
) => {
  const getGroupedItems = (item: WorkflowEngineProposalType) => {
    const returnArray = [];
    let i;
    for (i = 0; i < props.length; i++) {
      returnArray.push(item[props[i] as keyof WorkflowEngineProposalType]);
    }

    return returnArray;
  };

  const groups: GroupedObjectType = {};
  let i;

  for (i = 0; i < proposals.length; i++) {
    const arrayRecord = proposals[i];
    const group = JSON.stringify(getGroupedItems(arrayRecord));
    groups[group] = groups[group] || [];
    groups[group].push(arrayRecord);
  }

  return Object.keys(groups).map((group) => {
    return groups[group];
  });
};

export type EmailReadyType = {
  id: EmailStatusActionRecipients;
  proposals: { proposalId: number; proposalTitle: string }[];
  template: string;
  email: string;
};

export const getEmailReadyArrayOfUsersAndProposals = (
  newArray: EmailReadyType[],
  array: BasicUserDetails[],
  proposal: WorkflowEngineProposalType,
  recipientsWithEmailTemplate: EmailStatusActionRecipientsWithTemplate
) => {
  array.forEach((item) => {
    const foundIndex = newArray.findIndex(
      (newArrayItem) => newArrayItem.email === item.email
    );

    if (foundIndex !== -1) {
      newArray[foundIndex].proposals.push({
        proposalId: proposal.primaryKey,
        proposalTitle: proposal.title,
      });
    } else {
      newArray.push({
        id: recipientsWithEmailTemplate.recipient,
        proposals: [
          {
            proposalId: proposal.primaryKey,
            proposalTitle: proposal.title,
          },
        ],

        template: recipientsWithEmailTemplate.emailTemplate,
        email: item.email,
      });
    }
  });
};

export const getPIAndFormatOutputForEmailSending = async (
  proposals: WorkflowEngineProposalType[],
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate
) => {
  const usersDataSource: UserDataSource = container.resolve(
    Tokens.UserDataSource
  );

  const PIs: EmailReadyType[] = [];
  await Promise.all(
    proposals.map(async (proposal) => {
      const PI = await usersDataSource.getBasicUserInfo(proposal.proposerId);

      if (!PI) {
        return;
      }

      getEmailReadyArrayOfUsersAndProposals(
        PIs,
        [PI],
        proposal,
        recipientWithTemplate
      );
    })
  );

  return PIs;
};

export const getCoProposersAndFormatOutputForEmailSending = async (
  proposals: WorkflowEngineProposalType[],
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate
) => {
  const usersDataSource: UserDataSource = container.resolve(
    Tokens.UserDataSource
  );
  const PIs: EmailReadyType[] = [];
  await Promise.all(
    proposals.map(async (proposal) => {
      const coProposers = await usersDataSource.getProposalUsers(
        proposal.primaryKey
      );

      getEmailReadyArrayOfUsersAndProposals(
        PIs,
        coProposers,
        proposal,
        recipientWithTemplate
      );
    })
  );

  return PIs;
};

export const getSEPReviewersAndFormatOutputForEmailSending = async (
  proposals: WorkflowEngineProposalType[],
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate
) => {
  const sepDataSource: SEPDataSource = container.resolve(Tokens.SEPDataSource);

  const SRs: EmailReadyType[] = [];
  await Promise.all(
    proposals.map(async (proposal) => {
      const allSepReviewers =
        await sepDataSource.getSEPUsersByProposalPkAndCallId(
          proposal.primaryKey,
          proposal.callId
        );

      getEmailReadyArrayOfUsersAndProposals(
        SRs,
        allSepReviewers,
        proposal,
        recipientWithTemplate
      );
    })
  );

  return SRs;
};

export const getInstrumentScientistsAndFormatOutputForEmailSending = async (
  proposals: WorkflowEngineProposalType[],
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate
) => {
  const instrumentDataSource: InstrumentDataSource = container.resolve(
    Tokens.InstrumentDataSource
  );
  const usersDataSource: UserDataSource = container.resolve(
    Tokens.UserDataSource
  );

  const ISs: EmailReadyType[] = [];
  await Promise.all(
    proposals.map(async (proposal) => {
      const proposalInstrument =
        await instrumentDataSource.getInstrumentByProposalPk(
          proposal.primaryKey
        );

      if (!proposalInstrument) {
        return;
      }

      const beamLineManager = await usersDataSource.getBasicUserInfo(
        proposalInstrument.managerUserId
      );

      if (!beamLineManager) {
        return;
      }

      const instrumentScientists =
        await instrumentDataSource.getInstrumentScientists(
          proposalInstrument.id
        );

      const instrumentScientistsWithManager = [
        beamLineManager,
        ...instrumentScientists,
      ];

      getEmailReadyArrayOfUsersAndProposals(
        ISs,
        instrumentScientistsWithManager,
        proposal,
        recipientWithTemplate
      );
    })
  );

  return ISs;
};
