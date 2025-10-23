import { Field } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import FormikUICustomTable from 'components/common/FormikUICustomTable';
import TextField from 'components/common/FormikUITextField';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { QuestionFormShell } from '../QuestionFormShell';

const columns = [{ title: 'Answer', field: 'answer' }];

export const QuestionFapReviewBasisForm = (props: QuestionFormProps) => {
  const field = props.question;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);

  return (
    <QuestionFormShell
      {...props}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string()
          .required('Question is required')
          .max(256, 'There is a 256 max character limit'),
      })}
    >
      {() => (
        <>
          <Field
            name="naturalKey"
            label="Key"
            id="Key-input"
            type="text"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'natural_key' }}
          />
          <Field
            name="question"
            label="Question"
            id="Question-input"
            type="text"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'question' }}
          />
          <Field
            name="config.minGrade"
            label="Minium Score"
            id="min-score-input"
            type="number"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'min_score' }}
          />
          <Field
            name="config.maxGrade"
            label="Maximum Score"
            id="max-score-input"
            type="number"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'max_score' }}
          />
          <Field
            name="config.decimalPoints"
            label="Decimal Points"
            id="decimal-points-input"
            type="number"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'decimal_points' }}
          />
          <TitledContainer label="Non Numeric Options">
            <Field
              title=""
              name="config.nonNumericOptions"
              component={FormikUICustomTable}
              columns={columns}
              dataTransforms={{
                toTable: (options: string[]) => {
                  return options.map((option) => {
                    return { answer: option };
                  });
                },
                fromTable: (rows: Record<string, unknown>[]) => {
                  return rows.map((row) => row.answer);
                },
              }}
              fullWidth
              data-cy="options"
            />
          </TitledContainer>
        </>
      )}
    </QuestionFormShell>
  );
};
