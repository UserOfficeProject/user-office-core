import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { ExperimentSafetyWithWorkflowStatusConnectionId } from './statusActionEngine';
import { Tokens } from '../../../config/Tokens';
import { ExperimentDataSource } from '../../../datasources/ExperimentDataSource';
import { InstrumentDataSource } from '../../../datasources/InstrumentDataSource';
import { ProposalDataSource } from '../../../datasources/ProposalDataSource';
import { UserDataSource } from '../../../datasources/UserDataSource';
import { ApplicationEvent } from '../../../events/applicationEvents';
import { Event } from '../../../events/event.enum';
import { ExperimentSafety } from '../../../models/Experiment';
import { BasicUserDetails, UserRole } from '../../../models/User';
import {
  EmailStatusActionRecipients,
  EmailStatusActionRecipientsWithTemplate,
} from '../../../resolvers/types/StatusActionConfig';

export const groupExperimentSafetiesByProperties = (
  experimentSafeties: ExperimentSafetyWithWorkflowStatusConnectionId[],
  props: string[]
): ExperimentSafetyWithWorkflowStatusConnectionId[][] => {
  const getExperimentSafetyGroups = (
    item: ExperimentSafetyWithWorkflowStatusConnectionId
  ) => {
    const groupItemsArray = [];
    for (let i = 0; i < props.length; i++) {
      groupItemsArray.push(
        item[props[i] as keyof ExperimentSafetyWithWorkflowStatusConnectionId]
      );
    }

    return groupItemsArray;
  };

  const experimentSafetyGroups: Record<
    string,
    ExperimentSafetyWithWorkflowStatusConnectionId[]
  > = {};

  for (let i = 0; i < experimentSafeties.length; i++) {
    const item = experimentSafeties[i];
    const experimentSafetyGroup = JSON.stringify(
      getExperimentSafetyGroups(item)
    );
    experimentSafetyGroups[experimentSafetyGroup] =
      experimentSafetyGroups[experimentSafetyGroup] || [];
    experimentSafetyGroups[experimentSafetyGroup].push(item);
  }

  return Object.keys(experimentSafetyGroups).map((group) => {
    return experimentSafetyGroups[group];
  });
};

export type EmailReadyType = {
  id: EmailStatusActionRecipients;
  experimentSafety: ExperimentSafety;
  template: string;
  email: string;
  firstName?: string;
  lastName?: string;
  preferredName?: string;
  pi?: BasicUserDetails | null;
};

export const getPIAndFormatOutputForEmailSending = async (
  experimentSafety: ExperimentSafety,
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate
) => {
  const usersDataSource: UserDataSource = container.resolve(
    Tokens.UserDataSource
  );
  const proposalDataSource: ProposalDataSource = container.resolve(
    Tokens.ProposalDataSource
  );
  const experimentDataSource: ExperimentDataSource = container.resolve(
    Tokens.ExperimentDataSource
  );

  const experiment = await experimentDataSource.getExperiment(
    experimentSafety.experimentPk
  );
  if (!experiment) {
    logger.logError('Experiment not found for experiment safety', {
      experimentSafety,
    });

    return;
  }
  const proposal = await proposalDataSource.get(experiment.proposalPk);
  if (!proposal) {
    logger.logError('Proposal not found for experiment safety', {
      experimentSafety,
      experiment,
    });

    return;
  }

  const PI = await usersDataSource.getBasicUserInfo(proposal.proposerId);
  if (!PI) {
    logger.logError('PI not found for proposal', {
      proposal,
    });

    return;
  }

  return {
    id: recipientWithTemplate.recipient.name,
    experimentSafety: experimentSafety,
    template: recipientWithTemplate.emailTemplate.id,
    email: PI.email,
    firstName: PI.firstname,
    lastName: PI.lastname,
    preferredName: PI.preferredname,
  };
};

