import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@material-ui/core";
import { FormikActions } from "formik";
import {
  FieldDependency,
  ProposalTemplate,
  DataType,
  FieldCondition,
  ProposalTemplateField
} from "../model/ProposalModel";

const FormikUICustomDependencySelector = ({
  field,
  template,
  form,
  question
}: {
  field: { name: string; onBlur: Function; onChange: Function; value: string };
  form: FormikActions<any>;
  template: ProposalTemplate;
  question: ProposalTemplateField;
}) => {
  const [dependencyId, setDependencyId] = useState<string | undefined>();
  const [operator, setOperator] = useState<string | undefined>();
  const [dependencyValue, setDependencyValue] = useState<string | undefined>();
  const [availableValues, setAvailableValues] = useState<string[]>([]);

  useEffect(() => {
    if (!question) {
      return;
    }
    if (question.dependencies && question.dependencies.length > 0) {
      var dependency = question.dependencies[0]; // currently only 1 supported
      setDependencyId(dependency.proposal_question_dependency);
      setOperator(dependency.condition.condition);
      setDependencyValue(dependency.condition.params);
    }
  }, [question]);

  const updateFormik = () => {
    var dep = new FieldDependency(null);
    dep.proposal_question_id = question.proposal_question_id; // currently only 1 supported
    dep.proposal_question_dependency = dependencyId!;
    var cond = new FieldCondition(null);
    cond!.condition = operator!;
    cond.params = dependencyValue;
    dep.condition = cond;
    form.setFieldValue(field.name, [dep]);
  };

  const updateFormikMemoized = useCallback(updateFormik, [
    dependencyId,
    operator,
    dependencyValue
  ]);

  useEffect(() => {
    if (dependencyId && operator && dependencyValue) {
      updateFormikMemoized();
    }
  }, [dependencyId, operator, dependencyValue, updateFormikMemoized]);

  return (
    <Grid container>
      <Grid item xs={5}>
        <FormControl fullWidth>
          <InputLabel htmlFor="dependency-id" shrink>
            If field
          </InputLabel>
          <Select
            id="dependency-id"
            value={dependencyId}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
              const depFieldId = event.target.value as string;
              const depField = template.getFieldById(depFieldId);
              if (depField.data_type === DataType.BOOLEAN) {
                setAvailableValues(["true", "false"]); // use options
              } else if (
                depField.data_type === DataType.SELECTION_FROM_OPTIONS
              ) {
                setAvailableValues(depField.config.options!); // use options
              }

              setDependencyId(depFieldId);
            }}
          >
            {template.getAllFields().map(option => {
              return (
                <MenuItem value={option.proposal_question_id}>
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
            Compares
          </InputLabel>
          <Select
            fullWidth
            id="operator"
            value={operator}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
              setOperator(event.target.value as string);
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
              return <MenuItem value={option}>{option}</MenuItem>;
            })}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default FormikUICustomDependencySelector;
