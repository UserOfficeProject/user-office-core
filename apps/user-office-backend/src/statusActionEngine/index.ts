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
import { BasicUserDetails } from '../models/User';
import {
  EmailActionConfig,
  EmailStatusActionRecipients,
  EmailStatusActionRecipientsWithTemplate,
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

type EmailReadyType = {
  id: EmailStatusActionRecipients;
  proposals: { proposalId: number; proposalTitle: string }[];
  template: string;
  email: string;
};

const getEmailReadyArrayOfUsersAndProposals = (
  newArray: EmailReadyType[],
  array: BasicUserDetails[],
  proposal: WorkflowEngineProposalType,
  recipientsWithTemplate: EmailStatusActionRecipientsWithTemplate
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
        id: recipientsWithTemplate.recipient,
        proposals: [
          {
            proposalId: proposal.primaryKey,
            proposalTitle: proposal.title,
          },
        ],

        template: recipientsWithTemplate.email_template,
        email: item.email,
      });
    }
  });
};

const sendMail = (
  mailService: MailService,
  recipientsWithData: EmailReadyType[]
) => {
  Promise.all(
    recipientsWithData.map(async (recipientWithData) => {
      return mailService
        .sendMail({
          content: {
            template_id: recipientWithData.template,
          },
          substitution_data: {
            proposals: recipientWithData.proposals,
          },
          recipients: [{ address: recipientWithData.email }],
        })
        .then((res: any) => {
          logger.logInfo('Email sent:', {
            result: res,
          });
        })
        .catch((err: string) => {
          logger.logError('Could not send email', {
            error: err,
          });
        });
    })
  );
};

export const statusActionEngine = async (
  proposals: WorkflowEngineProposalType[]
): Promise<undefined> => {
  const proposalSettingsDataSource: ProposalSettingsDataSource =
    container.resolve(Tokens.ProposalSettingsDataSource);
  const usersDataSource: UserDataSource = container.resolve(
    Tokens.UserDataSource
  );
  const sepDataSource: SEPDataSource = container.resolve(Tokens.SEPDataSource);
  const instrumentDataSource: InstrumentDataSource = container.resolve(
    Tokens.InstrumentDataSource
  );
  const mailService = container.resolve<MailService>(Tokens.MailService);

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
          if (
            !proposalStatusAction.id ||
            !proposalStatusAction.type ||
            proposalStatusAction.executed
          ) {
            return;
          }

          switch (proposalStatusAction.type) {
            case ProposalStatusActionType.EMAIL:
              emailActionHandler(proposalStatusAction, groupedProposals, {
                instrumentDataSource,
                sepDataSource,
                usersDataSource,
                mailService,
              });
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

const getPIAndFormatOutputForEmailSending = async (
  usersDataSource: UserDataSource,
  proposals: WorkflowEngineProposalType[],
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate
) => {
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

const getCoProposersAndFormatOutputForEmailSending = async (
  usersDataSource: UserDataSource,
  proposals: WorkflowEngineProposalType[],
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate
) => {
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

const getSEPReviewersAndFormatOutputForEmailSending = async (
  sepDataSource: SEPDataSource,
  proposals: WorkflowEngineProposalType[],
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate
) => {
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
const getInstrumentScientistsAndFormatOutputForEmailSending = async (
  usersDataSource: UserDataSource,
  instrumentDataSource: InstrumentDataSource,
  proposals: WorkflowEngineProposalType[],
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate
) => {
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

const emailActionHandler = async (
  proposalStatusAction: ProposalStatusAction,
  proposals: WorkflowEngineProposalType[],
  {
    usersDataSource,
    instrumentDataSource,
    sepDataSource,
    mailService,
  }: {
    usersDataSource: UserDataSource;
    instrumentDataSource: InstrumentDataSource;
    sepDataSource: SEPDataSource;
    mailService: MailService;
  }
) => {
  const config = proposalStatusAction.config as EmailActionConfig;
  if (!config.recipientsWithTemplate?.length) {
    return;
  }

  Promise.all(
    config.recipientsWithTemplate.map(async (recipientWithTemplate) => {
      switch (recipientWithTemplate.recipient) {
        case EmailStatusActionRecipients.PI: {
          const PIs = await getPIAndFormatOutputForEmailSending(
            usersDataSource,
            proposals,
            recipientWithTemplate
          );

          sendMail(mailService, PIs);

          break;
        }

        case EmailStatusActionRecipients.CO_PROPOSERS: {
          const CPs = await getCoProposersAndFormatOutputForEmailSending(
            usersDataSource,
            proposals,
            recipientWithTemplate
          );

          sendMail(mailService, CPs);

          break;
        }

        case EmailStatusActionRecipients.INSTRUMENT_SCIENTISTS: {
          const ISs =
            await getInstrumentScientistsAndFormatOutputForEmailSending(
              usersDataSource,
              instrumentDataSource,
              proposals,
              recipientWithTemplate
            );

          sendMail(mailService, ISs);

          break;
        }

        case EmailStatusActionRecipients.SEP_REVIEWERS: {
          const SRs = await getSEPReviewersAndFormatOutputForEmailSending(
            sepDataSource,
            proposals,
            recipientWithTemplate
          );

          sendMail(mailService, SRs);

          break;
        }

        default:
          break;
      }
    })
  );

  // console.log('proposalsWithUsers', proposalsWithUsers.flat());

  logger.logInfo('this is email action type', {});

  // TODO: After action is executed update the action config here. proposalStatusAction.executed should become true.
};

const rabbitMQActionHandler = (
  proposalStatusAction: ProposalStatusAction,
  proposals: WorkflowEngineProposalType[]
) => {
  logger.logInfo('this is rabbitmq action type', {});
};
