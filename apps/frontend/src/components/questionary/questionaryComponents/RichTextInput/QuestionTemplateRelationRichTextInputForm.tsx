import makeStyles from '@mui/styles/makeStyles';
import { Field } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-mui';
import React, { ChangeEvent } from 'react';
import * as Yup from 'yup';

import TitledContainer from 'components/common/TitledContainer';
import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { TextInputConfig } from 'generated/sdk';

import QuestionDependencyList from '../QuestionDependencyList';
import { QuestionExcerpt } from '../QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationRichTextInputForm = (
  props: QuestionTemplateRelationFormProps
) => {
  const useStyles = makeStyles((theme) => ({
    label: {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.grey[300],
      fontSize: 'medium',
    },
  }));
  const classes = useStyles();

  return (
    <QuestionTemplateRelationFormShell
      {...props}
      validationSchema={Yup.object().shape({
        config: Yup.object({
          required: Yup.boolean(),
        }),
      })}
    >
      {(formikProps) => (
        <>
          <label className={classes.label}>
            You are editing the question as it appears on the current template
          </label>
          <QuestionExcerpt question={props.questionRel.question} />

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
              name="config.max"
              label="Max"
              id="Max-input"
              type="text"
              component={TextField}
              fullWidth
              data-cy="max"
              onChange={({
                target: { value },
              }: ChangeEvent<HTMLInputElement>) => {
                formikProps.setFieldValue(
                  'config.max',
                  value.length === 0 ? null : value
                );
              }}
              value={(formikProps.values.config as TextInputConfig).max ?? ''}
            />
          </TitledContainer>

          <TitledContainer label="Dependencies">
            <QuestionDependencyList
              form={formikProps}
              template={props.template}
            />
          </TitledContainer>
        </>
      )}
    </QuestionTemplateRelationFormShell>
  );
};
