import { Collapse, FormControlLabel } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import React, { useState } from 'react';
import * as Yup from 'yup';

import { TextInputConfig } from '../../generated/sdk';
import { EventType } from '../../models/QuestionaryEditorModel';
import { useNaturalKeySchema } from '../../utils/userFieldValidationSchema';
import FormikUICustomCheckbox from '../common/FormikUICustomCheckbox';
import FormikUICustomDependencySelector from '../common/FormikUICustomDependencySelector';
import FormikUICustomEditor from '../common/FormikUICustomEditor';
import TitledContainer from '../common/TitledContainer';
import { AdminComponentShell } from './AdminComponentShell';
import { AdminComponentSignature } from './QuestionaryFieldEditor';

export const AdminComponentTextInput: AdminComponentSignature = props => {
  const field = props.field;
  const config = field.question.config as TextInputConfig;
  const [isRichQuestion, setIsRichQuestion] = useState<boolean>(
    config.htmlQuestion !== null
  );
  const naturalKeySchema = useNaturalKeySchema(field.question.naturalKey);

  /**
   * NOTE: The console warning "Warning: `value` prop on `input` should not be null." is a bit complicated for now.
   * https://github.com/jaredpalmer/formik/issues/568
   * https://github.com/jaredpalmer/formik/issues/1525
   * The main problem is that we use `null` for default value. Maybe we should convert this to string and reduce the pain.
   */

  return (
    <Formik
      initialValues={field}
      onSubmit={async vals => {
        props.dispatch({
          type: EventType.UPDATE_FIELD_REQUESTED,
          payload: {
            field: {
              ...field,
              ...vals,
              config: {
                ...vals.question.config,
                htmlQuestion: isRichQuestion
                  ? (vals.question.config as TextInputConfig).htmlQuestion
                  : null,
              },
            },
          },
        });
        props.closeMe();
      }}
      validationSchema={Yup.object().shape({
        question: Yup.object({
          naturalKey: naturalKeySchema,
          question: Yup.string().required('Question is required'),
          config: Yup.object({
            min: Yup.number().nullable(),
            max: Yup.number().nullable(),
            required: Yup.bool(),
            placeholder: Yup.string(),
            multiline: Yup.boolean(),
          }),
        }),
      })}
    >
      {formikProps => (
        <Form style={{ flexGrow: 1 }}>
          <AdminComponentShell {...props} label="Text input">
            <Field
              name="question.naturalKey"
              label="Key"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              inputProps={{ 'data-cy': 'natural_key' }}
            />

            <Field
              name="question.question"
              label="Question"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              inputProps={{ 'data-cy': 'question' }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setIsRichQuestion(event.target.checked);
                  }}
                  checked={isRichQuestion}
                />
              }
              label="Enable rich text question"
            />
            <Collapse in={isRichQuestion}>
              <Field
                visible={isRichQuestion}
                name="question.config.htmlQuestion"
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
            <TitledContainer label="Constraints">
              <Field
                name="question.config.required"
                checked={formikProps.values.question.config.required}
                component={FormikUICustomCheckbox}
                label="Is required"
                margin="normal"
                fullWidth
                data-cy="required"
              />

              <Field
                name="question.config.min"
                label="Min"
                type="text"
                component={TextField}
                margin="normal"
                fullWidth
                data-cy="min"
              />

              <Field
                name="question.config.max"
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
                name="question.config.placeholder"
                label="Placeholder text"
                type="text"
                component={TextField}
                margin="normal"
                fullWidth
                data-cy="placeholder"
              />

              <Field
                name="question.config.multiline"
                checked={
                  (formikProps.values.question.config as TextInputConfig)
                    .multiline
                }
                component={FormikUICustomCheckbox}
                label="Multiple line"
                margin="normal"
                fullWidth
                data-cy="multiline"
              />
            </TitledContainer>

            <TitledContainer label="Dependencies">
              <Field
                name="dependency"
                component={FormikUICustomDependencySelector}
                templateField={props.field}
                template={props.template}
                label="User must check it to continue"
                margin="normal"
                fullWidth
                data-cy="dependencies"
              />
            </TitledContainer>
          </AdminComponentShell>
        </Form>
      )}
    </Formik>
  );
};
