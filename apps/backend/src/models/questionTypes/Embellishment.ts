import { EmbellishmentConfig } from '../../resolvers/types/FieldConfig';
import { DataType } from '../Template';
import { Question } from './QuestionRegistry';

export const embellishmentDefinition: Question<DataType.EMBELLISHMENT> = {
  dataType: DataType.EMBELLISHMENT,
  createBlankConfig: (): EmbellishmentConfig => {
    const config = new EmbellishmentConfig();
    config.html = '';
    config.plain = '';
    config.omitFromPdf = false;

    return config;
  },
  getDefaultAnswer: () => null,
};
