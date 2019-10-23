import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  makeStyles
} from "@material-ui/core";
import { FormikActions } from "formik";
import {
  FieldDependency,
  ProposalTemplate,
  DataType,
  FieldCondition,
  ProposalTemplateField
} from "../models/ProposalModel";
import { getFieldById, getAllFields } from "../models/ProposalModelFunctions";
import { EvaluatorOperator } from "../models/ConditionEvaluator";

const FormikUICustomDependencySelector = ({
  field,
  template,
  form,
  templateField
}: {
  field: { name: string; onBlur: Function; onChange: Function; value: string };
  form: FormikActions<any>;
  template: ProposalTemplate;
  templateField: ProposalTemplateField;
}) => {
  const [dependencyId, setDependencyId] = useState<string>("");
  const [operator, setOperator] = useState<EvaluatorOperator>(
    EvaluatorOperator.EQ
  );
  const [dependencyValue, setDependencyValue] = useState<string>("");

  const [availableValues, setAvailableValues] = useState<IOption[]>([]);

  const classes = makeStyles(theme => ({
    menuItem: {
      display: "flex",
      alignItems: "center",
      "& SVG": {
        marginRight: theme.spacing(1)
      }
    }
  }))();

  useEffect(() => {
    if (!templateField) {
      return;
    }
    if (templateField.dependencies && templateField.dependencies.length > 0) {
      var dependency = templateField.dependencies[0]; // currently only 1 supported
      setDependencyId(dependency.proposal_question_dependency);
      setOperator(dependency.condition.condition);
      setDependencyValue(dependency.condition.params);
    }
  }, [templateField]);

  const updateFormik = () => {
    var dep = new FieldDependency(
      templateField.proposal_question_id,
      dependencyId,
      new FieldCondition(operator, dependencyValue)
    );
    form.setFieldValue(field.name, [dep]);
  };

  useEffect(() => {
    if (dependencyId) {
      const depField = getFieldById(template, dependencyId);
      if (!depField) {
        return;
      }
      if (depField.data_type === DataType.BOOLEAN) {
        setAvailableValues([
          { label: "true", value: true },
          { label: "false", value: false }
        ]);
      } else if (depField.data_type === DataType.SELECTION_FROM_OPTIONS) {
        setAvailableValues(
          depField.config.options!.map(option => {
            return { value: option, label: option };
          })
        ); // use options
      }
    }
  }, [dependencyId, template]);

  const updateFormikMemoized = useCallback(updateFormik, [
    dependencyId,
    operator,
    dependencyValue
  ]);

  useEffect(() => {
    if (dependencyId !== "" && dependencyValue !== "") {
      updateFormikMemoized();
    }
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
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
              const depFieldId = event.target.value as string;
              setDependencyId(depFieldId);
            }}
          >
            {getAllFields(template)
              .filter(option =>
                [DataType.BOOLEAN, DataType.SELECTION_FROM_OPTIONS].includes(
                  option.data_type
                )
              )
              .map(option => {
                return (
                  <MenuItem
                    value={option.proposal_question_id}
                    className={classes.menuItem}
                    key={option.proposal_question_id}
                  >
                    {/* {getTemplateFieldIcon(option.data_type)}  */}
                    {option.question}
                  </MenuItem>
                );
              })}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={3}>
        <FormControl fullWidth>
          <InputLabel shrink htmlFor="operator">
            Compare
          </InputLabel>
          <Select
            fullWidth
            id="operator"
            value={operator}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
              setOperator(event.target.value as EvaluatorOperator);
            }}
          >
            <MenuItem value="eq">equals</MenuItem>
            <MenuItem value="neq">not equal</MenuItem>
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
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
              setDependencyValue(event.target.value as string);
            }}
          >
            {availableValues.map(option => {
              return (
                // @ts-ignore boolean will work
                <MenuItem value={option.value} key={option.label}>
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

interface IOption {
  value: string | boolean;
  label: string;
}
