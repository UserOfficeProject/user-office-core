import TextField from '@material-ui/core/TextField';
import React, { ChangeEvent, KeyboardEvent, useContext, useState } from 'react';
import { Key } from 'ts-keycode-enum';

import { EventType } from 'models/QuestionarySubmissionModel';

import { BasicComponentProps } from '../IBasicComponentProps';
import { SampleContext } from '../SampleDeclarationContainer';

export function ProposalComponentSampleBasis(props: BasicComponentProps) {
  const sampleContext = useContext(SampleContext);
  const [title, setTitle] = useState(sampleContext?.sample.title || 'Untitled');

  return (
    <TextField
      label="Title"
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
          type: EventType.SAMPLE_UPDATED,
          payload: { sample: { title: title } },
        });
      }}
      value={title}
    />
  );
}