export const getInstrumentScientistsAndFormatOutputForEmailSending = async (
  experimentSafety: ExperimentSafety,
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate
) => {
  const instrumentDataSource: InstrumentDataSource = container.resolve(
    Tokens.InstrumentDataSource
  );
  const usersDataSource: UserDataSource = container.resolve(
    Tokens.UserDataSource
  );

  const proposalDataSource: ProposalDataSource = container.resolve(
    Tokens.ProposalDataSource
  );
  const experimentDataSource: ExperimentDataSource = container.resolve(
    Tokens.ExperimentDataSource
  );

  const experiment = await experimentDataSource.getExperiment(
    experimentSafety.experimentPk
  );

  if (!experiment) {
    logger.logError('Experiment not found for instrument scientists', {
      experimentSafety,
    });

    return;
  }
  const proposal = await proposalDataSource.get(experiment.proposalPk);
  if (!proposal) {
    logger.logError('Proposal not found for instrument scientists', {
      experimentSafety,
      experiment,
    });

    return;
  }

  const proposalInstruments =
    await instrumentDataSource.getInstrumentsByProposalPk(proposal.primaryKey);

  if (!proposalInstruments?.length) {
    logger.logError('No instruments found for proposal', {
      experimentSafety,
      proposalPk: proposal.primaryKey,
    });

    return;
  }

  const instrumentsPeople = await Promise.all(
    proposalInstruments.map(async (proposalInstrument) => {
      const instrumentContact = await usersDataSource.getBasicUserInfo(
        proposalInstrument.managerUserId
      );

      if (!instrumentContact) {
        logger.logError('Instrument manager user not found', {
          experimentSafety,
          instrumentId: proposalInstrument.id,
          managerUserId: proposalInstrument.managerUserId,
        });

        return;
      }

      const instrumentScientists =
        await instrumentDataSource.getInstrumentScientists(
          proposalInstrument.id
        );

      return [instrumentContact, ...instrumentScientists];
    })
  );

  const filteredInstrumentPeople = instrumentsPeople
    .flat()
    .filter(
      (user, i, array): user is BasicUserDetails =>
        !!user &&
        array.findIndex((comparedUser) => comparedUser?.id === user?.id) === i
    );

  return filteredInstrumentPeople.map((IS) => ({
    id: recipientWithTemplate.recipient.name,
    experimentSafety,
    template: recipientWithTemplate.emailTemplate.id,
    email: IS.email,
    firstName: IS.firstname,
    lastName: IS.lastname,
    preferredName: IS.preferredname,
  }));
};

export const getExperimentSafetyReviewersAndFormatOutputForEmailSending =
  async (
    experimentSafety: ExperimentSafety,
    recipientWithTemplate: EmailStatusActionRecipientsWithTemplate
  ) => {
    const usersDataSource: UserDataSource = container.resolve(
      Tokens.UserDataSource
    );

    const experimentSafetyReviewers = await usersDataSource.getUsers({
      userRole: UserRole.EXPERIMENT_SAFETY_REVIEWER,
    });

    if (!experimentSafetyReviewers?.users?.length) {
      logger.logError(
        'Could not send email to the Experiment Safety Reviewers because no users with the Experiment Safety Reviewer role were found.',
        { experimentSafetyReviewers }
      );

      return;
    }

    return experimentSafetyReviewers.users.map((ESR) => ({
      id: recipientWithTemplate.recipient.name,
      experimentSafety,
      template: recipientWithTemplate.emailTemplate.id,
      email: ESR.email,
      firstName: ESR.firstname,
      lastName: ESR.lastname,
      preferredName: ESR.preferredname,
    }));
  };

export const constructExperimentSafetyStatusChangeEvent = (
  experimentSafety: ExperimentSafety,
  loggedInUserId: number | null,
  messageDescription: string,
  exchange?: string
) => {
  const event = {
    type: Event.EXPERIMENT_SAFETY_STATUS_ACTION_EXECUTED,
    experimentSafety: experimentSafety,
    key: 'experimentSafety',
    loggedInUserId,
    isRejection: false,
    description: messageDescription,
    exchange: exchange,
  } as ApplicationEvent;

  return event;
};
