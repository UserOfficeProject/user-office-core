import { FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import { Field } from 'formik';
import React, { useState } from 'react';

import CheckboxWithLabel from 'components/common/FormikUICheckboxWithLabel';
import Select from 'components/common/FormikUISelect';
import TitledContainer from 'components/common/TitledContainer';
import { InstrumentPickerConfig } from 'generated/sdk';

const availableVariantOptions = [
  { label: 'Radio', value: 'radio' },
  { label: 'Dropdown', value: 'dropdown' },
];

export const QuestionInstrumentPickerFormCommon = ({
  config,
}: {
  config: InstrumentPickerConfig;
}) => {
  const [showIsMultipleSelectCheckbox, setShowIsMultipleSelectCheckbox] =
    useState(config.variant === 'dropdown');

  const [showJustification, setShowJustification] = useState(false);

  return (
    <>
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
      </TitledContainer>
      <TitledContainer label="Options">
        <FormControl fullWidth>
          <InputLabel htmlFor="config.variant" shrink>
            Variant
          </InputLabel>
          <Field
            id="config.variant"
            name="config.variant"
            type="text"
            component={Select}
            data-cy="variant"
            onChange={(e: SelectChangeEvent) => {
              setShowIsMultipleSelectCheckbox(e.target.value === 'dropdown');
            }}
            options={availableVariantOptions.map(({ label, value }) => ({
              text: label,
              value: value,
            }))}
          />
        </FormControl>

        <Field
          name="config.requestTime"
          component={CheckboxWithLabel}
          type="checkbox"
          Label={{
            label: 'Request time',
          }}
          data-cy="request-time"
        />
        {showIsMultipleSelectCheckbox && (
          <Field
            name="config.isMultipleSelect"
            component={CheckboxWithLabel}
            type="checkbox"
            Label={{ label: 'Is multiple select' }}
            data-cy="is-multiple-select"
            // Using onInput instead of onChange because onChange overwrites the formik handler.
            onInput={(event: React.ChangeEvent<HTMLInputElement>) => {
              setShowJustification(event.target.checked);
            }}
          />
        )}
        {showIsMultipleSelectCheckbox && showJustification && (
          <Field
            name="config.multiJustificationRequired"
            component={CheckboxWithLabel}
            type="checkbox"
            Label={{ label: 'Justification Required for Multi Instruments' }}
            data-cy="is-multi-just-req"
          />
        )}
      </TitledContainer>
    </>
  );
};
