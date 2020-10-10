import TextField from '@material-ui/core/TextField';
import React, { ChangeEvent, KeyboardEvent, useContext, useState } from 'react';
import { Key } from 'ts-keycode-enum';

import { SampleBasisConfig } from 'generated/sdk';
import { EventType } from 'models/QuestionarySubmissionModel';

import { BasicComponentProps } from '../../proposal/IBasicComponentProps';
import { SampleContext } from './SampleDeclarationContainer';

export function QuestionaryComponentSampleBasis(props: BasicComponentProps) {
  const sampleContext = useContext(SampleContext);
  const [title, setTitle] = useState(sampleContext?.sample.title || '');

  return (
    <TextField
      label={(props.templateField.config as SampleBasisConfig).placeholder}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        setTitle(event.currentTarget.value);
      }}
      fullWidth
      onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
        if (event.keyCode === Key.Enter) {
          event.preventDefault();

          return false;
        }
      }}
      onBlur={event => {
        props.dispatch({
          type: EventType.SAMPLE_MODIFIED,
          payload: { sample: { title: title } },
        });
      }}
      value={title}
      data-cy="title-input"
    />
  );
}
