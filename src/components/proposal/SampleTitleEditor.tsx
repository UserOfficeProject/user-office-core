import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';
import * as Yup from 'yup';

import { Sample } from 'generated/sdk';
import { EventType, Event } from 'models/SampleSubmissionModel';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import QuestionaryNavigationFragment from './QuestionaryNavigationFragment';

function SampleTitleEditor(props: {
  state: Sample;
  dispatch: React.Dispatch<Event>;
}) {
  const { state, dispatch } = props;
  const { api } = useDataApiWithFeedback();

  return (
    <Formik
      initialValues={{
        title: state.title,
      }}
      onSubmit={async (values, actions): Promise<void> => {
        api()
          .updateSampleTitle({
            sampleId: state.id,
            title: values.title,
          })
          .then(result => {
            actions.setSubmitting(false);
            dispatch({
              type: EventType.TITLE_STEP_COMPLETED,
              payload: { title: result.updateSampleTitle.sample?.title },
            });
          });
      }}
      validationSchema={Yup.object().shape({
        title: Yup.string()
          .min(2)
          .required(),
      })}
    >
      {({ submitForm, isSubmitting }) => (
        <Form>
          <Field
            name="title"
            data-cy="title-input"
            label="Title"
            placeholder="Sample title"
            component={TextField}
            fullWidth
          />
          <QuestionaryNavigationFragment
            saveAndNext={{ callback: submitForm, isBusy: isSubmitting }}
          />
        </Form>
      )}
    </Formik>
  );
}

export default SampleTitleEditor;
