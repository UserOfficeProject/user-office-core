import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import ClearIcon from '@material-ui/icons/Clear';
import { Field, FieldArray } from 'formik';
import React from 'react';

import FormikUICustomDependencySelector from 'components/common/FormikUICustomDependencySelector';
import {
  DataType,
  EvaluatorOperator,
  QuestionTemplateRelation,
  Template,
} from 'generated/sdk';
import { getAllFields } from 'models/QuestionaryFunctions';

type QuestionDependencyListProps = {
  template: Template;
  field: QuestionTemplateRelation;
};

const QuestionDependencyList: React.FC<QuestionDependencyListProps> = ({
  template,
  field,
}) => {
  const currentQuestionId = field.question.proposalQuestionId;

  const allAvailableDependenciesAdded =
    field.dependencies.length >=
    getAllFields(template.steps).filter(
      option =>
        [DataType.BOOLEAN, DataType.SELECTION_FROM_OPTIONS].includes(
          option.question.dataType
        ) && currentQuestionId !== option.question.proposalQuestionId
    ).length;

  return (
    <>
      <FieldArray name="dependencies">
        {({ remove, push }) => (
          <>
            <Box display="flex" flexDirection="row-reverse">
              <Tooltip title="Add dependency">
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
              </Tooltip>
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
                        margin="normal"
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
    </>
  );
};

export default QuestionDependencyList;
