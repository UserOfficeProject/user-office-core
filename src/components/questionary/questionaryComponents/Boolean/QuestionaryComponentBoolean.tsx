import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { getIn } from 'formik';
import React, { ChangeEvent, useEffect, useState } from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import ProposalErrorLabel from 'components/proposal/ProposalErrorLabel';
import { BooleanConfig } from 'generated/sdk';

export function QuestionaryComponentBoolean(props: BasicComponentProps) {
  const {
    answer,
    onComplete,
    formikProps: { errors, touched },
  } = props;
  const {
    question: { proposalQuestionId, question },
  } = answer;
  const config = answer.config as BooleanConfig;
  const fieldError = getIn(errors, proposalQuestionId);
  const isError = getIn(touched, proposalQuestionId) && !!fieldError;
  const [stateValue, setStateValue] = useState<boolean>(answer.value || false);

  useEffect(() => {
    setStateValue(answer.value || false);
  }, [answer]);

  const classes = makeStyles({
    label: {
      marginRight: '5px',
    },
  })();

  return (
    <FormControl error={isError}>
      <FormControlLabel
        control={
          <Checkbox
            id={proposalQuestionId}
            name={proposalQuestionId}
            onChange={(evt: ChangeEvent<HTMLInputElement>) => {
              onComplete(evt.target.checked);
            }}
            value={stateValue}
            checked={stateValue}
            inputProps={{
              'aria-label': 'primary checkbox',
            }}
            required={config.required ? true : false}
          />
        }
        label={question}
        className={classes.label}
      />
      <span>{config.small_label}</span>
      {isError && (
        <ProposalErrorLabel>{errors[proposalQuestionId]}</ProposalErrorLabel>
      )}
    </FormControl>
  );
}
