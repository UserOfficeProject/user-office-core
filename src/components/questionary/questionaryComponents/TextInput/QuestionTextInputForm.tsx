import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import { Field } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-mui';
import React, { FC } from 'react';
import * as Yup from 'yup';

import FormikUICustomEditor from 'components/common/FormikUICustomEditor';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { TextInputConfig } from 'generated/sdk';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { QuestionFormShell } from '../QuestionFormShell';

export const QuestionTextInputForm: FC<QuestionFormProps> = (props) => {
  const field = props.question;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);

  return (
    <QuestionFormShell
      {...props}
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
      {(formikProps) => (
        <>
          <Field
            name="naturalKey"
            id="Key-Input"
            label="Key"
            type="text"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'natural_key' }}
          />
          <Field
            name="question"
            id="Question-Input"
            label="Question"
            type="text"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'question' }}
          />

          <TitledContainer label="Constraints">
            <Field
              name="config.required"
              component={CheckboxWithLabel}
              type="checkbox"
              Label={{
                label: 'Is required',
              }}
              data-cy="required"
            />

            <Field
              name="config.min"
              id="Min-Input"
              label="Min"
              type="text"
              component={TextField}
              fullWidth
              data-cy="min"
            />

            <Field
              name="config.max"
              id="Max-Input"
              label="Max"
              type="text"
              component={TextField}
              fullWidth
              data-cy="max"
            />
          </TitledContainer>
          <TitledContainer label="Options">
            <Field
              name="config.placeholder"
              id="Placeholder-Input"
              label="Placeholder text"
              type="text"
              component={TextField}
              fullWidth
              data-cy="placeholder"
            />

            <Box component="div">
              <Field
                name="config.multiline"
                checked={
                  (formikProps.values.config as TextInputConfig).multiline
                }
                component={CheckboxWithLabel}
                type="checkbox"
                Label={{
                  label: 'Multiple lines',
                }}
                data-cy="multiline"
              />
            </Box>

            <Box component="div">
              <Field
                name="config.isCounterHidden"
                checked={
                  (formikProps.values.config as TextInputConfig).isCounterHidden
                }
                component={CheckboxWithLabel}
                type="checkbox"
                Label={{
                  label: 'Hide counter',
                }}
                data-cy="multiline"
              />
            </Box>

            <Field
              component={CheckboxWithLabel}
              type="checkbox"
              Label={{
                label: 'Enable rich text question',
              }}
              name="config.isHtmlQuestion"
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
