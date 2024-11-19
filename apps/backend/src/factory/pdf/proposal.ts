import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { ProposalAuthorization } from '../../auth/ProposalAuthorization';
import baseContext from '../../buildContext';
import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { GenericTemplateDataSource } from '../../datasources/GenericTemplateDataSource';
import { InstrumentDataSource } from '../../datasources/InstrumentDataSource';
import { PdfTemplateDataSource } from '../../datasources/PdfTemplateDataSource';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../../datasources/QuestionaryDataSource';
import { ReviewDataSource } from '../../datasources/ReviewDataSource';
import { SampleDataSource } from '../../datasources/SampleDataSource';
import { UserDataSource } from '../../datasources/UserDataSource';
import { DownloadOptions } from '../../middlewares/factory/factoryServices';
import { Call } from '../../models/Call';
import { GenericTemplate } from '../../models/GenericTemplate';
import { Instrument } from '../../models/Instrument';
import { Proposal } from '../../models/Proposal';
import { getTopicActiveAnswers } from '../../models/ProposalModelFunctions';
import { Answer, QuestionaryStep } from '../../models/Questionary';
import { isRejection } from '../../models/Rejection';
import { Review } from '../../models/Review';
import { Sample } from '../../models/Sample';
import {
  TechnicalReview,
  TechnicalReviewStatus,
} from '../../models/TechnicalReview';
import { DataType } from '../../models/Template';
import { BasicUserDetails, UserWithRole } from '../../models/User';
import { InstrumentPickerConfig } from '../../resolvers/types/FieldConfig';
import { PdfTemplate } from '../../resolvers/types/PdfTemplate';
import { getFileAttachments, Attachment } from '../util';
import {
  collectGenericTemplatePDFData,
  GenericTemplatePDFData,
} from './genericTemplates';
import { collectSamplePDFData, SamplePDFData } from './sample';
export type ProposalPDFData = {
  proposal: Proposal;
  principalInvestigator: BasicUserDetails;
  coProposers: BasicUserDetails[];
  questionarySteps: QuestionaryStep[];
  attachments: Attachment[];
  technicalReviews: (Omit<TechnicalReview, 'status'> & {
    status: string;
    instrumentName?: string;
  })[];
  fapReviews?: Review[];
  samples: Array<Pick<SamplePDFData, 'sample' | 'sampleQuestionaryFields'>>;
  genericTemplates: Array<
    Pick<
      GenericTemplatePDFData,
      'genericTemplate' | 'genericTemplateQuestionaryFields'
    >
  >;
  pdfTemplate: PdfTemplate | null;
};

const getTechnicalReviewHumanReadableStatus = (
  status: TechnicalReviewStatus | null
): string => {
  switch (status) {
    case TechnicalReviewStatus.FEASIBLE:
      return 'Feasible';
    case TechnicalReviewStatus.PARTIALLY_FEASIBLE:
      return 'Partially feasible';
    case TechnicalReviewStatus.UNFEASIBLE:
      return 'Unfeasible';
    default:
      return `Unknown status: ${status}`;
  }
};

const getSampleQuestionarySteps = async (
  questionaryId: number
): Promise<QuestionaryStep[]> => {
  const questionaryDataSource = container.resolve<QuestionaryDataSource>(
    Tokens.QuestionaryDataSource
  );
  const questionarySteps =
    await questionaryDataSource.getQuestionarySteps(questionaryId);
  if (!questionarySteps) {
    throw new Error(
      `Questionary steps for Questionary ID '${questionaryId}' not found, or the user has insufficient rights`
    );
  }

  return questionarySteps;
};

const getQuestionary = async (questionaryId: number) => {
  const questionaryDataSource = container.resolve<QuestionaryDataSource>(
    Tokens.QuestionaryDataSource
  );
  const questionary = await questionaryDataSource.getQuestionary(questionaryId);

  if (!questionary) {
    throw new Error(`Questionary with ID '${questionaryId}' not found`);
  }

  return questionary;
};

