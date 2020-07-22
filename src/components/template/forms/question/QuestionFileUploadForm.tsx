import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';
import * as Yup from 'yup';

import FormikUICustomMultipleSelect from 'components/common/FormikUICustomMultipleSelect';
import TitledContainer from 'components/common/TitledContainer';
import { Question } from 'generated/sdk';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { TFormSignature } from '../TFormSignature';
import { QuestionFormShell } from './QuestionFormShell';

export const QuestionFileUploadForm: TFormSignature<Question> = props => {
  const field = props.field;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);

  return (
    <QuestionFormShell
      label="File upload"
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      question={props.field}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string().required('Question is required'),
        config: Yup.object({
          file_type: Yup.array(),
          small_label: Yup.string(),
          max_files: Yup.number(),
        }),
      })}
    >
      {formikProps => (
        <>
          <Field
            name="naturalKey"
            label="Key"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            inputProps={{ 'data-cy': 'natural_key' }}
          />
          <Field
            name="question"
            label="Question"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            inputProps={{ 'data-cy': 'question' }}
          />

          <TitledContainer label="Options">
            <Field
              name="config.small_label"
              label="Helper text"
              placeholder="(e.g. only PDF accepted)"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="small_label"
            />
          </TitledContainer>

          <TitledContainer label="Constraints">
            <Field
              name="config.file_type"
              label="Accepted file types (leave empty for any)"
              id="fileType"
              component={FormikUICustomMultipleSelect}
              availableOptions={[
                '.pdf',
                '.doc',
                '.docx',
                'audio/*',
                'video/*',
                'image/*',
              ]}
              margin="normal"
              fullWidth
              data-cy="file_type"
            />
            <Field
              name="config.max_files"
              label="Max number of files"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="max_files"
            />
          </TitledContainer>
        </>
      )}
    </QuestionFormShell>
  );
};
