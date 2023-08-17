import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { SEPDataSource } from '../datasources/SEPDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { MailService } from '../eventHandlers/MailService/MailService';
import {
  ProposalStatusAction,
  ProposalStatusActionType,
} from '../models/ProposalStatusAction';
import {
  EmailActionConfig,
  EmailStatusActionRecipients,
} from '../resolvers/types/ProposalStatusActionConfig';
import {
  WorkflowEngineProposalType,
  getProposalWorkflowConnectionByStatusId,
} from '../workflowEngine';

interface GroupedObjectType {
  [key: string]: WorkflowEngineProposalType[];
}

const groupProposalsByProperties = (
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

export const statusActionEngine = async (
  proposals: WorkflowEngineProposalType[]
): Promise<undefined> => {
  const proposalSettingsDataSource: ProposalSettingsDataSource =
    container.resolve(Tokens.ProposalSettingsDataSource);

  // NOTE: We need to group the proposals by 'workflow' na 'status' because proposals coming in here can be from different workflows/calls.
  const groupByProperties = ['workflowId', 'statusId'];
  // NOTE: Here the result is something like: [[proposalsWithWorkflowStatusIdCombination1], [proposalsWithWorkflowStatusIdCombination2]...]
  const groupResult = groupProposalsByProperties(proposals, groupByProperties);

  Promise.all(
    groupResult.map(async (groupedProposals) => {
      // NOTE: We get the needed ids from the first proposal in the group.
      const [{ workflowId, statusId, prevProposalStatusId }] = groupedProposals;

      const [currentConnection] = await getProposalWorkflowConnectionByStatusId(
        workflowId,
        statusId,
        prevProposalStatusId
      );

      const proposalStatusActions =
        await proposalSettingsDataSource.getStatusActionsByConnectionId(
          currentConnection.id,
          currentConnection.proposalWorkflowId
        );

      if (!proposalStatusActions?.length) {
        return;
      }

      Promise.all(
        proposalStatusActions.map(async (proposalStatusAction) => {
          if (!proposalStatusAction.id || !proposalStatusAction.type) {
            return;
          }

          switch (proposalStatusAction.type) {
            case ProposalStatusActionType.EMAIL:
              emailActionHandler(proposalStatusAction, groupedProposals);
              break;

            case ProposalStatusActionType.RABBITMQ:
              rabbitMQActionHandler(proposalStatusAction, groupedProposals);
              break;

            default:
              break;
          }
        })
      );

      return undefined;
    })
  );
};

const emailActionHandler = async (
  proposalStatusAction: ProposalStatusAction,
  proposals: WorkflowEngineProposalType[]
) => {
  const usersDataSource: UserDataSource = container.resolve(
    Tokens.UserDataSource
  );
  const sepDataSource: SEPDataSource = container.resolve(Tokens.SEPDataSource);
  const instrumentDataSource: InstrumentDataSource = container.resolve(
    Tokens.InstrumentDataSource
  );
  const mailService = container.resolve<MailService>(Tokens.MailService);

  const proposalsEmailData = proposals.map((proposal) => {
    return {
      proposalId: proposal.proposalId,
      proposalTitle: proposal.title,
    };
  });

  const config = proposalStatusAction.config as EmailActionConfig;

  if (!config.recipientsWithTemplate?.length) {
    return;
  }

  // TODO: Get the email addresses from config recipients
  const emailRecipients: { address: string }[] = [];

  const proposalsWithUsers = await Promise.all(
    config.recipientsWithTemplate.map(async (recipientWithTemplate) => {
      switch (recipientWithTemplate.recipient) {
        case EmailStatusActionRecipients.PI: {
          return Promise.all(
            proposals.map(async (proposal) => {
              const PIEmail = (
                await usersDataSource.getBasicUserInfo(proposal.proposerId)
              )?.email;

              return {
                id: EmailStatusActionRecipients.PI,
                proposalId: proposal.primaryKey,
                proposalTitle: proposal.title,
                template: recipientWithTemplate.email_template,
                emails: [PIEmail],
              };
            })
          );
        }

        case EmailStatusActionRecipients.CO_PROPOSERS: {
          return Promise.all(
            proposals.map(async (proposal) => {
              const coProposers = await usersDataSource.getProposalUsers(
                proposal.primaryKey
              );

              return {
                id: EmailStatusActionRecipients.CO_PROPOSERS,
                proposalId: proposal.primaryKey,
                proposalTitle: proposal.title,
                template: recipientWithTemplate.email_template,
                emails: coProposers.map((coProposer) => coProposer.email),
              };
            })
          );
        }

        case EmailStatusActionRecipients.INSTRUMENT_SCIENTISTS: {
          return Promise.all(
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

              const instrumentScientistsWithManagerEmails = [
                beamLineManager.email,
                ...instrumentScientists.map(
                  (instrumentScientist) => instrumentScientist.email
                ),
              ];

              return {
                id: EmailStatusActionRecipients.INSTRUMENT_SCIENTISTS,
                proposalId: proposal.primaryKey,
                proposalTitle: proposal.title,
                template: recipientWithTemplate.email_template,
                emails: instrumentScientistsWithManagerEmails,
              };
            })
          );
        }

        case EmailStatusActionRecipients.SEP_REVIEWERS: {
          return Promise.all(
            proposals.map(async (proposal) => {
              const allSepReviewers =
                await sepDataSource.getSEPUsersByProposalPkAndCallId(
                  proposal.primaryKey,
                  proposal.callId
                );

              return {
                id: EmailStatusActionRecipients.SEP_REVIEWERS,
                proposalId: proposal.primaryKey,
                proposalTitle: proposal.title,
                template: recipientWithTemplate.email_template,
                emails: allSepReviewers.map((coProposer) => coProposer.email),
              };
            })
          );
        }

        default:
          break;
      }
    })
  );

  // console.log('proposalsWithUsers', proposalsWithUsers.flat());

  logger.logInfo('this is email action type', {});

  // TODO: Sending emails should go here after the recipients are fetched.
  // console.log(proposals, proposalStatusAction);
};

const rabbitMQActionHandler = (
  proposalStatusAction: ProposalStatusAction,
  proposals: WorkflowEngineProposalType[]
) => {
  logger.logInfo('this is rabbitmq action type', {});
};
