import { DialogContent } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import { Field, FieldProps } from 'formik';
import React, { useContext, useState } from 'react';

import ErrorMessage from 'components/common/ErrorMessage';
import StyledDialog from 'components/common/StyledDialog';
import UOLoader from 'components/common/UOLoader';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { ProposalContextType } from 'components/proposal/ProposalContainer';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import {
  CopyAnswerInput,
  QuestionaryStep,
  SubTemplateConfig,
} from 'generated/sdk';
import { GenericTemplateCore } from 'models/questionary/genericTemplate/GenericTemplateCore';
import { GenericTemplateWithQuestionary } from 'models/questionary/genericTemplate/GenericTemplateWithQuestionary';
import { GENERIC_TEMPLATE_EVENT } from 'models/questionary/QuestionarySubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';
import withPrompt, { WithPromptType } from 'utils/withPrompt';

import { GenericTemplateContainer } from './GenericTemplateContainer';
import GenericTemplateSelectModalOnCopy from './GenericTemplateSelectModalOnCopy';
import {
  QuestionnairesList,
  QuestionnairesListRow,
} from '../QuestionnairesList';

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

  const [selectedGenericTemplate, setSelectedGenericTemplate] =
    useState<GenericTemplateWithQuestionary | null>(null);
  const [
    openGenericTemplateSelectionOnCopyModal,
    setOpenGenericTemplateSelectionOnCopyModal,
  ] = useState(false);
  if (!state) {
    throw new Error(createMissingContextErrorMessage());
  }

  return (
    <Field name={answerId}>
      {({ field, form }: FieldProps<GenericTemplateWithQuestionary[]>) => {
        const updateFieldValueAndState = (
          updatedItems: GenericTemplateCore[] | null,
          dispatchType: GENERIC_TEMPLATE_EVENT
        ) => {
          if (
            dispatchType === GENERIC_TEMPLATE_EVENT.ITEMS_DELETED &&
            updatedItems
          )
            form.setFieldValue(
              answerId,
              field.value.filter((genericTemplate) => {
                return !updatedItems.some((value) => {
                  return value.id === genericTemplate.id;
                });
              })
            );
          else {
            form.setFieldValue(answerId, updatedItems);
          }
          dispatch({
            type: dispatchType,
            id: answerId,
            newItems: updatedItems,
          });
        };
        const createGenericTemplate = () => {
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
        };
        const copyGenericTemplate = (id: number, title: string) =>
          api()
            .cloneGenericTemplate({ genericTemplateId: id, title: title })
            .then((response) => {
              const clonedGenericTemplate = response.cloneGenericTemplate;
              if (clonedGenericTemplate) {
                const newStateItems = [...field.value, clonedGenericTemplate];

                updateFieldValueAndState(
                  newStateItems,
                  GENERIC_TEMPLATE_EVENT.ITEMS_MODIFIED
                );
              }
            });

        const deleteGenericTemplate = (id: number) => {
          const deletedStateItems = field.value.filter(
            (genericTemplate) => genericTemplate.id === id
          );

          updateFieldValueAndState(
            deletedStateItems,
            GENERIC_TEMPLATE_EVENT.ITEMS_DELETED
          );
        };

        const createGenericTemplateWithCopiedAnswers = (
          copyAnswersInput: CopyAnswerInput[]
        ) => {
          if (!state) {
            throw new Error(
              'GenericTemplate declaration is missing proposal context'
            );
          }

          const proposalPk = state.proposal.primaryKey;
          const questionId = answer.question.id;
          if (proposalPk <= 0 || !questionId) {
            throw new Error(
              'GenericTemplate is missing proposal id and/or question id'
            );
          }
          const templateId = config.templateId;
          if (!templateId) {
            throw new Error('GenericTemplate is missing templateId');
          }

          if (!copyAnswersInput) {
            throw new Error(
              'GenericTemplate is missing source questionary information'
            );
          }
          api()
            .createGenericTemplateWithCopiedAnswers({
              templateId,
              proposalPk,
              questionId,
              copyAnswersInput,
            })
            .then((response) => {
              const { createGenericTemplateWithCopiedAnswers } = response;
              if (createGenericTemplateWithCopiedAnswers) {
                updateFieldValueAndState(
                  [...createGenericTemplateWithCopiedAnswers],
                  GENERIC_TEMPLATE_EVENT.ITEMS_MODIFIED
                );
              }
            });
        };

        return (
          <div>
            <InputLabel
              sx={{ opacity: 0.54, fontWeight: 400, fontSize: '1rem' }}
            >
              {answer.question.question}
            </InputLabel>
            <QuestionnairesList
              addButtonLabel={config.addEntryButtonLabel}
              copyButtonLabel={config.copyButtonLabel || undefined}
              canCopy={config.canCopy}
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
                  title: 'Clone the template',
                  question: 'Title',
                  prefilledAnswer: `Copy of ${item.label}`,
                  okBtnLabel: 'Clone',
                })();
              }}
              onAddNewClick={() => createGenericTemplate()}
              onCopyClick={() =>
                setOpenGenericTemplateSelectionOnCopyModal(true)
              }
              {...props}
            />

            <ErrorMessage name={answerId} />

            <StyledDialog
              onClose={() => {
                const newStateItems = field.value.map((genericTemplate) =>
                  genericTemplate.id === selectedGenericTemplate?.id
                    ? selectedGenericTemplate
                    : genericTemplate
                );

                updateFieldValueAndState(
                  newStateItems,
                  GENERIC_TEMPLATE_EVENT.ITEMS_MODIFIED
                );

                if (
                  state.deletedTemplates.length === 0 &&
                  state.createdTemplates.length === 0
                ) {
                  dispatch({ type: 'CLEAN_DIRTY_STATE' });
                }
                setSelectedGenericTemplate(null);
              }}
              open={selectedGenericTemplate !== null}
              data-cy="genericTemplate-declaration-modal"
            >
              <DialogContent>
                {selectedGenericTemplate ? (
                  <GenericTemplateContainer
                    genericTemplate={selectedGenericTemplate}
                    genericTemplateUpdated={(updatedGenericTemplate) => {
                      const newStateItems = field.value.map(
                        (genericTemplate) =>
                          genericTemplate.id === updatedGenericTemplate.id
                            ? updatedGenericTemplate
                            : genericTemplate
                      );

                      updateFieldValueAndState(
                        newStateItems,
                        GENERIC_TEMPLATE_EVENT.ITEMS_MODIFIED
                      );
                    }}
                    genericTemplateCreated={(newGenericTemplate) => {
                      const newStateItems = [
                        ...field.value,
                        newGenericTemplate,
                      ];

                      updateFieldValueAndState(
                        newStateItems,
                        GENERIC_TEMPLATE_EVENT.ITEMS_MODIFIED
                      );
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
                          updateFieldValueAndState(
                            result.genericTemplates,
                            GENERIC_TEMPLATE_EVENT.ITEMS_MODIFIED
                          );
                        });

                      setSelectedGenericTemplate(null);
                    }}
                    title={answer.question.question}
                  ></GenericTemplateContainer>
                ) : (
                  <UOLoader />
                )}
              </DialogContent>
            </StyledDialog>
            {openGenericTemplateSelectionOnCopyModal && (
              <StyledDialog
                aria-labelledby="generic-template-selection-on-copy-modal-label"
                aria-describedby="generic-template-selection-on-copy-modal"
                open={openGenericTemplateSelectionOnCopyModal}
                onClose={(): void =>
                  setOpenGenericTemplateSelectionOnCopyModal(false)
                }
                title={config.copyButtonLabel || 'Copy Sub Template'}
                fullWidth
                maxWidth="sm"
              >
                <DialogContent dividers>
                  <GenericTemplateSelectModalOnCopy
                    close={(): void =>
                      setOpenGenericTemplateSelectionOnCopyModal(false)
                    }
                    filter={{
                      questionId: answerId,
                    }}
                    currentProposalPk={state.proposal.primaryKey}
                    isMultipleCopySelect={config.isMultipleCopySelect || false}
                    question={answer.question.question}
                    handleGenericTemplateOnCopy={(
                      copyAnswersInput: CopyAnswerInput[]
                    ) =>
                      createGenericTemplateWithCopiedAnswers(copyAnswersInput)
                    }
                  />
                </DialogContent>
              </StyledDialog>
            )}
          </div>
        );
      }}
    </Field>
  );
}

export default withConfirm(withPrompt(QuestionaryComponentGenericTemplate));
