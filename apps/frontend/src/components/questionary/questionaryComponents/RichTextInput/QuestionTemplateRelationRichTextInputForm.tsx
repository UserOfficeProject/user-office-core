import { Field } from 'formik';
import React, { ChangeEvent } from 'react';
import * as Yup from 'yup';

import CheckboxWithLabel from 'components/common/FormikUICheckboxWithLabel';
import TextField from 'components/common/FormikUITextField';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { RichTextInputConfig } from 'generated/sdk';

import QuestionDependencyList from '../QuestionDependencyList';
import { QuestionExcerpt } from '../QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationRichTextInputForm = (
  props: QuestionTemplateRelationFormProps
) => {
  return (
    <QuestionTemplateRelationFormShell
      {...props}
      validationSchema={Yup.object().shape({
        config: Yup.object({
          required: Yup.boolean(),
          maxWords: Yup.number()
            .nullable()
            .integer('Max Words must be a positive integer')
            .positive('Max Words must be a positive integer'),
        }),
      })}
    >
      {(formikProps) => (
        <>
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
              name="config.allowImages"
              component={CheckboxWithLabel}
              type="checkbox"
              Label={{
                label: 'Allow images',
              }}
              data-cy="allow-images"
            />
            <Field
              name="config.max"
              label="Max Characters"
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
              value={
                (formikProps.values.config as RichTextInputConfig).max ?? ''
              }
            />
            <Field
              name="config.maxWords"
              label="Max Words"
              id="Max-Words-input"
              type="number"
              component={TextField}
              fullWidth
              data-cy="max-words"
              inputProps={{ min: 1, step: 1 }}
              onChange={({
                target: { value },
              }: ChangeEvent<HTMLInputElement>) => {
                formikProps.setFieldValue(
                  'config.maxWords',
                  value.length === 0 ? null : Number(value)
                );
              }}
              value={
                (formikProps.values.config as RichTextInputConfig).maxWords ??
                ''
              }
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
