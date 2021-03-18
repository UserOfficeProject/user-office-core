import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import { KeyboardDatePicker } from 'formik-material-ui-pickers';
import React, { FC } from 'react';
import * as Yup from 'yup';

import FormikUICustomCheckbox from 'components/common/FormikUICustomCheckbox';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';

import QuestionDependencyList from '../QuestionDependencyList';
import { QuestionExcerpt } from '../QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationDateForm: FC<QuestionTemplateRelationFormProps> = (
  props
) => {
  return (
    <QuestionTemplateRelationFormShell
      {...props}
      validationSchema={Yup.object().shape({})}
    >
      {(formikProps) => (
        <>
          <QuestionExcerpt question={props.questionRel.question} />
          <Field
            name="config.tooltip"
            label="Tooltip"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            data-cy="tooltip"
          />
          <TitledContainer label="Constraints">
            <Field
              name="config.required"
              label="Is required"
              component={FormikUICustomCheckbox}
              margin="normal"
              fullWidth
              data-cy="required"
            />

            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Field
                name="config.minDate"
                label="Min"
                format="yyyy-MM-dd"
                component={KeyboardDatePicker}
                margin="normal"
                fullWidth
                data-cy="minDate"
              />
              <Field
                name="config.maxDate"
                label="Max"
                format="yyyy-MM-dd"
                component={KeyboardDatePicker}
                margin="normal"
                fullWidth
                data-cy="maxDate"
              />
              <Field
                name="config.defaultDate"
                label="Default"
                format="yyyy-MM-dd"
                component={KeyboardDatePicker}
                margin="normal"
                fullWidth
                data-cy="defaultDate"
              />
            </MuiPickersUtilsProvider>
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
