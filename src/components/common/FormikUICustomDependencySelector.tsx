import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { FormikHelpers } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';

import {
  DataType,
  EvaluatorOperator,
  FieldDependency,
  QuestionTemplateRelation,
  SelectionFromOptionsConfig,
  Template,
} from 'generated/sdk';
import { getAllFields, getFieldById } from 'models/QuestionaryFunctions';

const FormikUICustomDependencySelector = ({
  field,
  template,
  form,
  dependency,
  currentQuestionId,
}: {
  field: { name: string; onBlur: Function; onChange: Function; value: string };
  form: FormikHelpers<any>;
  template: Template;
  templateField: QuestionTemplateRelation;
  dependency: FieldDependency;
  currentQuestionId: string;
}) => {
  const [dependencyId, setDependencyId] = useState<string>('');
  const [operator, setOperator] = useState<EvaluatorOperator>(
    EvaluatorOperator.EQ
  );
  const [dependencyValue, setDependencyValue] = useState<
    string | boolean | number | Date
  >('');

  const [availableValues, setAvailableValues] = useState<Option[]>([]);

  const classes = makeStyles(theme => ({
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      '& SVG': {
        marginRight: theme.spacing(1),
      },
    },
  }))();

  useEffect(() => {
    setDependencyId(dependency.dependencyId);
    setOperator(dependency.condition.condition);
    setDependencyValue(dependency.condition.params);
  }, [
    dependency.dependencyId,
    dependency.condition.condition,
    dependency.condition.params,
  ]);

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
            option => {
              return { value: option, label: option };
            }
          )
        ); // use options
      }
    }
  }, [dependencyId, template]);

  const updateFormikMemoized = useCallback(updateFormik, [
    dependencyId,
    operator,
    dependencyValue,
  ]);

  useEffect(() => {
    updateFormikMemoized();
  }, [dependencyId, operator, dependencyValue, updateFormikMemoized]);

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
            onChange={(event: React.ChangeEvent<{ value: unknown }>): void => {
              const depFieldId = event.target.value as string;
              setDependencyId(depFieldId);
            }}
            required
          >
            {getAllFields(template.steps)
              .filter(
                option =>
                  [DataType.BOOLEAN, DataType.SELECTION_FROM_OPTIONS].includes(
                    option.question.dataType
                  ) && currentQuestionId !== option.question.proposalQuestionId
              )
              .map(option => {
                return (
                  <MenuItem
                    value={option.question.proposalQuestionId}
                    className={classes.menuItem}
                    key={option.question.proposalQuestionId}
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
            onChange={(event: React.ChangeEvent<{ value: unknown }>): void => {
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
            value={dependencyValue}
            onChange={(event: React.ChangeEvent<{ value: any }>): void => {
              setDependencyValue(event.target.value);
            }}
            required
          >
            {availableValues.map(option => {
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
  value: string | boolean;
  label: string;
}
