/* eslint-disable quotes */
import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { InstrumentDataSource } from '../../datasources/InstrumentDataSource';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { TechniqueDataSource } from '../../datasources/TechniqueDataSource';
import TechniqueMutations from '../../mutations/TechniqueMutations';
import { TechniquePickerConfig } from '../../resolvers/types/FieldConfig';
import { QuestionFilterCompareOperator } from '../Questionary';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export class TechniqueOptionClass {
  constructor(
    public id: number,
    public name: string
  ) {}
}

export const techniquePickerDefinition: Question<DataType.TECHNIQUE_PICKER> = {
  dataType: DataType.TECHNIQUE_PICKER,
  validate: (field: QuestionTemplateRelation, value: string[]) => {
    if (field.question.dataType !== DataType.TECHNIQUE_PICKER) {
      throw new GraphQLError('DataType should be TECHNIQUE_PICKER');
    }

    return new Promise((resolve) => resolve(true));
  },
  createBlankConfig: (): TechniquePickerConfig => {
    const config = new TechniquePickerConfig();
    config.small_label = '';
    config.required = false;
    config.tooltip = '';
    config.variant = 'dropdown';
    config.techniques = [];
    config.isMultipleSelect = false;

    return config;
  },
  getDefaultAnswer: (field) =>
    (field.config as TechniquePickerConfig).isMultipleSelect ? [] : null,
  filterQuery: (queryBuilder, filter) => {
    const value = JSON.parse(filter.value).value;
    switch (filter.compareOperator) {
      case QuestionFilterCompareOperator.EQUALS:
        return queryBuilder.andWhereRaw("answers.answer->>'value'=?", value);
      default:
        throw new GraphQLError(
          `Unsupported comparator for SelectionFromOptions ${filter.compareOperator}`
        );
    }
  },
  transformConfig: async (config, callId) => {
    const fallBackConfig = { ...config, techniques: [] };
    try {
      if (!callId) return fallBackConfig;

      const techniqueDataSource = container.resolve<TechniqueDataSource>(
        Tokens.TechniqueDataSource
      );
      const instrumentDataSource = container.resolve<InstrumentDataSource>(
        Tokens.InstrumentDataSource
      );

      const instrumentsOnCall =
        await instrumentDataSource.getInstrumentsByCallId([callId]);

      const uniqueTechniques =
        await techniqueDataSource.getTechniquesByInstrumentIds(
          instrumentsOnCall.map((inst) => inst.id)
        );

      return {
        ...config,
        techniques: uniqueTechniques.map(
          (technique) => new TechniqueOptionClass(technique.id, technique.name)
        ),
      };
    } catch (err) {
      logger.logError('Techniques fetch failed', {
        err,
      });
    }

    return fallBackConfig;
  },
  async onBeforeSave(questionaryId, questionTemplateRelation, answer) {
    const proposalDataSource = container.resolve<ProposalDataSource>(
      Tokens.ProposalDataSource
    );

    const techniqueMutations = container.resolve(TechniqueMutations);

    const proposal = await proposalDataSource.getByQuestionaryId(questionaryId);

    if (!proposal) {
      throw new GraphQLError('Proposal not found');
    }

    const { value } = JSON.parse(answer.value);
    const techniqueIds = value
      ? Array.isArray(value)
        ? value
        : [value]
      : null;

    if (!techniqueIds?.length) {
      return;
    }

    await techniqueMutations.assignProposalToTechniquesInternal(null, {
      techniqueIds,
      proposalPk: proposal.primaryKey,
    });
  },
};
