import moment from 'moment';

import { QuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';

export const preSubmitDateTransform: QuestionaryComponentDefinition['preSubmitTransform'] = (
  answer
) => {
  return {
    ...answer,
    value: moment(answer.value).format('YYYY-MM-DDTHH:mm:ss.SSS'), // ISO time format without timezone
  };
};
