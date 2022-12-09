import { logger } from '@user-office-software/duo-logger';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { GenericTemplateDataSource } from '../../datasources/GenericTemplateDataSource';
import { PdfTemplateDataSource } from '../../datasources/PdfTemplateDataSource';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../../datasources/QuestionaryDataSource';
import { ReviewDataSource } from '../../datasources/ReviewDataSource';
import { SampleDataSource } from '../../datasources/SampleDataSource';
import { UserDataSource } from '../../datasources/UserDataSource';
import { GenericTemplate } from '../../models/GenericTemplate';
import { PdfTemplate } from '../../models/PdfTemplate';
import { QuestionaryStep } from '../../models/Questionary';
import { isRejection } from '../../models/Rejection';
import { Sample } from '../../models/Sample';
import { DataType } from '../../models/Template';
import { BasicUserDetails, UserWithRole } from '../../models/User';
import { getFileAttachments, Attachment } from '../util';
import { collectGenericTemplatePDFData } from './genericTemplates';
import {
  getTechnicalReviewHumanReadableStatus,
  getTopicActiveAnswers,
  ProposalPDFData,
} from './proposal';
import { collectSamplePDFData } from './sample';

@injectable()
export class ProposalTokenAccess {
  private userWithRole = {};
  private proposalPk: number;
  private sampleAttachments: Attachment[] = [];
  private genericTemplateAttachments: Attachment[] = [];
  private proposalPDFData: Partial<ProposalPDFData> = {};
  private samples: Sample[];
  private genericTemplates: GenericTemplate[];
  private proposalFilter: string | null;

