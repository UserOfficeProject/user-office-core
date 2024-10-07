import { DialogContent } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
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
  QuestionaryStep,
  SampleStatus,
  SubTemplateConfig,
} from 'generated/sdk';
import { SampleCore } from 'models/questionary/sample/SampleCore';
import { SampleWithQuestionary } from 'models/questionary/sample/SampleWithQuestionary';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';
import withPrompt, { WithPromptType } from 'utils/withPrompt';

import { SampleDeclarationContainer } from './SampleDeclarationContainer';
import {
  QuestionnairesList,
  QuestionnairesListRow,
} from '../QuestionnairesList';

const sampleToListRow = (sample: SampleCore): QuestionnairesListRow => {
  return {
    id: sample.id,
    label: sample.title,
    isCompleted: sample.questionary?.isCompleted ?? false,
  };
};

export function createSampleStub(
  templateId: number,
  questionarySteps: QuestionaryStep[],
  proposalPk: number,
  questionId: string
): SampleWithQuestionary {
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
    isPostProposalSubmission: false,
    safetyComment: '',
    safetyStatus: SampleStatus.PENDING_EVALUATION,
    title: '',
    proposalPk: proposalPk,
  };
}

function QuestionaryComponentSampleDeclaration(
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

  const [selectedSample, setSelectedSample] =
    useState<SampleWithQuestionary | null>(null);

  if (!state) {
    throw new Error(createMissingContextErrorMessage());
  }

  return (
    <Field name={answerId}>
      {({ field, form }: FieldProps<SampleWithQuestionary[]>) => {
        const updateFieldValueAndState = (
          updatedItems: SampleCore[] | null
        ) => {
          form.setFieldValue(answerId, updatedItems);
          dispatch({
            type: 'SAMPLE_DECLARATION_ITEMS_MODIFIED',
            id: answerId,
            newItems: updatedItems,
          });
        };

        const copySample = (id: number, title: string) =>
          api()
            .cloneSample({ sampleId: id, title: title })
            .then((response) => {
              const clonedSample = response.cloneSample;
              if (clonedSample) {
                const newStateItems = [...field.value, clonedSample];

                updateFieldValueAndState(newStateItems);
              }
            });

        const deleteSample = (id: number) =>
          api()
            .deleteSample({ sampleId: id })
            .then(() => {
              const newStateItems = field.value.filter(
                (sample) => sample.id !== id
              );

              updateFieldValueAndState(newStateItems);
            });

        return (
          <>
            <InputLabel
              sx={{ opacity: 0.54, fontWeight: 400, fontSize: '1rem' }}
            >
              {answer.question.question}
            </InputLabel>
            <Paper
              sx={(theme) => ({
                padding: '1rem',
                marginTop: theme.spacing(1),
              })}
            >
              <QuestionnairesList
                addButtonLabel={config.addEntryButtonLabel}
                data={field.value?.map(sampleToListRow) ?? []}
                maxEntries={config.maxEntries || undefined}
                onEditClick={(item) =>
                  api()
                    .getSample({ sampleId: item.id })
                    .then((response) => {
                      if (response.sample) {
                        setSelectedSample(response.sample);
                      }
                    })
                }
                onDeleteClick={(item) => {
                  confirm(() => deleteSample(item.id), {
                    title: 'Delete Sample',
                    description:
                      'This action will delete the sample and all data associated with it',
                  })();
                }}
                onCloneClick={(item) => {
                  prompt((answer) => copySample(item.id, answer), {
                    question: 'Title',
                    prefilledAnswer: `Copy of ${item.label}`,
                  })();
                }}
                onAddNewClick={() => {
                  // TODO move this into a function like copySample
                  if (!state) {
                    throw new Error(
                      'Sample Declaration is missing proposal context'
                    );
                  }

                  const proposalPk = state.proposal.primaryKey;
                  const questionId = props.answer.question.id;
                  if (proposalPk <= 0 || !questionId) {
                    throw new Error(
                      'Sample Declaration is missing proposal id and/or question id'
                    );
                  }
                  const templateId = config.templateId;

                  if (!templateId) {
                    throw new Error('Sample Declaration is missing templateId');
                  }

                  api()
                    .getBlankQuestionarySteps({ templateId })
                    .then((result) => {
                      const blankSteps = result.blankQuestionarySteps;
                      if (blankSteps) {
                        const sampleStub = createSampleStub(
                          templateId,
                          blankSteps,
                          proposalPk,
                          questionId
                        );
                        setSelectedSample(sampleStub);
                      }
                    });
                }}
                {...props}
              />

              <ErrorMessage name={answerId} />

              <StyledDialog
                onClose={() => setSelectedSample(null)}
                open={selectedSample !== null}
                data-cy="sample-declaration-modal"
                maxWidth="md"
                fullWidth
                title="Sample Declaration"
              >
                <DialogContent dividers>
                  {selectedSample ? (
                    <SampleDeclarationContainer
                      sample={selectedSample}
                      sampleUpdated={(updatedSample) => {
                        const newStateItems = field.value.map((sample) =>
                          sample.id === updatedSample.id
                            ? updatedSample
                            : sample
                        );

                        updateFieldValueAndState(newStateItems);
                      }}
                      sampleCreated={(newSample) => {
                        const newStateItems = [...field.value, newSample];

                        updateFieldValueAndState(newStateItems);
                      }}
                      sampleEditDone={() => {
                        // refresh all samples
                        api()
                          .getSamplesWithQuestionaryStatus({
                            filter: {
                              questionId: answer.question.id,
                              proposalPk: state.proposal.primaryKey,
                            },
                          })
                          .then((result) => {
                            updateFieldValueAndState(result.samples);
                          });

                        setSelectedSample(null);
                      }}
                    ></SampleDeclarationContainer>
                  ) : (
                    <UOLoader />
                  )}
                </DialogContent>
              </StyledDialog>
            </Paper>
          </>
        );
      }}
    </Field>
  );
}

export default withConfirm(withPrompt(QuestionaryComponentSampleDeclaration));
