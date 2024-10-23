import {
  getTranslation,
  ResourceId,
} from '@user-office-software/duo-localisation';

import baseContext from '../../buildContext';
import { Call } from '../../models/Call';
import { Instrument } from '../../models/Instrument';
import { PdfTemplate } from '../../models/PdfTemplate';
import { ProposalEndStatus } from '../../models/Proposal';
import { getTopicActiveAnswers } from '../../models/ProposalModelFunctions';
import { Answer } from '../../models/Questionary';
import { TechnicalReviewStatus } from '../../models/TechnicalReview';
import { DataType } from '../../models/Template';
import { UserWithRole } from '../../models/User';
import { InstrumentPickerConfig } from '../../resolvers/types/FieldConfig';
import { collectGenericTemplatePDFData } from '../pdf/genericTemplates';
import { ProposalPDFData } from '../pdf/proposal';
import { collectSamplePDFData } from '../pdf/sample';
import { Attachment, getFileAttachments } from '../util';

type ProposalXLSData = Array<string | number>;

export const defaultProposalDataColumns = [
  'Proposal ID',
  'Title',
  'Principal Investigator',
  'Instrument',
  'Technical Status',
  'Technical Comment',
  'Time(Days)',
  'Comment Management',
  'Decision',
];

// Note: to optimize, we could create a query to collect everything
// but this may be more flexible than using queries?
export const collectProposalXLSXData = async (
  proposalPk: number,
  user: UserWithRole,
  notify?: CallableFunction
): Promise<ProposalXLSData> => {
  const proposal = await baseContext.queries.proposal.get(user, proposalPk);

  if (!proposal) {
    throw new Error(
      `Proposal with ID '${proposalPk}' not found, or the user has insufficient rights`
    );
  }

  notify?.(
    `proposal_${proposal.created.getUTCFullYear()}_${proposal.proposalId}.xlsx`
  );

  const proposer = await baseContext.queries.user.get(
    user,
    proposal.proposerId
  );

  if (!proposer) {
    throw new Error(
      `Proposer with ID '${proposal.proposerId}' not found, or the user has insufficient rights`
    );
  }

  const technicalReviews =
    await baseContext.queries.review.technicalReviewsForProposal(
      user,
      proposal.primaryKey
    );

  const instruments =
    await baseContext.queries.instrument.getInstrumentsByProposalPk(
      user,
      proposal.primaryKey
    );

  return [
    proposal.proposalId,
    proposal.title,
    `${proposer.firstname} ${proposer.lastname}`,
    instruments.length
      ? instruments
          .map((instrument) => instrument.name ?? '<missing>')
          .join(', ')
      : '<missing>',
    technicalReviews.length
      ? technicalReviews
          .map((technicalReview) =>
            technicalReview?.status !== undefined &&
            technicalReview?.status !== null
              ? getTranslation(
                  TechnicalReviewStatus[technicalReview?.status] as ResourceId
                )
              : '<missing>'
          )
          .join(', ')
      : '<missing>',
    technicalReviews
      ?.map((technicalReview) => technicalReview?.publicComment || '<missing>')
      .join(', ') || '<missing>',
    technicalReviews
      ?.map((technicalReview) => technicalReview?.timeAllocation ?? '<missing>')
      .join(', ') ?? '<missing>',
    proposal.commentForManagement || '<missing>',
    ProposalEndStatus[proposal.finalStatus] ?? '<missing>',
  ];
};

export const collectEnhancedProposalXLSXData = async (
  proposalPk: number,
  user: UserWithRole,
  notify?: CallableFunction
): Promise<ProposalXLSData> => {
  const proposal = await baseContext.queries.proposal.get(user, proposalPk);

  if (!proposal) {
    throw new Error(
      `Proposal with ID '${proposalPk}' not found, or the user has insufficient rights`
    );
  }

  const principalInvestigator = await baseContext.queries.user.getBasic(
    user,
    proposal.proposerId
  );

  if (!principalInvestigator) {
    throw new Error(
      `Proposal with ID '${principalInvestigator}' not found, or the user has insufficient rights`
    );
  }

  notify?.(
    `proposal_${proposal.created.getUTCFullYear()}_${proposal.proposalId}.xlsx`
  );

  const proposer = await baseContext.queries.user.get(
    user,
    proposal.proposerId
  );

  if (!proposer) {
    throw new Error(
      `Proposer with ID '${proposal.proposerId}' not found, or the user has insufficient rights`
    );
  }

  const instruments =
    await baseContext.queries.instrument.getInstrumentsByProposalPk(
      user,
      proposal.primaryKey
    );

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

  const out: ProposalPDFData = {
    proposal,
    questionarySteps: [],
    attachments: [],
    technicalReviews: [],
    samples: samplePDFData,
    genericTemplates: genericTemplatePDFData,
    pdfTemplate,
    coProposers: [],
    principalInvestigator,
  };

  const queries = baseContext.queries.questionary;

  const questionarySteps = await queries.getQuestionarySteps(
    user,
    proposal.questionaryId
  );

  if (questionarySteps == null) {
    throw new Error('Could not fetch questionary');
  }

  // Information from each topic in proposal
  for (const step of questionarySteps) {
    if (!step) {
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
        const call = await baseContext.queries.call.getCallByQuestionId(
          user,
          answer.question.id
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

  return [
    proposal.title,
    proposal.proposalId,
    `${proposer.firstname} ${proposer.lastname}`,
    instruments.length
      ? instruments
          .map((instrument) => instrument.name ?? '<missing>')
          .join(', ')
      : '<missing>',
    ProposalEndStatus[proposal.finalStatus] ?? '<missing>',
  ];
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
