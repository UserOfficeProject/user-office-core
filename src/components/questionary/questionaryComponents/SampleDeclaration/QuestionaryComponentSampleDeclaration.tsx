import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { FormikProps } from 'formik';
import React, { useContext, useEffect, useState } from 'react';

import StyledModal from 'components/common/StyledModal';
import UOLoader from 'components/common/UOLoader';
import { ProposalContextType } from 'components/proposal/ProposalContainer';
import ProposalErrorLabel from 'components/proposal/ProposalErrorLabel';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import {
  Answer,
  QuestionaryStep,
  Sample,
  SampleStatus,
  SubtemplateConfig,
} from 'generated/sdk';
import { SampleBasic } from 'models/Sample';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import {
  QuestionnairesList,
  QuestionnairesListRow,
} from '../QuestionnairesList';
import { SampleDeclarationContainer } from './SampleDeclarationContainer';

const sampleToListRow = (sample: SampleBasic): QuestionnairesListRow => {
  return {
    id: sample.id,
    label: sample.title,
    isCompleted: !!sample.questionary?.steps.every((step) => step.isCompleted),
  };
};

function createSampleStub(
  templateId: number,
  questionarySteps: QuestionaryStep[],
  proposalId: number,
  questionId: string
): Sample {
  return {
    id: 0,
    created: new Date(),
    creatorId: 0,
    questionary: {
      questionaryId: 0,
      templateId: templateId,
      created: new Date(),
      steps: questionarySteps,
    },
    questionId: questionId,
    questionaryId: 0,
    safetyComment: '',
    safetyStatus: SampleStatus.PENDING_EVALUATION,
    title: '',
    proposalId: proposalId,
  };
}

type QuestionaryComponentSampleDeclarationProps = {
  answer: Answer;
  formikProps: FormikProps<Record<string, unknown>>;
  onComplete: (newValue: Answer['value']) => void;
  confirm: WithConfirmType;
};

function QuestionaryComponentSampleDeclaration(
  props: QuestionaryComponentSampleDeclarationProps
) {
  const {
    answer,
    onComplete,
    confirm,
    formikProps: { errors },
  } = props;
  const id = answer.question.id;
  const config = answer.config as SubtemplateConfig;
  const { state } = useContext(QuestionaryContext) as ProposalContextType;

  const isError = errors[id] ? true : false;

  const { api } = useDataApiWithFeedback();

  const [stateValue, setStateValue] = useState<number[]>(answer.value || []); // ids of samples
  const [rows, setRows] = useState<QuestionnairesListRow[]>([]);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const copySample = (id: number) =>
    api()
      .cloneSample({ sampleId: id })
      .then((response) => {
        const clonedSample = response.cloneSample.sample;
        if (clonedSample) {
          const newStateValue = [...stateValue, clonedSample.id];
          setStateValue(newStateValue);
          setRows([...rows, sampleToListRow(clonedSample)]);
          onComplete(newStateValue);
        }
      });
  const deleteSample = (id: number) =>
    api()
      .deleteSample({ sampleId: id })
      .then((response) => {
        if (!response.deleteSample.error) {
          const newStateValue = stateValue.filter(
            (sampleId) => sampleId !== id
          );
          setStateValue(newStateValue);
          setRows(rows.filter((row) => row.id !== id));
          onComplete(newStateValue);
        }
      });
  useEffect(() => {
    const getSamples = async (
      proposalId: number,
      questionId: string
    ): Promise<SampleBasic[]> => {
      return api()
        .getSamples({ filter: { questionId, proposalId } })
        .then((response) => {
          return response.samples || [];
        });
    };

    const proposalId = state?.proposal.id;
    const questionId = answer.question.id;

    if (proposalId && questionId) {
      getSamples(proposalId, questionId).then((samples) =>
        setRows(samples.map(sampleToListRow))
      );
    }
  }, [answer.question.id, state, api]);

  if (!state) {
    throw new Error(createMissingContextErrorMessage());
  }

  return (
    <>
      <FormControl
        error={isError}
        required={config.required}
        fullWidth
        margin="dense"
      >
        <FormLabel>
          {answer.question.question}
          {config.small_label && (
            <>
              <br />
              <small>{config.small_label}</small>
            </>
          )}
        </FormLabel>

        <QuestionnairesList
          addButtonLabel={config.addEntryButtonLabel}
          data={rows}
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
            confirm(() => copySample(item.id), {
              title: 'Copy Sample',
              description:
                'This action will copy the sample and all data associated with it',
            })();
          }}
          onAddNewClick={() => {
            if (!state) {
              throw new Error('Sample Declaration is missing proposal context');
            }

            const proposalId = state.proposal.id;
            const questionId = props.answer.question.id;
            if (proposalId <= 0 || !questionId) {
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
                    proposalId,
                    questionId
                  );
                  setSelectedSample(sampleStub);
                }
              });
          }}
          {...props}
        />
        {isError && <ProposalErrorLabel>{errors[id]}</ProposalErrorLabel>}
      </FormControl>
      <StyledModal
        onClose={() => setSelectedSample(null)}
        open={selectedSample !== null}
        data-cy="sample-declaration-modal"
      >
        {selectedSample ? (
          <SampleDeclarationContainer
            sample={selectedSample}
            sampleUpdated={(updatedSample) => {
              const index = rows.findIndex(
                (sample) => sample.id === updatedSample.id
              );
              if (index === -1) {
                // unexpected
                return;
              }

              const newRows = [...rows];
              newRows.splice(index, 1, {
                ...rows[index],
                ...sampleToListRow(updatedSample),
              });
              setRows(newRows);
            }}
            sampleCreated={(newSample) => {
              const newStateValue = [...stateValue, newSample.id];
              setSelectedSample(newSample);
              setStateValue(newStateValue);
              onComplete(newStateValue);

              const newRows = [...rows, sampleToListRow(newSample)];
              setRows(newRows);
            }}
            sampleEditDone={() => {
              const index = rows.findIndex(
                (sample) => sample.id === selectedSample.id
              );

              if (index === -1) {
                // unexpected
                setSelectedSample(null);

                return;
              }
              const newRows = [...rows];
              newRows[index].isCompleted = true;
              setRows(newRows);
              setSelectedSample(null);
            }}
          ></SampleDeclarationContainer>
        ) : (
          <UOLoader />
        )}
      </StyledModal>
    </>
  );
}

export default withConfirm(QuestionaryComponentSampleDeclaration);
