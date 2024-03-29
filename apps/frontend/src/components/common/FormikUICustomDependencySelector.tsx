import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import makeStyles from '@mui/styles/makeStyles';
import { FormikProps, FormikValues } from 'formik';
import React, { useCallback, useEffect, useState, useMemo } from 'react';

import {
  DataType,
  EvaluatorOperator,
  FieldDependency,
  QuestionTemplateRelation,
  SelectionFromOptionsConfig,
  Template,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import {
  getAllFields,
  getFieldById,
  AbstractField,
} from 'models/questionary/QuestionaryFunctions';
import { FunctionType } from 'utils/utilTypes';

const useStyles = makeStyles((theme) => ({
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    '& SVG': {
      marginRight: theme.spacing(1),
    },
  },
}));
const FormikUICustomDependencySelector = ({
  field,
  template,
  form,
  dependency,
  currentQuestionId,
}: {
  field: {
    name: string;
    onBlur: FunctionType;
    onChange: FunctionType;
    value: string;
  };
  form: FormikProps<FormikValues>;
  template: Template;
  templateField: QuestionTemplateRelation;
  dependency: FieldDependency;
  currentQuestionId: string;
}) => {
  const [dependencyId, setDependencyId] = useState<string>(
    dependency.dependencyId || ''
  );
  const [operator, setOperator] = useState<EvaluatorOperator>(
    dependency.condition.condition || EvaluatorOperator.EQ
  );
  const [dependencyValue, setDependencyValue] = useState<
    string | boolean | number | Date | unknown
  >(dependency.condition.params || '');

  const [availableValues, setAvailableValues] = useState<Option[]>([]);

  const classes = useStyles();
  const api = useDataApi();

  const updateFormik = (): void => {
    if (dependencyId && dependencyValue && operator) {
      const dependency = {
        dependencyId,
        condition: {
          condition: operator,
          params: dependencyValue,
        },
      };
      form.setFieldValue(field.name, dependency);
    }
  };

  useEffect(() => {
    if (dependencyId) {
      const depField = getFieldById(template.steps, dependencyId);
      if (!depField) {
        return;
      }
      if (depField.question.dataType === DataType.BOOLEAN) {
        setAvailableValues([
          { label: 'true', value: true },
          { label: 'false', value: false },
        ]);
      } else if (
        depField.question.dataType === DataType.SELECTION_FROM_OPTIONS
      ) {
        setAvailableValues(
          (depField.config as SelectionFromOptionsConfig).options.map(
            (option) => {
              return { value: option, label: option };
            }
          )
        ); // use options
      } else if (depField.question.dataType === DataType.INSTRUMENT_PICKER) {
        if (form.submitCount) {
          return;
        }

        api()
          .getInstruments()
          .then((data) => {
            if (data.instruments) {
              setAvailableValues(
                data.instruments.instruments.map((instrument) => ({
                  label: instrument.name,
                  value: instrument.id,
                }))
              );
            }
          });
      }
    }
  }, [dependencyId, template, api, form.submitCount]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateFormikMemoized = useCallback(updateFormik, [
    dependencyId,
    operator,
    dependencyValue,
  ]);

  useEffect(() => {
    updateFormikMemoized();
  }, [dependencyId, operator, dependencyValue, updateFormikMemoized]);

  const { steps } = template;

  const allAvailableFields = useMemo(() => {
    const allFields = getAllFields(steps);

    const hasCircularDependency = (
      currentQuestionId: string,
      option?: AbstractField
    ): boolean => {
      if (!option) {
        return false;
      }

      return option.dependencies.some(
        (dependency) =>
          dependency.dependencyId === currentQuestionId ||
          hasCircularDependency(
            currentQuestionId,
            allFields.find(
              (option) => option.question.id === dependency.dependencyId
            )
          )
      );
    };

    return allFields
      .filter(
        (option) =>
          [
            DataType.BOOLEAN,
            DataType.SELECTION_FROM_OPTIONS,
            DataType.INSTRUMENT_PICKER,
          ].includes(option.question.dataType) &&
          currentQuestionId !== option.question.id
      )
      .filter((option) => !hasCircularDependency(currentQuestionId, option));
  }, [steps, currentQuestionId]);

  return (
    <Grid container>
      <Grid item xs={6}>
        <FormControl fullWidth>
          <InputLabel htmlFor="dependency-id" shrink>
            Field
          </InputLabel>
          <Select
            id="dependency-id"
            value={dependencyId}
            onChange={(event: SelectChangeEvent<string>) => {
              const depFieldId = event.target.value;

              setDependencyId(depFieldId);

              if (depFieldId !== dependencyId) {
                setDependencyValue('');
              }
            }}
            required
          >
            {allAvailableFields.map((option) => {
              return (
                <MenuItem
                  value={option.question.id}
                  className={classes.menuItem}
                  key={option.question.id}
                >
                  {option.question.question}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={2}>
        <FormControl fullWidth>
          <InputLabel shrink htmlFor="operator">
            Compare
          </InputLabel>
          <Select
            fullWidth
            id="operator"
            value={operator}
            onChange={(event: SelectChangeEvent<EvaluatorOperator>) => {
              setOperator(event.target.value as EvaluatorOperator);
            }}
          >
            <MenuItem value={EvaluatorOperator.EQ.toString()}>equals</MenuItem>
            <MenuItem value={EvaluatorOperator.NEQ.toString()}>
              not equal
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={4}>
        <FormControl fullWidth>
          <InputLabel shrink htmlFor="dependencyValue">
            Value
          </InputLabel>
          <Select
            fullWidth
            id="dependencyValue"
            value={availableValues.length ? dependencyValue : ''}
            onChange={(event: SelectChangeEvent<unknown>): void => {
              setDependencyValue(event.target.value);
            }}
            required
          >
            {availableValues.map((option) => {
              return (
                <MenuItem value={option.value as string} key={option.label}>
                  {option.label}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default FormikUICustomDependencySelector;

interface Option {
  value: string | boolean | number;
  label: string;
}
