import {
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import { FormikActions } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';

import {
  DataType,
  EvaluatorOperator,
  ProposalTemplate,
  SelectionFromOptionsConfig,
  QuestionRel,
} from '../../generated/sdk';
import {
  getAllFields,
  getFieldById,
} from '../../models/ProposalModelFunctions';

const FormikUICustomDependencySelector = ({
  field,
  template,
  form,
  templateField,
}: {
  field: { name: string; onBlur: Function; onChange: Function; value: string };
  form: FormikActions<any>;
  template: ProposalTemplate;
  templateField: QuestionRel;
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
    if (!templateField) {
      return;
    }
    if (templateField.dependency) {
      const dependency = templateField.dependency;
      setDependencyId(dependency.dependencyId);
      setOperator(dependency.condition.condition);
      setDependencyValue(dependency.condition.params);
    }
  }, [templateField]);

  const updateFormik = (): void => {
    const dependencies = [];
    if (dependencyId && dependencyValue && operator) {
      dependencies.push({
        question_id: templateField.question.proposalQuestionId,
        dependency_id: dependencyId,
        condition: {
          condition: operator,
          params: dependencyValue,
        },
      });
    }
    form.setFieldValue(field.name, dependencies);
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
          (depField.question.config as SelectionFromOptionsConfig).options.map(
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
      <Grid item xs={5}>
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
          >
            {getAllFields(template.steps)
              .filter(option =>
                [DataType.BOOLEAN, DataType.SELECTION_FROM_OPTIONS].includes(
                  option.question.dataType
                )
              )
              .map(option => {
                return (
                  <MenuItem
                    value={option.question.proposalQuestionId}
                    className={classes.menuItem}
                    key={option.question.proposalQuestionId}
                  >
                    {/* {getTemplateFieldIcon(option.question.dataType)}  */}
                    {option.question}
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
      <Grid item xs={1}>
        <IconButton
          onClick={(): void => {
            setDependencyId('');
            setDependencyValue('');
          }}
        >
          <ClearIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default FormikUICustomDependencySelector;

interface Option {
  value: string | boolean;
  label: string;
}
