import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ClearIcon from '@mui/icons-material/Clear';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import { Field, FieldArray, FormikProps } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';

import FormikUICustomDependencySelector from 'components/common/FormikUICustomDependencySelector';
import {
  DataType,
  DependenciesLogicOperator,
  EvaluatorOperator,
  QuestionTemplateRelation,
  Template,
} from 'generated/sdk';
import { getAllFields } from 'models/questionary/QuestionaryFunctions';

type QuestionDependencyListProps = {
  template: Template;
  form: FormikProps<QuestionTemplateRelation>;
};

const QuestionDependencyList: React.FC<QuestionDependencyListProps> = ({
  template,
  form,
}) => {
  const field: QuestionTemplateRelation = form.values;
  const [logicOperator, setLogicOperator] = useState<DependenciesLogicOperator>(
    field.dependenciesOperator || DependenciesLogicOperator.AND
  );

  useEffect(() => {
    setLogicOperator(field.dependenciesOperator as DependenciesLogicOperator);
  }, [field.dependenciesOperator]);

  const updateFormik = (): void => {
    if (logicOperator) {
      form.setFieldValue('dependenciesOperator', logicOperator);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateFormikMemoized = useCallback(updateFormik, [logicOperator]);

  useEffect(() => {
    updateFormikMemoized();
  }, [logicOperator, updateFormikMemoized]);

  const currentQuestionId = field.question.id;

  const allAvailableDependenciesAdded =
    field.dependencies.length >=
    getAllFields(template.steps).filter(
      (option) =>
        [DataType.BOOLEAN, DataType.SELECTION_FROM_OPTIONS].includes(
          option.question.dataType
        ) && currentQuestionId !== option.question.id
    ).length;

  return (
    <FieldArray name="dependencies">
      {({ remove, push }) => (
        <>
          <Box mb={2}>
            <Grid container direction="row-reverse">
              <Grid item xs={1}>
                <Tooltip title="Add dependency">
                  <>
                    <IconButton
                      onClick={() =>
                        push({
                          dependencyId: '',
                          questionId: currentQuestionId,
                          dependencyNaturalKey: '',
                          condition: {
                            condition: EvaluatorOperator.EQ,
                            params: '',
                          },
                        })
                      }
                      data-cy="add-dependency-button"
                      disabled={allAvailableDependenciesAdded}
                    >
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </>
                </Tooltip>
              </Grid>
              {field.dependencies.length > 1 && (
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel shrink htmlFor="operator">
                      Compare dependencies
                    </InputLabel>
                    <Select
                      fullWidth
                      name="dependenciesOperator"
                      value={logicOperator}
                      onChange={(
                        event: SelectChangeEvent<DependenciesLogicOperator>
                      ) => {
                        setLogicOperator(
                          event.target.value as DependenciesLogicOperator
                        );
                      }}
                      data-cy="dependencies-operator"
                    >
                      <MenuItem
                        value={DependenciesLogicOperator.AND.toString()}
                      >
                        AND
                      </MenuItem>
                      <MenuItem value={DependenciesLogicOperator.OR.toString()}>
                        OR
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </Box>
          {field.dependencies?.map((dependency, i) => {
            return (
              <Box key={`${dependency?.dependencyId}_${i}`} mb={1}>
                <Grid container>
                  <Grid item xs={11}>
                    <Field
                      name={`dependencies.${i}`}
                      component={FormikUICustomDependencySelector}
                      template={template}
                      dependency={dependency}
                      currentQuestionId={currentQuestionId}
                      fullWidth
                      inputProps={{ 'data-cy': 'dependencies' }}
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton
                      onClick={(): void => {
                        remove(i);
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            );
          })}
        </>
      )}
    </FieldArray>
  );
};

export default QuestionDependencyList;
