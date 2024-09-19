/* eslint-disable no-console */
import 'dotenv/config';

import { faker } from '@faker-js/faker';
import 'reflect-metadata';
import '../config';
import { container } from 'tsyringe';

import AdminDataSource from '../datasources/postgres/AdminDataSource';
import CallDataSource from '../datasources/postgres/CallDataSource';
import FapDataSource from '../datasources/postgres/FapDataSource';
import InstrumentDataSource from '../datasources/postgres/InstrumentDataSource';
import ProposalDataSource from '../datasources/postgres/ProposalDataSource';
import ProposalSettingsDataSource from '../datasources/postgres/ProposalSettingsDataSource';
import QuestionaryDataSource from '../datasources/postgres/QuestionaryDataSource';
import ReviewDataSource from '../datasources/postgres/ReviewDataSource';
import TemplateDataSource from '../datasources/postgres/TemplateDataSource';
import UserDataSource from '../datasources/postgres/UserDataSource';
import { AllocationTimeUnits } from '../models/Call';
import { getQuestionDefinition } from '../models/questionTypes/QuestionRegistry';
import { TechnicalReviewStatus } from '../models/TechnicalReview';
import {
  DataType,
  TemplateCategoryId,
  TemplatesHasQuestions,
} from '../models/Template';
import { UserRole } from '../models/User';
import { TemplateGroupId } from './../models/Template';
import * as dummy from './dummy';
import { execute } from './executor';

const MAX_USERS = 1000;
const MAX_TEMPLATES = 15;
const MAX_REVIEW_TEMPLATES = 15;
const MAX_CALLS = 11;
const MAX_INSTRUMENTS = 16;
const MAX_PROPOSALS = 500;
const MAX_FAPS = 10;
const MAX_REVIEWS = 600;
const MAX_WORKFLOWS = 1;

const adminDataSource = container.resolve(AdminDataSource);
const callDataSource = container.resolve(CallDataSource);
const instrumentDataSource = container.resolve(InstrumentDataSource);
const proposalDataSource = container.resolve(ProposalDataSource);
const proposalSettingsDataSource = container.resolve(
  ProposalSettingsDataSource
);
const questionaryDataSource = container.resolve(QuestionaryDataSource);
const reviewDataSource = container.resolve(ReviewDataSource);
const fapDataSource = container.resolve(FapDataSource);
const templateDataSource = container.resolve(TemplateDataSource);
const userDataSource = container.resolve(UserDataSource);

const createUniqueIntArray = (size: number, max: number) => {
  if (size > max) {
    throw Error('size must be smaller than max');
  }
  const shuffle = (array: number[]) => {
    array.sort(() => Math.random() - 0.5);
  };

  const array = Array.from(Array(max).keys());
  array.shift(); //excluding 0
  shuffle(array);

  return array.slice(0, size);
};

const createUsers = async () => {
  return execute(async () => {
    const userId = await userDataSource.createInviteUser({
      firstname: faker.name.firstName(),
      lastname: faker.name.lastName(),
      email: faker.internet.email(),
      userRole: UserRole.USER,
    });
    if (Math.random() > 0.8) {
      userDataSource.addUserRole({
        userID: userId,
        roleID: UserRole.FAP_REVIEWER,
      });
    }
    if (Math.random() > 0.8) {
      userDataSource.addUserRole({
        userID: userId,
        roleID: UserRole.FAP_REVIEWER,
      });
    }
    if (Math.random() > 0.8) {
      userDataSource.addUserRole({
        userID: userId,
        roleID: UserRole.INSTRUMENT_SCIENTIST,
      });
    }
    if (Math.random() > 0.9) {
      userDataSource.addUserRole({
        userID: userId,
        roleID: UserRole.FAP_CHAIR,
      });
    }
    if (Math.random() > 0.9) {
      userDataSource.addUserRole({
        userID: userId,
        roleID: UserRole.FAP_SECRETARY,
      });
    }
    if (Math.random() > 0.95) {
      userDataSource.addUserRole({
        userID: userId,
        roleID: UserRole.USER_OFFICER,
      });
    }

    return userId;
  }, MAX_USERS);
};

const createWorkflows = async () => {
  await execute(() => {
    return proposalSettingsDataSource.createProposalWorkflow({
      name: faker.lorem.word(),
      description: faker.lorem.words(5),
    });
  }, MAX_WORKFLOWS);
};

