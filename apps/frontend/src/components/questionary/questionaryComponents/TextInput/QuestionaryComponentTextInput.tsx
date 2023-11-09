import { getIn } from 'formik';
import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';

import TextFieldWithCounter from 'components/common/TextFieldWithCounter';
import withPreventSubmit from 'components/common/withPreventSubmit';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { TextInputConfig } from 'generated/sdk';
import isEventFromAutoComplete from 'utils/isEventFromAutoComplete';

const TextFieldNoSubmit = withPreventSubmit(TextFieldWithCounter);

export function QuestionaryComponentTextInput(props: BasicComponentProps) {
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
  const [stateValue, setStateValue] = useState(value);
  const fieldError = getIn(errors, id);
  const isError = getIn(touched, id) && !!fieldError;
  const config = answer.config as TextInputConfig;

  useEffect(() => {
    setStateValue(answer.value);
  }, [answer]);

  return (
    <div>
      {config.htmlQuestion && (
        <div
          dangerouslySetInnerHTML={{
            __html: config.htmlQuestion,
          }}
        ></div>
      )}
      <TextFieldNoSubmit
        isCounterHidden={config.isCounterHidden}
        id={id}
        name={id}
        fullWidth
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
          if (
            config.multiline === false &&
            event.key.toLowerCase() === 'enter'
          ) {
            setStateValue(event.currentTarget.value);
            onComplete(event.currentTarget.value);
          }

          return undefined;
        }}
        onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
          onComplete(event.currentTarget.value);
        }}
        placeholder={config.placeholder}
        error={isError}
        helperText={isError && fieldError}
        multiline={config.multiline}
        minRows={config.multiline ? 2 : 1}
        maxRows={config.multiline ? 16 : undefined}
        maxLen={config.max || undefined}
        margin="dense"
        data-cy={id}
        data-natural-key={naturalKey}
      />
    </div>
  );
}
