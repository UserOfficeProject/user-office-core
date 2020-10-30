/* eslint-disable @typescript-eslint/camelcase */
import { EmbellishmentConfig } from '../../resolvers/types/FieldConfig';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const embellishmentDefinition: Question = {
  dataType: DataType.EMBELLISHMENT,
  validate: (field: QuestionTemplateRelation, value: any) => {
    if (field.question.dataType !== DataType.EMBELLISHMENT) {
      throw new Error('DataType should be EMBELLISHMENT');
    }

    return true;
  },
  createBlankConfig: (): EmbellishmentConfig => {
    const config = new EmbellishmentConfig();
    config.html = '';
    config.plain = '';
    config.omitFromPdf = false;

    return config;
  },
  isReadOnly: true,
  defaultAnswer: null,
};
