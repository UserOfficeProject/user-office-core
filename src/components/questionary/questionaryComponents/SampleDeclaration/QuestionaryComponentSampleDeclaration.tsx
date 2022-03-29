import { Paper } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Field, FieldProps, FormikProps } from 'formik';
import React, { useContext, useState } from 'react';

import ErrorMessage from 'components/common/ErrorMessage';
import StyledModal from 'components/common/StyledModal';
import UOLoader from 'components/common/UOLoader';
import { ProposalContextType } from 'components/proposal/ProposalContainer';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import {
  Answer,
  QuestionaryStep,
  SampleStatus,
  SubTemplateConfig,
} from 'generated/sdk';
import { SampleCore } from 'models/questionary/sample/SampleCore';
import { SampleWithQuestionary } from 'models/questionary/sample/SampleWithQuestionary';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';
import withPrompt, { WithPromptType } from 'utils/withPrompt';

import {
  QuestionnairesList,
  QuestionnairesListRow,
} from '../QuestionnairesList';
import { SampleDeclarationContainer } from './SampleDeclarationContainer';

const useStyles = makeStyles((theme) => ({
  questionLabel: {
    opacity: 0.54,
    fontWeight: 400,
    fontSize: '1rem',
  },
  container: {
    padding: '1rem',
    marginTop: theme.spacing(1),
  },
}));
const sampleToListRow = (sample: SampleCore): QuestionnairesListRow => {
  return {
    id: sample.id,
    label: sample.title,
    isCompleted: sample.questionary?.isCompleted ?? false,
  };
};

function createSampleStub(
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

type QuestionaryComponentSampleDeclarationProps = {
  answer: Answer;
  formikProps: FormikProps<Record<string, unknown>>;
  confirm: WithConfirmType;
  prompt: WithPromptType;
};

function QuestionaryComponentSampleDeclaration(
  props: QuestionaryComponentSampleDeclarationProps
) {
  const { answer, confirm, prompt } = props;
  const answerId = answer.question.id;
  const config = answer.config as SubTemplateConfig;
  const { state } = useContext(QuestionaryContext) as ProposalContextType;

  const { api } = useDataApiWithFeedback();
  const classes = useStyles();

  const [selectedSample, setSelectedSample] =
    useState<SampleWithQuestionary | null>(null);

  if (!state) {
    throw new Error(createMissingContextErrorMessage());
  }

  return (
    <Field name={answerId}>
      {({ field, form }: FieldProps<SampleWithQuestionary[]>) => {
        const copySample = (id: number, title: string) =>
          api()
            .cloneSample({ sampleId: id, title: title })
            .then((response) => {
              const clonedSample = response.cloneSample.sample;
              if (clonedSample) {
                form.setFieldValue(answerId, [...field.value, clonedSample]);
              }
            });

        const deleteSample = (id: number) =>
          api()
            .deleteSample({ sampleId: id })
            .then((response) => {
              if (!response.deleteSample.rejection) {
                const newStateValue = field.value.filter(
                  (sample) => sample.id !== id
                );
                form.setFieldValue(answerId, newStateValue);
              }
            });

        return (
          <>
            <label className={classes.questionLabel}>
              {answer.question.question}
            </label>
            <Paper className={classes.container}>
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

              <StyledModal
                onClose={() => setSelectedSample(null)}
                open={selectedSample !== null}
                data-cy="sample-declaration-modal"
              >
                {selectedSample ? (
                  <SampleDeclarationContainer
                    sample={selectedSample}
                    sampleUpdated={(updatedSample) => {
                      const newValue = field.value.map((sample) =>
                        sample.id === updatedSample.id ? updatedSample : sample
                      );

                      form.setFieldValue(answerId, newValue);
                    }}
                    sampleCreated={(newSample) => {
                      form.setFieldValue(answerId, [...field.value, newSample]);
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
                          form.setFieldValue(answerId, result.samples);
                        });

                      setSelectedSample(null);
                    }}
                  ></SampleDeclarationContainer>
                ) : (
                  <UOLoader />
                )}
              </StyledModal>
            </Paper>
          </>
        );
      }}
    </Field>
  );
}

export default withConfirm(withPrompt(QuestionaryComponentSampleDeclaration));
