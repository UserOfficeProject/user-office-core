import { Field } from 'formik';
import React, { ChangeEvent } from 'react';
import * as Yup from 'yup';

import CheckboxWithLabel from 'components/common/FormikUICheckboxWithLabel';
import TextField from 'components/common/FormikUITextField';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { TextInputConfig } from 'generated/sdk';

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
