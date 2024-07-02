import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Form, Formik } from 'formik';
import React from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import {
  getQuestionaryComponentDefinition,
  QuestionTemplateRelationFormProps,
} from 'components/questionary/QuestionaryComponentRegistry';
import { FieldDependencyInput, QuestionTemplateRelation } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

// Have this until GQL accepts Union types
// https://github.com/graphql/graphql-spec/blob/master/rfcs/InputUnion.md
const prepareDependencies = (dependency: FieldDependencyInput) => {
  return {
    ...dependency,
    condition: {
      ...dependency?.condition,
      params: JSON.stringify({ value: dependency?.condition.params }),
    },
  };
};

export const QuestionTemplateRelationFormShell = (
  props: QuestionTemplateRelationFormProps & { validationSchema: unknown }
) => {
  const { api } = useDataApiWithFeedback();
  const definition = getQuestionaryComponentDefinition(
    props.questionRel.question.dataType
  );

  const submitHandler = async (
    values: QuestionTemplateRelation
  ): Promise<void> => {
    api()
      .updateQuestionTemplateRelationSettings({
        templateId: props.template.templateId,
        questionId: values.question.id,
        config: values.config ? JSON.stringify(values.config) : undefined,
        dependencies: values.dependencies
          ? values.dependencies.map((dependency) =>
              prepareDependencies(dependency)
            )
          : [],
        dependenciesOperator: values.dependenciesOperator,
      })
      .then((data) => {
        if (data.updateQuestionTemplateRelationSettings) {
          props.onUpdated?.(data.updateQuestionTemplateRelationSettings);
          props.closeMe?.();
        }
      });
  };

  const deleteHandler = async () => {
    const { deleteQuestionTemplateRelation } =
      await api().deleteQuestionTemplateRelation({
        templateId: props.template.templateId,
        questionId: props.questionRel.question.id,
      });

    if (deleteQuestionTemplateRelation) {
      props.onDeleted?.(deleteQuestionTemplateRelation);
      props.closeMe?.();
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography
        variant="h4"
        component="h1"
        sx={(theme) => ({
          marginTop: theme.spacing(2),
          marginBottom: '21px',
          display: 'flex',
          alignItems: 'center',
          color: theme.palette.grey[600],
          '& SVG': {
            marginRight: theme.spacing(1),
          },
        })}
      >
        {definition.icon}
        {definition.name}
      </Typography>
      <Link
        data-cy="natural-key"
        href="#"
        onClick={() => {
          props.onOpenQuestionClicked?.(props.questionRel.question);
          props.closeMe?.();
        }}
        sx={{
          fontSize: '16px',
          paddingLeft: '21px',
          display: 'block',
          marginBottom: '16px',
        }}
      >
        Edit {props.questionRel.question.naturalKey}
      </Link>
      <Formik
        initialValues={props.questionRel}
        onSubmit={submitHandler}
        validationSchema={props.validationSchema}
      >
        {(formikProps) => (
          <Form style={{ flexGrow: 1 }}>
            {props.children?.(formikProps)}
            <ActionButtonContainer>
              <Button
                type="button"
                variant="outlined"
                data-cy="remove-from-template"
                onClick={deleteHandler}
                disabled={definition.creatable === false}
              >
                Remove from template
              </Button>
              <Button
                type="submit"
                data-cy="submit"
                disabled={!formikProps.isValid}
              >
                Update
              </Button>
            </ActionButtonContainer>
          </Form>
        )}
      </Formik>
    </Box>
  );
};
