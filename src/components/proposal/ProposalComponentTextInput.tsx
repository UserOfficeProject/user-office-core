import { makeStyles } from '@material-ui/core';
import { getIn } from 'formik';
import React, { ChangeEvent, useState, useEffect } from 'react';

import { TextInputConfig } from '../../generated/sdk';
import TextFieldWithCounter from '../common/TextFieldWithCounter';
import { BasicComponentProps } from './IBasicComponentProps';

export function ProposalComponentTextInput(props: BasicComponentProps) {
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
  const config = templateField.question.config as TextInputConfig;

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
        onChange={(evt: ChangeEvent<HTMLInputElement>) => {
          setStateValue(evt.target.value);
        }}
        onBlur={evt => {
          onComplete(evt, evt.target.value);
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
