import makeStyles from '@material-ui/core/styles/makeStyles';
import { getIn } from 'formik';
import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';

import TextFieldWithCounter from 'components/common/TextFieldWithCounter';
import withPreventSubmit from 'components/common/withPreventSubmit';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { TextInputConfig } from 'generated/sdk';

const TextFieldNoSubmit = withPreventSubmit(TextFieldWithCounter);

export function QuestionaryComponentTextInput(props: BasicComponentProps) {
  const classes = makeStyles({
    textField: {
      margin: '15px 0 10px 0',
    },
  })();
  const {
    answer,
    onComplete,
    formikProps: { errors, touched },
  } = props;
  const {
    question: { proposalQuestionId },
    question,
    value,
  } = answer;
  const [stateValue, setStateValue] = useState(value);
  const fieldError = getIn(errors, proposalQuestionId);
  const isError = getIn(touched, proposalQuestionId) && !!fieldError;
  const config = answer.config as TextInputConfig;

  useEffect(() => {
    setStateValue(answer.value);
  }, [answer]);

  return (
    <div>
      {config.htmlQuestion && (
        <div
          dangerouslySetInnerHTML={{
            __html: config.htmlQuestion!,
          }}
        ></div>
      )}
      <TextFieldNoSubmit
        isCounterHidden={config.isCounterHidden}
        variant="standard"
        id={proposalQuestionId}
        name={proposalQuestionId}
        fullWidth
        required={config.required ? true : false}
        label={question.question}
        value={stateValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setStateValue(event.currentTarget.value);
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
        onBlur={event => {
          onComplete(event.currentTarget.value);
        }}
        placeholder={config.placeholder}
        error={isError}
        helperText={isError && errors[proposalQuestionId]}
        multiline={config.multiline}
        rows={config.multiline ? 2 : 1}
        rowsMax={config.multiline ? 16 : undefined}
        className={classes.textField}
        InputLabelProps={{
          shrink: true,
        }}
        maxLen={config.max || undefined}
      />
    </div>
  );
}
