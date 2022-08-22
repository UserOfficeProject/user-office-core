import makeStyles from '@mui/styles/makeStyles';
import { Field, FieldProps } from 'formik';
import React, { useContext, useState } from 'react';

import ErrorMessage from 'components/common/ErrorMessage';
import StyledModal from 'components/common/StyledModal';
import UOLoader from 'components/common/UOLoader';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { ProposalContextType } from 'components/proposal/ProposalContainer';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { QuestionaryStep, SubTemplateConfig } from 'generated/sdk';
import { GenericTemplateCore } from 'models/questionary/genericTemplate/GenericTemplateCore';
import { GenericTemplateWithQuestionary } from 'models/questionary/genericTemplate/GenericTemplateWithQuestionary';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';
import withPrompt, { WithPromptType } from 'utils/withPrompt';

import {
  QuestionnairesList,
  QuestionnairesListRow,
} from '../QuestionnairesList';
import { GenericTemplateContainer } from './GenericTemplateContainer';

const useStyles = makeStyles(() => ({
  questionLabel: {
    opacity: 0.54,
    fontWeight: 400,
    fontSize: '1rem',
  },
}));
const genericTemplateToListRow = (
  genericTemplate: GenericTemplateCore
): QuestionnairesListRow => {
  return {
    id: genericTemplate.id,
    label: genericTemplate.title,
    isCompleted: genericTemplate.questionary?.isCompleted ?? false,
  };
};

function createGenericTemplateStub(
  templateId: number,
  questionarySteps: QuestionaryStep[],
  proposalPk: number,
  questionId: string
): GenericTemplateWithQuestionary {
  return {
    id: 0,
    created: new Date(),
    creatorId: 0,
    questionary: {
      questionaryId: 0,
      templateId: templateId,
      created: new Date(),
      steps: questionarySteps,
      isCompleted: false,
    },
    questionId: questionId,
    questionaryId: 0,
    title: '',
    proposalPk: proposalPk,
  };
}

function QuestionaryComponentGenericTemplate(
  props: BasicComponentProps & {
    confirm: WithConfirmType;
    prompt: WithPromptType;
  }
) {
  const { answer, confirm, prompt } = props;
  const answerId = answer.question.id;
  const config = answer.config as SubTemplateConfig;
  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as ProposalContextType;

  const { api } = useDataApiWithFeedback();
  const classes = useStyles();

  const [selectedGenericTemplate, setSelectedGenericTemplate] =
    useState<GenericTemplateWithQuestionary | null>(null);

  if (!state) {
    throw new Error(createMissingContextErrorMessage());
  }

  return (
    <Field name={answerId}>
      {({ field, form }: FieldProps<GenericTemplateWithQuestionary[]>) => {
        const updateFieldValueAndState = (
          updatedItems: GenericTemplateCore[] | null
        ) => {
          form.setFieldValue(answerId, updatedItems);
          dispatch({
            type: 'GENERIC_TEMPLATE_ITEMS_MODIFIED',
            id: answerId,
            newItems: updatedItems,
          });
        };

        const copyGenericTemplate = (id: number, title: string) =>
          api()
            .cloneGenericTemplate({ genericTemplateId: id, title: title })
            .then((response) => {
              const clonedGenericTemplate =
                response.cloneGenericTemplate.genericTemplate;
              if (clonedGenericTemplate) {
                const newStateItems = [...field.value, clonedGenericTemplate];

                updateFieldValueAndState(newStateItems);
              }
            });

        const deleteGenericTemplate = (id: number) =>
          api()
            .deleteGenericTemplate({ genericTemplateId: id })
            .then((response) => {
              if (!response.deleteGenericTemplate.rejection) {
                const newStateItems = field.value.filter(
                  (genericTemplate) => genericTemplate.id !== id
                );

                updateFieldValueAndState(newStateItems);
              }
            });

        return (
          <div>
            <label className={classes.questionLabel}>
              {answer.question.question}
            </label>
            <QuestionnairesList
              addButtonLabel={config.addEntryButtonLabel}
              data={field.value?.map(genericTemplateToListRow) ?? []}
              maxEntries={config.maxEntries || undefined}
              onEditClick={(item) =>
                api()
                  .getGenericTemplate({ genericTemplateId: item.id })
                  .then((response) => {
                    if (response.genericTemplate) {
                      setSelectedGenericTemplate(response.genericTemplate);
                    }
                  })
              }
              onDeleteClick={(item) => {
                confirm(() => deleteGenericTemplate(item.id), {
                  title: 'Delete GenericTemplate',
                  description:
                    'This action will delete the genericTemplate and all data associated with it',
                })();
              }}
              onCloneClick={(item) => {
                prompt((answer) => copyGenericTemplate(item.id, answer), {
                  question: 'Title',
                  prefilledAnswer: `Copy of ${item.label}`,
                })();
              }}
              onAddNewClick={() => {
                // TODO move this into a function like copyGenericTemplate
                if (!state) {
                  throw new Error(
                    'GenericTemplate Declaration is missing proposal context'
                  );
                }

                const proposalPk = state.proposal.primaryKey;
                const questionId = props.answer.question.id;
                if (proposalPk <= 0 || !questionId) {
                  throw new Error(
                    'GenericTemplate is missing proposal id and/or question id'
                  );
                }
                const templateId = config.templateId;

                if (!templateId) {
                  throw new Error('GenericTemplate is missing templateId');
                }

                api()
                  .getBlankQuestionarySteps({ templateId })
                  .then((result) => {
                    const blankSteps = result.blankQuestionarySteps;
                    if (blankSteps) {
                      const genericTemplateStub = createGenericTemplateStub(
                        templateId,
                        blankSteps,
                        proposalPk,
                        questionId
                      );
                      setSelectedGenericTemplate(genericTemplateStub);
                    }
                  });
              }}
              {...props}
            />

            <ErrorMessage name={answerId} />

            <StyledModal
              onClose={() => setSelectedGenericTemplate(null)}
              open={selectedGenericTemplate !== null}
              data-cy="genericTemplate-declaration-modal"
            >
              {selectedGenericTemplate ? (
                <GenericTemplateContainer
                  genericTemplate={selectedGenericTemplate}
                  genericTemplateUpdated={(updatedGenericTemplate) => {
                    const newStateItems = field.value.map((genericTemplate) =>
                      genericTemplate.id === updatedGenericTemplate.id
                        ? updatedGenericTemplate
                        : genericTemplate
                    );

                    updateFieldValueAndState(newStateItems);
                  }}
                  genericTemplateCreated={(newGenericTemplate) => {
                    const newStateItems = [...field.value, newGenericTemplate];

                    updateFieldValueAndState(newStateItems);
                  }}
                  genericTemplateEditDone={() => {
                    // refresh all genericTemplates
                    api()
                      .getGenericTemplatesWithQuestionaryStatus({
                        filter: {
                          questionId: answer.question.id,
                          proposalPk: state.proposal.primaryKey,
                        },
                      })
                      .then((result) => {
                        updateFieldValueAndState(result.genericTemplates);
                      });

                    setSelectedGenericTemplate(null);
                  }}
                  title={answer.question.question}
                ></GenericTemplateContainer>
              ) : (
                <UOLoader />
              )}
            </StyledModal>
          </div>
        );
      }}
    </Field>
  );
}

export default withConfirm(withPrompt(QuestionaryComponentGenericTemplate));