const instrumentPickerAnswer = (
  answer: Answer,
  instruments: Instrument[],
  call: Call
): string => {
  const instrumentPickerConfig = answer.config as InstrumentPickerConfig;
  if (instrumentPickerConfig.requestTime) {
    const instrumentWithTime = instruments?.map((i) => {
      const filtered = Array.isArray(answer.value)
        ? answer.value.find(
            (v: {
              instrumentId: string;
              instrumentName: string;
              timeRequested: number;
            }) => Number(v.instrumentId) == i.id
          )
        : answer.value;

      return (
        i.name +
        ' (' +
        filtered.timeRequested +
        ' ' +
        call.allocationTimeUnit +
        ') '
      );
    });

    return instrumentWithTime?.join(', ');
  } else {
    const instrumentWithTime = instruments?.length
      ? instruments.map((instrument) => instrument.name).join(', ')
      : '';

    return instrumentWithTime;
  }
};
const addTopicInformation = async (
  proposalPDFData: ProposalPDFData,
  questionarySteps: QuestionaryStep[],
  samples: Sample[],
  genericTemplates: GenericTemplate[],
  sampleAttachments: Attachment[],
  genericTemplateAttachments: Attachment[]
) => {
  const updatedProposalPDFData = { ...proposalPDFData };
  for (const step of questionarySteps) {
    if (!step) {
      logger.logError('step not found', { ...questionarySteps }); // TODO: fix type of the second param in the lib (don't use Record<string, unknown>)

      throw 'Could not download generated PDF';
    }

    const topic = step.topic;
    const answers = getTopicActiveAnswers(questionarySteps, topic.id).filter(
      // skip `PROPOSAL_BASIS` types
      (answer) => answer.question.dataType !== DataType.PROPOSAL_BASIS
    );

    // if the questionary step has nothing else but `PROPOSAL_BASIS` question
    // skip the whole step because the first page already has every related information
    if (answers.length === 0) {
      continue;
    }

    const questionaryAttachments: Attachment[] = [];

    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];

      questionaryAttachments.push(...getFileAttachments(answer));

      if (answer.question.dataType === DataType.SAMPLE_DECLARATION) {
        answer.value = samples
          .filter((sample) => sample.questionId === answer.question.id)
          .map((sample) => sample);
      } else if (answer.question.dataType === DataType.GENERIC_TEMPLATE) {
        answer.value = genericTemplates
          .filter(
            (genericTemplate) =>
              genericTemplate.questionId === answer.question.id
          )
          .map((genericTemplate) => genericTemplate);
      } else if (answer.question.dataType === DataType.INSTRUMENT_PICKER) {
        const ids = Array.isArray(answer.value)
          ? answer.value.map((v: { instrumentId: string }) =>
              Number(v.instrumentId)
            )
          : [Number(answer.value?.instrumentId || '0')];
        const instrumentDataSource = container.resolve<InstrumentDataSource>(
          Tokens.InstrumentDataSource
        );
        const callDataSource = container.resolve<CallDataSource>(
          Tokens.CallDataSource
        );
        const instruments = await instrumentDataSource.getInstrumentsByIds(ids);

        const call = await callDataSource.getCallByAnswerId(answer.answerId);
        answer.value = instrumentPickerAnswer(answer, instruments, call);
      }
    }

    updatedProposalPDFData.questionarySteps.push({
      ...step,
      fields: answers,
    });
    updatedProposalPDFData.attachments.push(...questionaryAttachments);
    updatedProposalPDFData.attachments.push(...sampleAttachments);
    updatedProposalPDFData.attachments.push(...genericTemplateAttachments);
  }

  return updatedProposalPDFData;
};

