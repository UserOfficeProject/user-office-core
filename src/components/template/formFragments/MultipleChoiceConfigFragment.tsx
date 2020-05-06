import { Field } from 'formik';
import React, { Fragment } from 'react';
import FormikDropdown from '../../common/FormikDropdown';
import FormikUICustomCheckbox from '../../common/FormikUICustomCheckbox';
import FormikUICustomTable from '../../common/FormikUICustomTable';
import TitledContainer from '../../common/TitledContainer';
import { SelectionFromOptionsConfig } from '../../../generated/sdk';

export const MultipleChoiceConfigFragment = (props: {
  config: SelectionFromOptionsConfig;
}) => (
  <Fragment>
    <TitledContainer label="Constraints">
      <Field
        name="question.config.required"
        label="Is required"
        checked={props.config.required}
        component={FormikUICustomCheckbox}
        margin="normal"
        fullWidth
        inputProps={{ 'data-cy': 'required' }}
      />
    </TitledContainer>

    <TitledContainer label="Options">
      <FormikDropdown
        name="question.config.variant"
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
        name="question.config.options"
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
  </Fragment>
);
