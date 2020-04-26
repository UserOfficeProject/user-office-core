import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';
import * as Yup from 'yup';

import { EventType } from '../../models/QuestionaryEditorModel';
import { useNaturalKeySchema } from '../../utils/userFieldValidationSchema';
import FormikDropdown from '../common/FormikDropdown';
import FormikUICustomCheckbox from '../common/FormikUICustomCheckbox';
import FormikUICustomDependencySelector from '../common/FormikUICustomDependencySelector';
import FormikUICustomTable from '../common/FormikUICustomTable';
import TitledContainer from '../common/TitledContainer';
import { AdminComponentShell } from './AdminComponentShell';
import { AdminComponentSignature } from './QuestionaryFieldEditor';

export const AdminComponentMultipleChoice: AdminComponentSignature = props => {
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
        natural_key: naturalKeySchema,
        question: Yup.string().required('Question is required'),
        config: Yup.object({
          required: Yup.bool(),
          variant: Yup.string().required('Variant is required'),
        }),
      })}
    >
      {formikProps => (
        <Form style={{ flexGrow: 1 }}>
          <AdminComponentShell {...props} label="Multiple choice">
            <Field
              name="natural_key"
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
                label="Is required"
                checked={formikProps.values.question.config.required}
                component={FormikUICustomCheckbox}
                margin="normal"
                fullWidth
                inputProps={{ 'data-cy': 'required' }}
              />
            </TitledContainer>

            <TitledContainer label="Options">
              <FormikDropdown
                name="config.variant"
                label="Variant"
                items={[
                  { text: 'Radio', value: 'radio' },
                  { text: 'Dropdown', value: 'dropdown' },
                ]}
                data-cy="variant"
              />
            </TitledContainer>

            <TitledContainer label="Items">
              <Field
                title=""
                name="config.options"
                component={FormikUICustomTable}
                columns={[{ title: 'Answer', field: 'answer' }]}
                dataTransforms={{
                  toTable: (options: string[]) => {
                    return options.map(option => {
                      return { answer: option };
                    });
                  },
                  fromTable: (rows: any[]) => {
                    return rows.map(row => row.answer);
                  },
                }}
                margin="normal"
                fullWidth
                data-cy="options"
              />
            </TitledContainer>
            <TitledContainer label="Dependencies">
              <Field
                name="dependencies"
                component={FormikUICustomDependencySelector}
                templateField={props.field}
                template={props.template}
                label="User must check it to continue"
                margin="normal"
                fullWidth
                inputProps={{ 'data-cy': 'dependencies' }}
              />
            </TitledContainer>
          </AdminComponentShell>
        </Form>
      )}
    </Formik>
  );
};