  constructor(
    @inject(Tokens.PdfTemplateDataSource)
    private pdfTemplateDataSource: PdfTemplateDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.CallDataSource)
    private callDataSource: CallDataSource,
    @inject(Tokens.UserDataSource)
    private userDataSource: UserDataSource,
    @inject(Tokens.GenericTemplateDataSource)
    private genericTemplateDataSource: GenericTemplateDataSource,
    @inject(Tokens.SampleDataSource)
    private sampleDataSource: SampleDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.ReviewDataSource)
    private reviewDataSource: ReviewDataSource
  ) {}

  // We initialise required values
  private init(user: UserWithRole, proposalPk: number, filter?: string) {
    if (user && proposalPk) {
      this.userWithRole = user;
      this.proposalPk = proposalPk;
      this.proposalFilter = filter ?? null;
    } else {
      throw new Error(
        'Can not download proposal pdf , request missing required information'
      );
    }
  }

  private async getProposal() {
    let proposal;
    if (this.proposalFilter && this.proposalFilter === 'id') {
      proposal = await this.proposalDataSource.getProposalById(
        this.proposalPk.toString()
      );
    } else {
      proposal = await this.proposalDataSource.get(this.proposalPk);
    }

    if (proposal === null) {
      throw new Error('Proposal not found');
    }

    return proposal;
  }

  private async getPdfTemplate(): Promise<PdfTemplate | null> {
    const callId = this.proposalPDFData?.proposal?.callId;
    if (callId) {
      const proposalCall = await this.callDataSource.getCall(callId);
      if (proposalCall === null) {
        throw new Error('Proposal call not be found');
      }
      if (proposalCall.pdfTemplateId) {
        return (
          await this.pdfTemplateDataSource.getPdfTemplates({
            filter: {
              templateIds: [proposalCall.pdfTemplateId],
            },
          })
        )[0];
      }
    }

    return null;
  }

  private async getPrincipalInvestigator(): Promise<BasicUserDetails> {
    let principalInvestigator = null;
    const proposerId = this.proposalPDFData.proposal?.proposerId;

    if (proposerId) {
      principalInvestigator = await this.userDataSource.getBasicUserInfo(
        proposerId
      );
    }

    if (!principalInvestigator) {
      throw new Error('Proposal principal investigator not found');
    }

    return principalInvestigator;
  }
  private async getCoProposers(): Promise<BasicUserDetails[] | null> {
    let coProposers = null;
    const proposalPk = this.proposalPDFData.proposal?.primaryKey;
    if (proposalPk) {
      coProposers = await this.userDataSource.getProposalUsers(proposalPk);
    }

    return coProposers;
  }

  private async getQuestionary(questionaryId: number) {
    const questionary = await this.questionaryDataSource.getQuestionary(
      questionaryId
    );

    if (!questionary) {
      throw new Error(`Questionary with ID '${questionaryId}' not found`);
    }

    return questionary;
  }

  private async getQuestionarySteps(): Promise<QuestionaryStep[]> {
    let questionarySteps = null;
    const questionaryId = this.proposalPDFData.proposal?.questionaryId;
    if (questionaryId) {
      questionarySteps = await this.questionaryDataSource.getQuestionarySteps(
        questionaryId
      );
    }
    if (isRejection(questionarySteps) || questionarySteps == null) {
      logger.logError('Could not fetch questionary', {
        reason: questionarySteps?.reason || 'questionary is null',
      });
      throw new Error('Could not fetch questionary');
    }

    return questionarySteps;
  }

  private async getSampleQuestionarySteps(
    questionaryId: number
  ): Promise<QuestionaryStep[]> {
    const questionarySteps =
      await this.questionaryDataSource.getQuestionarySteps(questionaryId);
    if (!questionarySteps) {
      throw new Error(
        `Questionary steps for Questionary ID '${questionaryId}' not found, or the user has insufficient rights`
      );
    }

    return questionarySteps;
  }

  private async getSampleData() {
    const proposalPk = this.proposalPDFData.proposal?.primaryKey;
    this.samples = await this.sampleDataSource.getSamples({
      filter: { proposalPk },
    });

    return (
      await Promise.all(
        this.samples.map(async (sample) => {
          return collectSamplePDFData(
            sample.id,
            this.userWithRole as UserWithRole,
            undefined,
            sample,
            await this.getQuestionary(sample.questionaryId),
            await this.getSampleQuestionarySteps(sample.questionaryId)
          );
        })
      )
    ).map(({ sample, sampleQuestionaryFields, attachments }) => {
      this.sampleAttachments.push(...attachments);

      return { sample, sampleQuestionaryFields };
    });
  }

  private async genericTemplatePDFData() {
    const proposalPk = this.proposalPDFData.proposal?.primaryKey;
    this.genericTemplates =
      await this.genericTemplateDataSource.getGenericTemplates({
        filter: { proposalPk },
      });

    return (
      await Promise.all(
        this.genericTemplates.map(async (genericTemplate) =>
          collectGenericTemplatePDFData(
            genericTemplate.id,
            this.userWithRole as UserWithRole,
            undefined,
            genericTemplate,
            await this.getQuestionary(genericTemplate.questionaryId),
            await this.getSampleQuestionarySteps(genericTemplate.questionaryId)
          )
        )
      )
    ).map(
      ({ genericTemplate, genericTemplateQuestionaryFields, attachments }) => {
        this.genericTemplateAttachments.push(...attachments);

        return { genericTemplate, genericTemplateQuestionaryFields };
      }
    );
  }

  private setAllTopicsInformation(out: ProposalPDFData): void {
    // Information from each topic in proposal
    const questionarySteps = this.proposalPDFData.questionarySteps;
    if (questionarySteps)
      for (const step of questionarySteps) {
        if (!step) {
          logger.logError('step not found', { ...questionarySteps }); // TODO: fix type of the second param in the lib (don't use Record<string, unknown>)

          throw 'Could not download generated PDF';
        }

        const topic = step.topic;
        const answers = getTopicActiveAnswers(
          questionarySteps,
          topic.id
        ).filter(
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
            answer.value = this.samples
              .filter((sample) => sample.questionId === answer.question.id)
              .map((sample) => sample);
          } else if (answer.question.dataType === DataType.GENERIC_TEMPLATE) {
            answer.value = this.genericTemplates
              .filter(
                (genericTemplate) =>
                  genericTemplate.questionId === answer.question.id
              )
              .map((genericTemplate) => genericTemplate);
          }
        }

        out.questionarySteps.push({
          ...step,
          fields: answers,
        });
        out.attachments.push(...questionaryAttachments);
        out.attachments.push(...this.sampleAttachments);
        out.attachments.push(...this.genericTemplateAttachments);
      }
  }

  private async setReviewInformation(out: ProposalPDFData) {
    const technicalReview = await this.reviewDataSource.getTechnicalReview(
      out.proposal.primaryKey
    );

    if (technicalReview) {
      out.technicalReview = {
        ...technicalReview,
        status: getTechnicalReviewHumanReadableStatus(technicalReview.status),
      };
    }
  }

  // Build proposal pdf data for token access
  async collectProposalPDFData(
    user: UserWithRole,
    proposalPk: number,
    proposalFilterType?: string,
    notify?: CallableFunction
  ): Promise<ProposalPDFData> {
    // Set required global variables
    this.init(user, proposalPk, proposalFilterType);

    // Set proposal data
    this.proposalPDFData.proposal = await this.getProposal();

    //Set  Pdf Templates
    this.proposalPDFData.pdfTemplate = await this.getPdfTemplate();

    //Set questionary steps
    this.proposalPDFData.questionarySteps = await this.getQuestionarySteps();

    //Set principal investigator and co-proposers
    this.proposalPDFData.principalInvestigator =
      await this.getPrincipalInvestigator();
    this.proposalPDFData.coProposers = (await this.getCoProposers()) || [];

    //  Set sample data
    this.proposalPDFData.samples = await this.getSampleData();
    notify?.(
      `${this.proposalPDFData.proposal.created.getUTCFullYear()}_${
        this.proposalPDFData.principalInvestigator.lastname
      }_${this.proposalPDFData.proposal.proposalId}.pdf`
    );

    // Set  generic templates
    this.proposalPDFData.genericTemplates = await this.genericTemplatePDFData();
    notify?.(
      `${this.proposalPDFData.proposal.created.getUTCFullYear()}_${
        this.proposalPDFData.principalInvestigator.lastname
      }_${this.proposalPDFData.proposal.proposalId}.pdf`
    );

    // Set proposal pdf data
    const proposalPDFDataOut: ProposalPDFData = {
      proposal: this.proposalPDFData.proposal,
      principalInvestigator: this.proposalPDFData.principalInvestigator,
      coProposers: this.proposalPDFData.coProposers,
      questionarySteps: this.proposalPDFData.questionarySteps,
      attachments: [],
      samples: this.proposalPDFData.samples,
      genericTemplates: this.proposalPDFData.genericTemplates,
      pdfTemplate: this.proposalPDFData.pdfTemplate,
    };

    // Set information from each topic in proposal
    this.setAllTopicsInformation(proposalPDFDataOut);

    // Set technical review for proposal
    this.setReviewInformation(proposalPDFDataOut);

    return proposalPDFDataOut;
  }
}
