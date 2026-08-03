import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import LaunchIcon from '@mui/icons-material/Launch';
import { DialogContent } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import { useTheme } from '@mui/material/styles';
import MUITextField from '@mui/material/TextField';
import { Field } from 'formik';
import React, { useState } from 'react';
import * as Yup from 'yup';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import CheckboxWithLabel from 'components/common/FormikUICheckboxWithLabel';
import TextField from 'components/common/FormikUITextField';
import StyledDialog from 'components/common/StyledDialog';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionFormShell } from 'components/questionary/questionaryComponents/QuestionFormShell';
import CreateUnit from 'components/settings/unitList/CreateUnit';
import { NumberInputConfig, NumberValueConstraint, Unit } from 'generated/sdk';
import { useUnitsData } from 'hooks/settings/useUnitData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

export const QuestionNumberForm = (props: QuestionFormProps) => {
  const [show, setShow] = useState(false);
  const field = props.question;
  const numberConfig = props.question.config as NumberInputConfig;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);
  const { units, setUnitsWithLoading } = useUnitsData();
  const { api } = useDataApiWithFeedback();
  const theme = useTheme();
  const [selectedUnits, setSelectedUnits] = useState(numberConfig.units);

  const onCreated = (unitAdded: Unit | null): void => {
    api()
      .getUnits()
      .then((result) => {
        if (result.units) {
          setUnitsWithLoading(result.units);
          setShow(false);
        }
      })
      .catch((err) => console.log(err));

    const newUnits = [...selectedUnits, unitAdded] as Unit[];
    setSelectedUnits(newUnits);
  };

  return (
    <QuestionFormShell
      {...props}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string().required('Question is required'),
        config: Yup.object({
          required: Yup.bool(),
          units: Yup.array().of(
            Yup.object({
              id: Yup.string(),
              quantity: Yup.string(),
              siConversionFormula: Yup.string(),
              symbol: Yup.string(),
              unit: Yup.string(),
            })
          ),
          numberMin: Yup.number()
            .typeError('Value must be a number')
            .nullable(),
          numberMinInclusive: Yup.bool().nullable(),
          numberMaxInclusive: Yup.bool().nullable(),
          numberMax: Yup.number()
            .typeError('Value must be a number')
            .nullable()
            // We cannot do the same for numberMin because it would create a circular dependency
            .when(
              ['numberMin', 'numberMaxInclusive', 'numberMinInclusive'],
              ([numberMin, numberMaxInclusive, numberMinInclusive], schema) => {
                if (numberMin !== undefined) {
                  if (numberMinInclusive && numberMaxInclusive) {
                    return schema.min(
                      numberMin,
                      'Maximum must be greater than or equal to Minimum'
                    );
                  } else {
                    return schema.moreThan(
                      numberMin,
                      'Maximum must be strictly greater than Minimum'
                    );
                  }
                }

                return schema;
              }
            ),
        }),
      })}
    >
      {({ setFieldValue, setFieldTouched, values }) => (
        <>
          <Field
            name="naturalKey"
            label="Key"
            id="Key-input"
            type="text"
            component={TextField}
            fullWidth
            slotProps={{
              htmlInput: { 'data-cy': 'natural_key' },
            }}
          />
          <Field
            name="question"
            label="Question"
            id="Question-input"
            type="text"
            component={TextField}
            fullWidth
            slotProps={{
              htmlInput: { 'data-cy': 'question' },
            }}
          />
          <Field
            name="config.small_label"
            label="Small label"
            id="Small-label-input"
            type="text"
            component={TextField}
            fullWidth
            slotProps={{
              htmlInput: { 'data-cy': 'small-label' },
            }}
          />
          <TitledContainer label="Constraints">
            <Field
              name="config.required"
              component={CheckboxWithLabel}
              type="checkbox"
              Label={{
                label: 'Is required',
              }}
              InputProps={{ 'data-cy': 'required' }}
            />
            <FormControl fullWidth>
              <Autocomplete
                id="config-units"
                multiple
                options={units}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText={
                  <>
                    No options - &nbsp;
                    <Button
                      onClick={() => setShow(true)}
                      variant="outlined"
                      data-cy="add-button"
                      color="primary"
                      startIcon={<AddCircleOutlineIcon />}
                    >
                      Add new unit
                    </Button>
                  </>
                }
                getOptionLabel={({ unit, symbol, quantity }) =>
                  `${symbol} (${unit}) - ${quantity}`
                }
                renderInput={(params) => {
                  return (
                    <MUITextField {...params} label="Units" margin="none" />
                  );
                }}
                onChange={(_event, newValue) => {
                  setSelectedUnits(newValue as Unit[]);
                  setFieldValue('config.units', newValue);
                }}
                value={selectedUnits ?? undefined}
                data-cy="units"
              />

              <Link
                href="/Units/"
                target="_blank"
                sx={{ marginLeft: 'auto', marginRight: 0 }}
              >
                View/Edit all units
                <LaunchIcon
                  fontSize="small"
                  sx={{
                    verticalAlign: 'middle',
                    marginLeft: theme.spacing(0.5),
                  }}
                />
              </Link>
            </FormControl>

            <FormikUIAutocomplete
              name="config.numberValueConstraint"
              label="Value constraint"
              InputProps={{
                'data-cy': 'numberValueConstraint',
              }}
              items={[
                { text: 'None', value: NumberValueConstraint.NONE },
                {
                  text: 'Only positive numbers',
                  value: NumberValueConstraint.ONLY_POSITIVE,
                },
                {
                  text: 'Only negative numbers',
                  value: NumberValueConstraint.ONLY_NEGATIVE,
                },
                {
                  text: 'Only positive integers',
                  value: NumberValueConstraint.ONLY_POSITIVE_INTEGER,
                },
                {
                  text: 'Only negative integers',
                  value: NumberValueConstraint.ONLY_NEGATIVE_INTEGER,
                },
              ]}
            />
            <Field
              name="config.numberMin"
              label="Minimum"
              id="config.numberMin"
              type="number"
              component={TextField}
              fullWidth
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value =
                  e.target.value === '' ? null : Number(e.target.value);
                setFieldValue('config.numberMin', value);
                //Trigger validation for numberMax when numberMin changes
                setFieldTouched('config.numberMax', true, true);
              }}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                console.log(e.target.value);
                e.target.value === '' &&
                  setFieldValue('config.numberMinInclusive', false);
              }}
              slotProps={{
                htmlInput: { 'data-cy': 'numberMin' },
              }}
            />
            {(values.config as NumberInputConfig).numberMin !== null && (
              <Field
                name="config.numberMinInclusive"
                id="config.numberMinInclusive"
                type="checkbox"
                component={CheckboxWithLabel}
                Label={{
                  label: 'Minimum is inclusive',
                }}
                inputProps={{ 'data-cy': 'numberMinInclusive' }}
              />
            )}
            <Field
              name="config.numberMax"
              label="Maximum"
              id="config.numberMax"
              type="number"
              component={TextField}
              fullWidth
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value =
                  e.target.value === '' ? null : Number(e.target.value);
                setFieldValue('config.numberMax', value);
              }}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.value === '' &&
                  setFieldValue('config.numberMaxInclusive', false);
              }}
              slotProps={{
                htmlInput: { 'data-cy': 'numberMax' },
              }}
            />
            {(values.config as NumberInputConfig).numberMax !== null && (
              <Field
                name="config.numberMaxInclusive"
                id="config.numberMaxInclusive"
                type="checkbox"
                component={CheckboxWithLabel}
                Label={{
                  label: 'Maximum is inclusive',
                }}
                inputProps={{ 'data-cy': 'numberMaxInclusive' }}
              />
            )}
          </TitledContainer>
          <StyledDialog
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            data-cy="unit-modal"
            open={show}
            fullWidth={true}
            onClose={(_, reason) => {
              if (reason && reason == 'backdropClick') return;
              setShow(false);
            }}
            title="Create new unit"
          >
            <DialogContent>
              <CreateUnit close={onCreated} unit={null} />
            </DialogContent>
          </StyledDialog>
        </>
      )}
    </QuestionFormShell>
  );
};
