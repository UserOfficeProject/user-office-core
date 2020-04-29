import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';
import * as Yup from 'yup';

import { EventType } from '../../models/QuestionaryEditorModel';
import { useNaturalKeySchema } from '../../utils/userFieldValidationSchema';
import FormikUICustomCheckbox from '../common/FormikUICustomCheckbox';
import FormikUICustomDependencySelector from '../common/FormikUICustomDependencySelector';
import TitledContainer from '../common/TitledContainer';
import { AdminComponentShell } from './AdminComponentShell';
import { AdminComponentSignature } from './QuestionRelEditor';

export const AdminComponentDate: AdminComponentSignature = props => {
  const field = props.field;
  const naturalKeySchema = useNaturalKeySchema(field.question.naturalKey);

  return (
    <Formik
      initialValues={field}
      onSubmit={async vals => {
        props.dispatch({
          type: EventType.UPDATE_FIELD_REQUESTED,
          payload: {
            field: { ...field, ...vals },
          },
        });
        props.closeMe();
      }}
      validationSchema={Yup.object().shape({
        question: Yup.object({
          naturalKey: naturalKeySchema,
          question: Yup.string().required('Question is required'),
        }),
      })}
    >
      {formikProps => (
        <Form style={{ flexGrow: 1 }}>
          <AdminComponentShell {...props} label="Date">
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
            <Field
              name="question.config.tooltip"
              label="Tooltip"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="tooltip"
            />
            <TitledContainer label="Constraints">
              <Field
                name="question.config.required"
                label="Is required"
                checked={formikProps.values.question.config.required}
                component={FormikUICustomCheckbox}
                margin="normal"
                fullWidth
                data-cy="required"
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