const createCalls = async () => {
  await execute(() => {
    return callDataSource.create({
      cycleComment: faker.random.words(5),
      startCall: faker.date.past(1),
      startCycle: faker.date.past(1),
      startNotify: faker.date.past(1),
      startReview: faker.date.past(1),
      startFapReview: faker.date.past(1),
      endNotify: faker.date.future(1),
      endCall: faker.date.future(1),
      endCallInternal: faker.date.future(1),
      endCycle: faker.date.future(1),
      endReview: faker.date.future(1),
      endFapReview: faker.date.future(1),
      referenceNumberFormat: faker.random.words(8),
      proposalSequence: faker.datatype.number({
        min: 0,
        max: 100,
      }),
      shortCode: `${dummy.word().substr(0, 15)}${dummy.positiveNumber(100)}`,
      surveyComment: faker.random.words(5),
      submissionMessage: faker.random.words(5),
      proposalWorkflowId: 1,
      templateId: dummy.positiveNumber(MAX_TEMPLATES),
      fapReviewTemplateId: dummy.positiveNumber(MAX_REVIEW_TEMPLATES),
      allocationTimeUnit: AllocationTimeUnits.Day,
      title: faker.random.words(8),
      description: faker.random.words(10),
    });
  }, MAX_CALLS);
};

const createTemplates = async () => {
  const templates = await execute(() => {
    return templateDataSource.createTemplate({
      groupId: TemplateGroupId.PROPOSAL,
      name: faker.random.word(),
      description: faker.random.words(3),
    });
  }, MAX_TEMPLATES);

  for (const template of templates) {
    await execute(() => {
      return templateDataSource.createTopic({
        sortOrder: faker.datatype.number({
          min: 0,
          max: 100,
        }),
        templateId: template.templateId,
      });
    }, dummy.positiveNumber(5));

    const steps = await templateDataSource.getTemplateSteps(
      template.templateId
    );

    for (const step of steps) {
      const questions = await execute(() => {
        const questionId = `text_input_${new Date().getTime()}`;

        return templateDataSource.createQuestion(
          TemplateCategoryId.PROPOSAL_QUESTIONARY,
          questionId,
          questionId,
          DataType.TEXT_INPUT,
          `${faker.random.words(5)}?`,
          JSON.stringify(
            getQuestionDefinition(DataType.TEXT_INPUT).createBlankConfig()
          )
        );
      }, 10);

      for (const question of questions) {
        await templateDataSource.upsertQuestionTemplateRelations([
          {
            questionId: question.id,
            sortOrder: faker.datatype.number({
              min: 0,
              max: 100,
            }),
            templateId: template.templateId,
            topicId: step.topic.id,
          } as TemplatesHasQuestions,
        ]);
      }
    }
  }
};

const createReviewTemplates = async () => {
  const templates = await execute(() => {
    return templateDataSource.createTemplate({
      groupId: TemplateGroupId.FAP_REVIEW,
      name: faker.random.word(),
      description: faker.random.words(3),
    });
  }, MAX_REVIEW_TEMPLATES);

  for (const template of templates) {
    await execute(() => {
      return templateDataSource.createTopic({
        sortOrder: faker.datatype.number({
          min: 0,
          max: 100,
        }),
        templateId: template.templateId,
      });
    }, dummy.positiveNumber(5));

    const steps = await templateDataSource.getTemplateSteps(
      template.templateId
    );

    for (const step of steps) {
      const questions = await execute(() => {
        const questionId = `text_input_${new Date().getTime()}`;

        return templateDataSource.createQuestion(
          TemplateCategoryId.FAP_REVIEW,
          questionId,
          questionId,
          DataType.TEXT_INPUT,
          `${faker.random.words(5)}?`,
          JSON.stringify(
            getQuestionDefinition(DataType.TEXT_INPUT).createBlankConfig()
          )
        );
      }, 10);

      for (const question of questions) {
        await templateDataSource.upsertQuestionTemplateRelations([
          {
            questionId: question.id,
            sortOrder: faker.datatype.number({
              min: 0,
              max: 100,
            }),
            templateId: template.templateId,
            topicId: step.topic.id,
          } as TemplatesHasQuestions,
        ]);
      }
    }
  }
};

const createInstruments = async () => {
  const instruments = await execute(() => {
    return instrumentDataSource.create({
      name: `${dummy.word()}${dummy.positiveNumber(100)}`,
      description: faker.random.words(5),
      shortCode: `${dummy.word()}${dummy.positiveNumber(100)}`.substr(0, 19),
      managerUserId: 1,
    });
  }, MAX_INSTRUMENTS);

  for (const instrument of instruments) {
    await instrumentDataSource.assignScientistsToInstrument(
      createUniqueIntArray(3, MAX_USERS),
      instrument.id
    );
    await instrumentDataSource.setAvailabilityTimeOnInstrument(
      dummy.positiveNumber(MAX_CALLS),
      instrument.id,
      dummy.positiveNumber(100)
    );
  }
};

