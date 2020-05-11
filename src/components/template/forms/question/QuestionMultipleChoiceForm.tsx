import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';
import * as Yup from 'yup';

import { Question } from '../../../../generated/sdk';
import { useNaturalKeySchema } from '../../../../utils/userFieldValidationSchema';
import FormikDropdown from '../../../common/FormikDropdown';
import FormikUICustomCheckbox from '../../../common/FormikUICustomCheckbox';
import FormikUICustomTable from '../../../common/FormikUICustomTable';
import TitledContainer from '../../../common/TitledContainer';
import { TFormSignature } from '../TFormSignature';
import { QuestionFormShell } from './QuestionFormShell';

export const QuestionMultipleChoiceForm: TFormSignature<Question> = props => {
  const field = props.field;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);

  return (
    <QuestionFormShell
      label="Multiple choice"
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      question={props.field}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string().required('Question is required'),
        config: Yup.object({
          required: Yup.bool(),
          variant: Yup.string().required('Variant is required'),
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
              label="Is required"
              checked={formikProps.values.config.required}
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
        </>
      )}
    </QuestionFormShell>
  );
};
