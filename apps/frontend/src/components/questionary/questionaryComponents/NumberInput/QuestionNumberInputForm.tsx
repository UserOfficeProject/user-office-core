import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import LaunchIcon from '@mui/icons-material/Launch';
import Autocomplete from '@mui/lab/Autocomplete';
import { Button, IconButton } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import MaterialTextField from '@mui/material/TextField';
import makeStyles from '@mui/styles/makeStyles';
import { Field } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-mui';
import React, { useState } from 'react';
import * as Yup from 'yup';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import InputDialog from 'components/common/InputDialog';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionFormShell } from 'components/questionary/questionaryComponents/QuestionFormShell';
import CreateUnit from 'components/settings/unitList/CreateUnit';
import { NumberInputConfig, NumberValueConstraint, Unit } from 'generated/sdk';
import { useUnitsData } from 'hooks/settings/useUnitData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import TemplateEditLabel from '../../../template/QuestionTemplateLabel';
const useStyles = makeStyles((theme) => ({
  iconVerticalAlign: {
    verticalAlign: 'middle',
    marginLeft: theme.spacing(0.5),
  },
  textRightAlign: {
    marginLeft: 'auto',
    marginRight: 0,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
}));

export const QuestionNumberForm = (props: QuestionFormProps) => {
  const [show, setShow] = useState(false);
  const field = props.question;
  const numberConfig = props.question.config as NumberInputConfig;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);
  const { units, setUnitsWithLoading } = useUnitsData();
  const { api } = useDataApiWithFeedback();
  const classes = useStyles();
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
        }),
      })}
    >
      {({ setFieldValue }) => (
        <>
          <TemplateEditLabel pageType="Question" />
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
            name="config.small_label"
            label="Small label"
            id="Small-label-input"
            type="text"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'small-label' }}
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
                    <MaterialTextField
                      {...params}
                      label="Units"
                      margin="none"
                    />
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
                className={classes.textRightAlign}
              >
                View/Edit all units
                <LaunchIcon
                  fontSize="small"
                  className={classes.iconVerticalAlign}
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
          </TitledContainer>
          <InputDialog
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            data-cy="unit-modal"
            open={show}
            fullWidth={true}
            onClose={(_, reason) => {
              if (reason && reason == 'backdropClick') return;
              setShow(false);
            }}
          >
            <IconButton
              className={classes.closeButton}
              data-cy="close-modal-btn"
              onClick={() => {
                setShow(false);
              }}
            >
              <CloseIcon />
            </IconButton>
            <CreateUnit close={onCreated} unit={null} />
          </InputDialog>
        </>
      )}
    </QuestionFormShell>
  );
};