export const collectProposalPDFData = async (
  proposalPk: number,
  user: UserWithRole,
  notify?: CallableFunction
): Promise<ProposalPDFData> => {
  const proposalAuth = container.resolve(ProposalAuthorization);
  const proposal = await baseContext.queries.proposal.get(user, proposalPk);

  if (proposal === null) {
    throw new Error('Proposal not found');
  }

  // Authenticate user
  const hasReadRights = await proposalAuth.hasReadRights(user, proposal);
  if (hasReadRights === false) {
    throw new Error('User was not allowed to download PDF');
  }

  const call = await baseContext.queries.call.get(user, proposal.callId);

  /*
   * Because naming things is hard, the PDF template ID is the templateId for
   * for the PdfTemplate and not the pdfTemplateId.
   */
  const pdfTemplateId = call?.pdfTemplateId;
  let pdfTemplate: PdfTemplate | null = null;
  if (pdfTemplateId !== undefined) {
    pdfTemplate = (
      await baseContext.queries.pdfTemplate.getPdfTemplates(user, {
        filter: {
          templateIds: [pdfTemplateId],
        },
      })
    )[0];
  }

  const queries = baseContext.queries.questionary;

  const questionarySteps = await queries.getQuestionarySteps(
    user,
    proposal.questionaryId
  );

  if (isRejection(questionarySteps) || questionarySteps == null) {
    throw new Error('Could not fetch questionary');
  }

  const principalInvestigator = await baseContext.queries.user.getBasic(
    user,
    proposal.proposerId
  );
  const coProposers = await baseContext.queries.user.getProposers(
    user,
    proposalPk
  );

  if (!principalInvestigator || !coProposers) {
    throw new Error('User was not PI or co-proposer');
  }

  const sampleAttachments: Attachment[] = [];

  const samples = await baseContext.queries.sample.getSamples(user, {
    filter: { proposalPk },
  });

  const samplePDFData = (
    await Promise.all(
      samples.map((sample) => collectSamplePDFData(sample.id, user))
    )
  ).map(({ sample, sampleQuestionaryFields, attachments }) => {
    sampleAttachments.push(...attachments);

    return { sample, sampleQuestionaryFields };
  });

  notify?.(
    `${proposal.proposalId}_${
      principalInvestigator.lastname
    }_${proposal.created.getUTCFullYear()}.pdf`
  );

  const genericTemplateAttachments: Attachment[] = [];

  const genericTemplates =
    await baseContext.queries.genericTemplate.getGenericTemplates(user, {
      filter: { proposalPk },
    });

  const genericTemplatePDFData = (
    await Promise.all(
      genericTemplates.map((genericTemplate) =>
        collectGenericTemplatePDFData(genericTemplate.id, user)
      )
    )
  ).map(
    ({ genericTemplate, genericTemplateQuestionaryFields, attachments }) => {
      genericTemplateAttachments.push(...attachments);

      return { genericTemplate, genericTemplateQuestionaryFields };
    }
  );

  notify?.(
    `${proposal.proposalId}_${
      principalInvestigator.lastname
    }_${proposal.created.getUTCFullYear()}.pdf`
  );

  const out: ProposalPDFData = {
    proposal,
    principalInvestigator,
    coProposers,
    questionarySteps: [],
    attachments: [],
    technicalReviews: [],
    samples: samplePDFData,
    genericTemplates: genericTemplatePDFData,
    pdfTemplate,
  };

  // Information from each topic in proposal
  for (const step of questionarySteps) {
    if (!step) {
      logger.logError('step not found', { ...questionarySteps }); // TODO: fix type of the second param in the lib (don't use Record<string, unknown>)

      throw 'Could not download generated PDF';
    }

    const topic = step.topic;
    const answers = getTopicActiveAnswers(questionarySteps, topic.id).filter(
      // skip `PROPOSAL_BASIS` types
      (answer) => answer.question.dataType !== DataType.PROPOSAL_BASIS
    );

    // if the questionary step has nothing else but `PROPOSAL_BASIS` question
    // skip the whole step because the first page already has every related information
    if (answers.length === 0) {
      continue;
    }

    const questionaryAttachments: Attachment[] = [];

    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];

      questionaryAttachments.push(...getFileAttachments(answer));

      if (answer.question.dataType === DataType.SAMPLE_DECLARATION) {
        answer.value = samples
          .filter((sample) => sample.questionId === answer.question.id)
          .map((sample) => sample);
      } else if (answer.question.dataType === DataType.GENERIC_TEMPLATE) {
        answer.value = genericTemplates
          .filter(
            (genericTemplate) =>
              genericTemplate.questionId === answer.question.id
          )
          .map((genericTemplate) => genericTemplate);
      } else if (answer.question.dataType === DataType.INSTRUMENT_PICKER) {
        const ids = Array.isArray(answer.value)
          ? answer.value.map((v: { instrumentId: string }) =>
              Number(v.instrumentId)
            )
          : [Number(answer.value?.instrumentId || '0')];
        const instruments =
          await baseContext.queries.instrument.getInstrumentsByIds(user, ids);
        const call = await baseContext.queries.call.getCallByAnswerId(
          user,
          answer.answerId
        );
        answer.value = instrumentPickerAnswer(answer, instruments, call);
      } else if (answer.question.dataType === DataType.TECHNIQUE_PICKER) {
        const techniqueIds = Array.isArray(answer.value)
          ? answer.value
          : [answer.value];
        const techniques =
          await baseContext.queries.technique.getTechniquesByIds(
            user,
            techniqueIds
          );
        answer.value = techniques?.length
          ? techniques.map((technique) => technique.name).join(', ')
          : '';
      }
    }

    out.questionarySteps.push({
      ...step,
      fields: answers,
    });
    out.attachments.push(...questionaryAttachments);
    out.attachments.push(...sampleAttachments);
    out.attachments.push(...genericTemplateAttachments);
  }

  const technicalReviews =
    await baseContext.queries.review.technicalReviewsForProposal(
      user,
      proposal.primaryKey
    );

  if (technicalReviews.length) {
    const instruments =
      await baseContext.queries.instrument.getInstrumentsByIds(
        user,
        technicalReviews.map((technicalReview) => technicalReview.instrumentId)
      );

    out.technicalReviews = technicalReviews.map((technicalReview) => ({
      ...technicalReview,
      status: getTechnicalReviewHumanReadableStatus(technicalReview.status),
      instrumentName: instruments.find(
        (instrument) => instrument.id === technicalReview.instrumentId
      )?.name,
    }));
  }

  // Get Reviews
  const reviews = await baseContext.queries.review.reviewsForProposal(user, {
    proposalPk: proposal.primaryKey,
  });

  if (reviews) out.fapReviews = reviews;

  return out;
};

