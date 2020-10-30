import makeStyles from '@material-ui/core/styles/makeStyles';
import { getIn } from 'formik';
import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';
import { Key } from 'ts-keycode-enum';

import TextFieldWithCounter from 'components/common/TextFieldWithCounter';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { TextInputConfig } from 'generated/sdk';

export function QuestionaryComponentTextInput(props: BasicComponentProps) {
  const classes = makeStyles({
    textField: {
      margin: '15px 0 10px 0',
    },
  })();
  const { templateField, touched, errors, onComplete } = props;
  const {
    question: { proposalQuestionId },
    question,
    value,
  } = templateField;
  const [stateValue, setStateValue] = useState(value);
  const fieldError = getIn(errors, proposalQuestionId);
  const isError = getIn(touched, proposalQuestionId) && !!fieldError;
  const config = templateField.config as TextInputConfig;

  useEffect(() => {
    setStateValue(templateField.value);
  }, [templateField]);

  return (
    <div>
      {config.htmlQuestion && (
        <div
          dangerouslySetInnerHTML={{
            __html: config.htmlQuestion!,
          }}
        ></div>
      )}
      <TextFieldWithCounter
        variant="standard"
        id={proposalQuestionId}
        name={proposalQuestionId}
        fullWidth
        required={config.required ? true : false}
        label={config.htmlQuestion ? '' : question.question}
        value={stateValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setStateValue(event.currentTarget.value);
        }}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          if (event.keyCode === Key.Enter) {
            event.preventDefault();
            setStateValue(event.currentTarget.value);
            onComplete(event, event.currentTarget.value);

            return false;
          }
        }}
        onBlur={event => {
          onComplete(event, event.currentTarget.value);
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