const createProposals = async () => {
  await execute(async () => {
    const questionary = await questionaryDataSource.create(
      dummy.positiveNumber(MAX_USERS),
      dummy.positiveNumber(MAX_TEMPLATES)
    );
    const proposal = await proposalDataSource.create(
      dummy.positiveNumber(MAX_USERS),
      dummy.positiveNumber(MAX_CALLS),
      questionary.questionaryId!
    );
    await proposalDataSource.update({
      ...proposal,
      title: faker.random.words(3),
      abstract: faker.random.words(7),
    });
    await proposalDataSource.setProposalUsers(
      proposal.primaryKey,
      createUniqueIntArray(3, MAX_USERS)
    );
    const questionarySteps = await questionaryDataSource.getQuestionarySteps(
      questionary.questionaryId!
    );
    for (const step of questionarySteps) {
      for (const question of step.fields) {
        await questionaryDataSource.updateAnswer(
          questionary.questionaryId!,
          question.question.id,
          JSON.stringify({ value: faker.random.words(5) })
        );
      }
      await questionaryDataSource.updateTopicCompleteness(
        questionary.questionaryId!,
        step.topic.id,
        true
      );
    }

    instrumentDataSource.assignProposalToInstrument(
      proposal.primaryKey,
      dummy.positiveNumber(MAX_INSTRUMENTS)
    );
  }, MAX_PROPOSALS);
};

const createReviews = async () => {
  await execute(() => {
    return reviewDataSource.setTechnicalReview(
      {
        proposalPk: dummy.positiveNumber(MAX_PROPOSALS),
        comment: faker.random.words(50),
        publicComment: faker.random.words(25),
        status:
          Math.random() > 0.5
            ? TechnicalReviewStatus.FEASIBLE
            : TechnicalReviewStatus.UNFEASIBLE,
        timeAllocation: dummy.positiveNumber(10),
        submitted: faker.datatype.boolean(),
        reviewerId: 1,
        instrumentId: 1,
        files: '[]',
      },
      false
    );
  }, MAX_REVIEWS);
};

const createFaps = async () => {
  await execute(async () => {
    const fap = await fapDataSource.create(
      dummy.word(),
      faker.random.words(5),
      dummy.positiveNumber(5),
      faker.random.words(5),
      true,
      true
    );
    await fapDataSource.assignChairOrSecretaryToFap({
      fapId: fap.id,
      roleId: UserRole.FAP_CHAIR,
      userId: dummy.positiveNumber(MAX_USERS),
    });
    await fapDataSource.assignChairOrSecretaryToFap({
      fapId: fap.id,
      roleId: UserRole.FAP_SECRETARY,
      userId: dummy.positiveNumber(MAX_USERS),
    });
    await fapDataSource.assignReviewersToFap({
      fapId: fap.id,
      memberIds: [dummy.positiveNumber(MAX_USERS)],
    });
    const proposalPks = createUniqueIntArray(5, MAX_PROPOSALS);
    for (const proposalPk of proposalPks) {
      const tmpUserId = dummy.positiveNumber(MAX_USERS);
      const instrumentHasProposals =
        await instrumentDataSource.assignProposalToInstrument(
          proposalPk,
          dummy.positiveNumber(MAX_INSTRUMENTS)
        );
      await fapDataSource.assignProposalsToFaps([
        {
          call_id: 1,
          proposal_pk: proposalPk,
          instrument_id: instrumentHasProposals.instrumentIds[0],
          fap_id: fap.id,
          instrument_has_proposals_id:
            instrumentHasProposals.instrumentHasProposalIds[0],
        },
      ]);

      const fapReviewQuestionary = await questionaryDataSource.create(
        tmpUserId,
        1
      );

      await fapDataSource.assignMembersToFapProposals(
        [
          {
            proposalPk,
            memberId: tmpUserId,
            fapProposalId: 1,
            questionaryId: fapReviewQuestionary.questionaryId,
          },
        ],
        fap.id
      );
      await reviewDataSource.addUserForReview({
        proposalPk: proposalPk,
        fapID: fap.id,
        userID: tmpUserId,
        questionaryID: fapReviewQuestionary.questionaryId,
      });
    }
  }, MAX_FAPS);
};

async function run() {
  console.log('Starting...');
  await adminDataSource.resetDB(false);
  await createUsers();
  await createTemplates();
  await createWorkflows();
  await createCalls();
  await createInstruments();
  await createProposals();
  await createFaps();
  await createReviews();
}

run().then(() => {
  console.log('Finished!');
});
