import moment from 'moment';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import { DateConfig } from 'generated/sdk';

export const preSubmitDateTransform: QuestionaryComponentDefinition['preSubmitTransform'] =
  (answer) => {
    const ifNotRequiredDateCanBeNull =
      !(answer.config as DateConfig).required && answer.value === null;

    return {
      ...answer,
      value: ifNotRequiredDateCanBeNull
        ? null
        : moment(answer.value).format('YYYY-MM-DDTHH:mm:ss.SSS'), // ISO time format without timezone
    };
  };
