import { Field } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import FormikUICustomTable from 'components/common/FormikUICustomTable';
import TextField from 'components/common/FormikUITextField';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';

import { QuestionExcerpt } from '../QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

const columns = [{ title: 'Answer', field: 'answer' }];

export const QuestionTemplateRelationFapReviewBasisForm = (
  props: QuestionTemplateRelationFormProps
) => {
  return (
    <QuestionTemplateRelationFormShell
      {...props}
      validationSchema={Yup.object().shape({
        config: Yup.object({
          minGrade: Yup.number().required('Content is required'),
          maxGrade: Yup.number().required('Content is required'),
          decimalPoints: Yup.number().required('Content is required'),
        }),
      })}
    >
      {() => (
        <>
          <QuestionExcerpt question={props.questionRel.question} />
          <Field
            name="config.minGrade"
            label="Minium Score"
            id="config.minGrade"
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
    </QuestionTemplateRelationFormShell>
  );
};
