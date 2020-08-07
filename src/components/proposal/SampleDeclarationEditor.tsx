import { Grid, Typography } from '@material-ui/core';
import { Field, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import * as Yup from 'yup';

import { SubquestionarySubmissionContainer } from 'components/questionary/SubquestionarySubmissionContainer';
import { Sample } from 'generated/sdk';
import { useQuestionary } from 'hooks/questionary/useQuestionary';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

interface SampleDeclarationEditorProps {
  sample: Sample;
  sampleEditDone?: (sample: Sample) => any;
}

function SampleDeclarationEditor(props: SampleDeclarationEditorProps) {
  const [sample, setSample] = useState(props.sample);
  const { questionary } = useQuestionary(sample.questionaryId);

  const { api } = useDataApiWithFeedback();
  const { enqueueSnackbar } = useSnackbar();

  const subQuestionaryEditor = questionary ? (
    <SubquestionarySubmissionContainer
      questionaryEditDone={() => props.sampleEditDone?.(sample)}
      questionary={questionary}
    />
  ) : null;

  if (!sample) {
    return <span>loading</span>;
  }

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="h5">{sample.title}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Formik
          initialValues={{
            title: sample.title,
          }}
          onSubmit={async (values, actions): Promise<void> => {
            api('Title updated')
              .updateSampleTitle({
                sampleId: sample.id,
                title: values.title,
              })
              .then(result => {
                const { sample, error } = result.updateSampleTitle;
                if (error || !sample) {
                  enqueueSnackbar(
                    `Error occurred while updating sample title. ${error}`,
                    { variant: 'error' }
                  );
                } else {
                  setSample(sample);
                }
                actions.setSubmitting(false);
              });
          }}
          validationSchema={Yup.object().shape({
            title: Yup.string()
              .min(2)
              .required(),
          })}
        >
          {formikProps => (
            <Field
              name="title"
              data-cy="title-input"
              label="Title"
              placeholder="Sample title"
              component={TextField}
              InputProps={{ onBlur: formikProps.handleSubmit }}
            />
          )}
        </Formik>
      </Grid>
      <Grid item xs={12}>
        {subQuestionaryEditor}
      </Grid>
    </Grid>
  );
}

export default SampleDeclarationEditor;
