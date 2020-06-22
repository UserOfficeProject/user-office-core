import { FormControl, FormLabel } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { SubtemplateConfig } from '../../generated/sdk';
import { BasicComponentProps } from './IBasicComponentProps';
import { ProposalErrorLabel } from './ProposalErrorLabel';

export function ProposalComponentSubtemplate(props: BasicComponentProps & {}) {
  const {
    templateField,
    templateField: {
      question: { proposalQuestionId },
      value,
    },
    errors,
    onComplete,
  } = props;
  const isError = errors[proposalQuestionId] ? true : false;
  const config = templateField.config as SubtemplateConfig;
  const [stateValue, setStateValue] = useState(value);

  useEffect(() => {
    setStateValue(templateField.value);
  }, [templateField]);

  return (
    <FormControl error={isError} required={config.required ? true : false}>
      <FormLabel error={isError}>{templateField.question.question}</FormLabel>
      <span>{config.small_label}</span>
      {isError && (
        <ProposalErrorLabel>{errors[proposalQuestionId]}</ProposalErrorLabel>
      )}
    </FormControl>
  );
}
