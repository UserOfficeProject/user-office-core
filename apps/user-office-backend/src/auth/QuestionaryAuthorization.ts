import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { TemplateGroupId } from '../models/Template';
import { User } from '../models/User';
import { FeedbackQuestionaryAuthorizer } from './questionary/FeedbackQuestionaryAuthorizer';
import { GenericTemplateQuestionaryAuthorizer } from './questionary/GenericTemplateQuestionaryAuthorizer';
import { ProposalEsiQuestionaryAuthorizer } from './questionary/ProposalEsiQuestionaryAuthorizer';
import { ProposalQuestionaryAuthorizer } from './questionary/ProposalQuestionaryAuthorizer';
import { SampleDeclarationQuestionaryAuthorizer } from './questionary/SampleDeclarationQuestionaryAuthorizer';
import { SampleEsiQuestionaryAuthorizer } from './questionary/SampleEsiQuestionaryAuthorizer';
import { ShipmentDeclarationQuestionaryAuthorizer } from './questionary/ShipmentDeclarationQuestionaryAuthorizer';
import { VisitQuestionaryAuthorizer } from './questionary/VisitQuestionaryAuthorizer';

export interface QuestionaryAuthorizer {
  hasReadRights(agent: User | null, questionaryId: number): Promise<boolean>;
  hasWriteRights(agent: User | null, questionaryId: number): Promise<boolean>;
}

@injectable()
export class QuestionaryAuthorization {
  private authorizers = new Map<TemplateGroupId, QuestionaryAuthorizer>();
  // TODO obtain authorizer from QuestionaryDefinition
  constructor(
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.TemplateDataSource)
    private templateDataSource: TemplateDataSource,
    @inject(Tokens.SampleDataSource) private sampleDataSource: SampleDataSource
  ) {
    this.authorizers.set(
      TemplateGroupId.PROPOSAL,
      container.resolve(ProposalQuestionaryAuthorizer)
    );
    this.authorizers.set(
      TemplateGroupId.SAMPLE,
      container.resolve(SampleDeclarationQuestionaryAuthorizer)
    );
    this.authorizers.set(
      TemplateGroupId.SHIPMENT,
      container.resolve(ShipmentDeclarationQuestionaryAuthorizer)
    );
    this.authorizers.set(
      TemplateGroupId.VISIT_REGISTRATION,
      container.resolve(VisitQuestionaryAuthorizer)
    );
    this.authorizers.set(
      TemplateGroupId.PROPOSAL_ESI,
      container.resolve(ProposalEsiQuestionaryAuthorizer)
    );
    this.authorizers.set(
      TemplateGroupId.SAMPLE_ESI,
      container.resolve(SampleEsiQuestionaryAuthorizer)
    );
    this.authorizers.set(
      TemplateGroupId.GENERIC_TEMPLATE,
      container.resolve(GenericTemplateQuestionaryAuthorizer)
    );
    this.authorizers.set(
      TemplateGroupId.FEEDBACK,
      container.resolve(FeedbackQuestionaryAuthorizer)
    );
  }

  private async getTemplateGroupIdForQuestionary(questionaryId: number) {
    const templateId = (
      await this.questionaryDataSource.getQuestionary(questionaryId)
    )?.templateId;
    if (!templateId) return null;

    const groupId = (await this.templateDataSource.getTemplate(templateId))
      ?.groupId;
    if (!groupId) return null;

    return groupId;
  }

  private async getAuthorizer(questionaryId: number) {
    const categoryId = await this.getTemplateGroupIdForQuestionary(
      questionaryId
    );
    if (!categoryId) return null;

    return this.authorizers.get(categoryId);
  }

  async hasReadRights(agent: User | null, questionaryId: number) {
    return (
      (await this.getAuthorizer(questionaryId))?.hasReadRights(
        agent,
        questionaryId
      ) || false
    );
  }

  async hasWriteRights(agent: User | null, questionaryId: number) {
    return (
      (await this.getAuthorizer(questionaryId))?.hasWriteRights(
        agent,
        questionaryId
      ) || false
    );
  }
}
