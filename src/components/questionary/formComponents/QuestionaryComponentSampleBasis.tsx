import TextField from '@material-ui/core/TextField';
import React, {
  ChangeEvent,
  KeyboardEvent,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Key } from 'ts-keycode-enum';

import { SampleBasisConfig, Sdk } from 'generated/sdk';
import {
  EventType,
  QuestionarySubmissionState,
  Event,
} from 'models/QuestionarySubmissionState';
import { SampleSubmissionState } from 'models/SampleSubmissionState';

import { BasicComponentProps } from '../../proposal/IBasicComponentProps';
import { SampleContext } from './SampleDeclarationContainer';

function QuestionaryComponentSampleBasis(props: BasicComponentProps) {
  const sampleContext = useContext(SampleContext);
  const [title, setTitle] = useState(sampleContext.state?.sample.title || '');

  useEffect(() => {
    setTitle(sampleContext.state?.sample.title || '');
  }, [sampleContext.state]);

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
        sampleContext.dispatch({
          type: EventType.SAMPLE_MODIFIED,
          payload: { sample: { title: title } },
        });
      }}
      value={title}
      data-cy="title-input"
    />
  );
}

async function sampleBasisPreSubmit(
  state: QuestionarySubmissionState,
  dispatch: React.Dispatch<Event>,
  api: Sdk
) {
  const sample = (state as SampleSubmissionState).sample;
  const title = sample.title;

  if (sample.id > 0) {
    const result = await api.updateSampleTitle({
      title: title,
      sampleId: sample.id,
    });
    if (result.updateSampleTitle.sample) {
      dispatch({
        type: EventType.SAMPLE_UPDATED,
        payload: {
          sample: result.updateSampleTitle.sample,
        },
      });
    }
  } else {
    const result = await api.createSample({
      title: title,
      templateId: state.templateId,
    });

    if (result.createSample.sample) {
      dispatch({
        type: EventType.SAMPLE_CREATED,
        payload: {
          sample: result.createSample.sample,
        },
      });
    }
  }
}

export { QuestionaryComponentSampleBasis, sampleBasisPreSubmit };
