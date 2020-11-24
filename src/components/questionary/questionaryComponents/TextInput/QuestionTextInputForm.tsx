import { Box } from '@material-ui/core';
import Collapse from '@material-ui/core/Collapse';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';
import * as Yup from 'yup';

import FormikUICustomCheckbox from 'components/common/FormikUICustomCheckbox';
import FormikUICustomEditor from 'components/common/FormikUICustomEditor';
import TitledContainer from 'components/common/TitledContainer';
import { FormComponent } from 'components/questionary/QuestionaryComponentRegistry';
import { Question, TextInputConfig } from 'generated/sdk';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { QuestionFormShell } from '../QuestionFormShell';

export const QuestionTextInputForm: FormComponent<Question> = props => {
  const field = props.field;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);

  return (
    <QuestionFormShell
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      question={props.field}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string().required('Question is required'),
        config: Yup.object({
          min: Yup.number().nullable(),
          max: Yup.number().nullable(),
          required: Yup.boolean(),
          placeholder: Yup.string(),
          multiline: Yup.boolean(),
          isHtmlQuestion: Yup.boolean(),
          isCounterHidden: Yup.boolean(),
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

          <TitledContainer label="Constraints">
            <Field
              name="config.required"
              component={FormikUICustomCheckbox}
              label="Is required"
              margin="normal"
              fullWidth
              data-cy="required"
            />

            <Field
              name="config.min"
              label="Min"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="min"
            />

            <Field
              name="config.max"
              label="Max"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="max"
            />
          </TitledContainer>
          <TitledContainer label="Options">
            <Field
              name="config.placeholder"
              label="Placeholder text"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="placeholder"
            />

            <Box component="div">
              <Field
                name="config.multiline"
                checked={
                  (formikProps.values.config as TextInputConfig).multiline
                }
                component={FormikUICustomCheckbox}
                label="Multiple lines"
                margin="normal"
                fullWidth
                data-cy="multiline"
              />
            </Box>

            <Box component="div">
              <Field
                name="config.isCounterHidden"
                checked={
                  (formikProps.values.config as TextInputConfig).isCounterHidden
                }
                component={FormikUICustomCheckbox}
                label="Hide counter"
                margin="normal"
                fullWidth
                data-cy="multiline"
              />
            </Box>

            <Field
              label="Enable rich text question"
              name="config.isHtmlQuestion"
              component={FormikUICustomCheckbox}
            />
            <Collapse
              in={(formikProps.values.config as TextInputConfig).isHtmlQuestion}
            >
              <Field
                visible={
                  (formikProps.values.config as TextInputConfig).isHtmlQuestion
                }
                name="config.htmlQuestion"
                type="text"
                component={FormikUICustomEditor}
                margin="normal"
                fullWidth
                init={{
                  skin: false,
                  content_css: false,
                  plugins: ['link', 'preview', 'image', 'code'],
                  toolbar: 'bold italic',
                  branding: false,
                }}
                data-cy="htmlQuestion"
              />
            </Collapse>
          </TitledContainer>
        </>
      )}
    </QuestionFormShell>
  );
};