export const collectProposalPDFDataTokenAccess = async (
  proposalPk: number,
  user: UserWithRole,
  options?: DownloadOptions,
  notify?: CallableFunction
): Promise<ProposalPDFData> => {
  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );

  // Set proposal data
  let proposal = null;
  const proposalFilter = options?.filter ?? null;
  if (proposalFilter && proposalFilter === 'id') {
    proposal = await proposalDataSource.getProposalById(proposalPk.toString());
  } else {
    proposal = await proposalDataSource.get(proposalPk);
  }

  if (proposal === null) {
    throw new Error('Proposal not found');
  }

  const callDataSource = container.resolve<CallDataSource>(
    Tokens.CallDataSource
  );
  const call = await callDataSource.getCall(proposal.callId);

  const pdfTemplateDataSource = container.resolve<PdfTemplateDataSource>(
    Tokens.PdfTemplateDataSource
  );

  const pdfTemplateId = call?.pdfTemplateId;
  let pdfTemplate: PdfTemplate | null = null;
  if (pdfTemplateId !== undefined) {
    pdfTemplate = (
      await pdfTemplateDataSource.getPdfTemplates({
        filter: {
          templateIds: [pdfTemplateId],
        },
      })
    )[0];
  }

  const questionaryDataSource = container.resolve<QuestionaryDataSource>(
    Tokens.QuestionaryDataSource
  );

  const questionarySteps = await questionaryDataSource.getQuestionarySteps(
    proposal.questionaryId
  );

  if (isRejection(questionarySteps) || questionarySteps == null) {
    logger.logError('Could not fetch questionary steps', {
      reason: questionarySteps?.reason || 'questionary steps is null',
    });
    throw new Error('Could not fetch questionary steps');
  }

  const userDataSource = container.resolve<UserDataSource>(
    Tokens.UserDataSource
  );
  const principalInvestigator = await userDataSource.getBasicUserInfo(
    proposal.proposerId
  );
  const coProposers = await userDataSource.getProposalUsers(
    proposal.primaryKey
  );

  if (!principalInvestigator || !coProposers) {
    throw new Error('Proposal has no PI or co-proposer');
  }

  const sampleAttachments: Attachment[] = [];

  const sampleDataSource = container.resolve<SampleDataSource>(
    Tokens.SampleDataSource
  );

  const samples = await sampleDataSource.getSamples({
    filter: { proposalPk: proposal.primaryKey },
  });

  const samplePDFData = (
    await Promise.all(
      samples.map(async (sample) =>
        collectSamplePDFData(
          sample.id,
          user,
          undefined,
          sample,
          await getQuestionary(sample.questionaryId),
          await getSampleQuestionarySteps(sample.questionaryId)
        )
      )
    )
  ).map(({ sample, sampleQuestionaryFields, attachments }) => {
    sampleAttachments.push(...attachments);

    return { sample, sampleQuestionaryFields };
  });

  notify?.(
    `${proposal.proposalId}_${
      principalInvestigator.lastname
    }_${proposal.created.getUTCFullYear()}.pdf`
  );

  const genericTemplateAttachments: Attachment[] = [];

  const genericTemplateDataSource =
    container.resolve<GenericTemplateDataSource>(
      Tokens.GenericTemplateDataSource
    );

  const genericTemplates = await genericTemplateDataSource.getGenericTemplates({
    filter: { proposalPk: proposal.primaryKey },
  });

  const genericTemplatePDFData = (
    await Promise.all(
      genericTemplates.map(async (genericTemplate) =>
        collectGenericTemplatePDFData(
          genericTemplate.id,
          user,
          undefined,
          genericTemplate,
          await getQuestionary(genericTemplate.questionaryId),
          await getSampleQuestionarySteps(genericTemplate.questionaryId)
        )
      )
    )
  ).map(
    ({ genericTemplate, genericTemplateQuestionaryFields, attachments }) => {
      genericTemplateAttachments.push(...attachments);

      return { genericTemplate, genericTemplateQuestionaryFields };
    }
  );

  notify?.(
    `${proposal.proposalId}_${
      principalInvestigator.lastname
    }_${proposal.created.getUTCFullYear()}.pdf`
  );

  // Add information from each topic in proposal
  const proposalPDFData: ProposalPDFData = await addTopicInformation(
    {
      proposal,
      principalInvestigator,
      coProposers,
      questionarySteps: [],
      attachments: [],
      technicalReviews: [],
      samples: samplePDFData,
      genericTemplates: genericTemplatePDFData,
      pdfTemplate,
    },
    questionarySteps,
    samples,
    genericTemplates,
    sampleAttachments,
    genericTemplateAttachments
  );

  const reviewDataSource = container.resolve<ReviewDataSource>(
    Tokens.ReviewDataSource
  );
  const technicalReviews = await reviewDataSource.getTechnicalReviews(
    proposal.primaryKey
  );

  if (technicalReviews?.length) {
    const instrumentDataSource = container.resolve<InstrumentDataSource>(
      Tokens.InstrumentDataSource
    );
    const instruments = await instrumentDataSource.getInstrumentsByIds(
      technicalReviews.map((technicalReview) => technicalReview.instrumentId)
    );
    proposalPDFData.technicalReviews = technicalReviews.map(
      (technicalReview) => ({
        ...technicalReview,
        status: getTechnicalReviewHumanReadableStatus(technicalReview.status),
        instrumentName: instruments.find(
          (instrument) => instrument.id === technicalReview.instrumentId
        )?.name,
      })
    );
  }

  return proposalPDFData;
};
