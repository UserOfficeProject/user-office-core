import { Grid, Typography } from '@material-ui/core';
import { Field, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import * as Yup from 'yup';

import { SubquestionarySubmissionContainer } from 'components/questionary/SubquestionarySubmissionContainer';
import { Sample } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

interface SampleDeclarationEditorProps {
  sample: Sample;
  sampleEditDone?: (sample: Sample) => any;
}

function SampleDeclarationEditor(props: SampleDeclarationEditorProps) {
  const [sample, setSample] = useState(props.sample);

  const { api } = useDataApiWithFeedback();
  const { enqueueSnackbar } = useSnackbar();

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
                const { sample: newSample, error } = result.updateSampleTitle;
                if (error || !newSample) {
                  enqueueSnackbar(
                    `Error occurred while updating sample title. ${error}`,
                    { variant: 'error' }
                  );
                } else {
                  setSample({ ...sample, ...newSample });
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
        <SubquestionarySubmissionContainer
          questionaryEditDone={() => props.sampleEditDone?.(sample)}
          questionary={sample.questionary}
        />
      </Grid>
    </Grid>
  );
}

export default SampleDeclarationEditor;
