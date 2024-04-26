import { getIn } from 'formik';
import React, { ChangeEvent, KeyboardEvent, useState } from 'react';

import TextFieldWithCounter from 'components/common/TextFieldWithCounter';
import withPreventSubmit from 'components/common/withPreventSubmit';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { TimeRequestedConfig } from 'generated/sdk';
import isEventFromAutoComplete from 'utils/isEventFromAutoComplete';

const TextFieldNoSubmit = withPreventSubmit(TextFieldWithCounter);
export function QuestionaryComponentTimeRequested(props: BasicComponentProps) {
  const {
    answer,
    onComplete,
    formikProps: { errors, touched },
  } = props;
  const {
    question: { id, naturalKey },
    question,
    value,
  } = answer;
  const config = answer.config as TimeRequestedConfig;
  const fieldError = getIn(errors, id);
  const isError = getIn(touched, id) && !!fieldError;
  const [stateValue, setStateValue] = useState(value);

  return (
    <div>
      <TextFieldNoSubmit
        isCounterHidden={true}
        id={id}
        name={id}
        required={config.required}
        label={question.question}
        value={stateValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setStateValue(event.currentTarget.value);
          if (isEventFromAutoComplete(event)) {
            onComplete(event.currentTarget.value);
          }
        }}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key.toLowerCase() === 'enter') {
            setStateValue(event.currentTarget.value);
            onComplete(event.currentTarget.value);
          }

          return undefined;
        }}
        onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
          onComplete(event.currentTarget.value);
        }}
        placeholder={config.time}
        error={isError}
        helperText={isError && fieldError}
        data-cy={id}
        data-natural-key={naturalKey}
      />
    </div>
  );
}
