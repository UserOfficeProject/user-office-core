import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import React, { useContext, useEffect, useState } from 'react';

import StyledModal from 'components/common/StyledModal';
import UOLoader from 'components/common/UOLoader';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { ProposalContext } from 'components/proposal/ProposalContainer';
import ProposalErrorLabel from 'components/proposal/ProposalErrorLabel';
import {
  QuestionaryStep,
  Sample,
  SampleStatus,
  SubtemplateConfig,
} from 'generated/sdk';
import { SampleBasic } from 'models/Sample';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import { QuestionariesList, QuestionariesListRow } from '../QuestionariesList';
import { SampleDeclarationContainer } from './SampleDeclarationContainer';

const sampleToListRow = (sample: SampleBasic): QuestionariesListRow => {
  return { id: sample.id, label: sample.title };
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

function QuestionaryComponentSampleDeclaration(props: BasicComponentProps) {
  const { answer: templateField, errors, onComplete } = props;
  const proposalQuestionId = templateField.question.proposalQuestionId;
  const config = templateField.config as SubtemplateConfig;
  const proposalContext = useContext(ProposalContext);

  const isError = errors[proposalQuestionId] ? true : false;

  const { api } = useDataApiWithFeedback();

  const [stateValue, setStateValue] = useState<number[]>(
    templateField.value || []
  ); // ids of samples
  const [rows, setRows] = useState<QuestionariesListRow[]>([]);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);

  useEffect(() => {
    const getSamples = async (
      proposalId: number,
      questionId: string
    ): Promise<SampleBasic[]> => {
      return api()
        .getSamples({ filter: { questionId, proposalId } })
        .then(response => {
          return response.samples || [];
        });
    };

    const proposalId = proposalContext.state?.proposal.id;
    const questionId = templateField.question.proposalQuestionId;

    if (proposalId && questionId) {
      getSamples(proposalId, questionId).then(samples =>
        setRows(samples.map(sampleToListRow))
      );
    }
  }, [templateField.question.proposalQuestionId, proposalContext.state, api]);

  return (
    <>
      <FormControl error={isError} required={config.required} fullWidth>
        <FormLabel error={isError}>{templateField.question.question}</FormLabel>
        <span>{config.small_label}</span>

        <QuestionariesList
          addButtonLabel={config.addEntryButtonLabel}
          data={rows}
          onEditClick={item =>
            api()
              .getSample({ sampleId: item.id })
              .then(response => {
                if (response.sample) {
                  setSelectedSample(response.sample);
                }
              })
          }
          onDeleteClick={item => {
            api()
              .deleteSample({ sampleId: item.id })
              .then(response => {
                if (!response.deleteSample.error) {
                  const newStateValue = stateValue.filter(
                    sampleId => sampleId !== item.id
                  );
                  setStateValue(newStateValue);
                  setRows(rows.filter(row => row.id !== item.id));
                  onComplete(null as any, newStateValue);
                }
              });
          }}
          onCloneClick={item => {
            api()
              .cloneSample({ sampleId: item.id })
              .then(response => {
                const clonedSample = response.cloneSample.sample;
                if (clonedSample) {
                  const newStateValue = [...stateValue, clonedSample.id];
                  setStateValue(newStateValue);
                  setRows([...rows, sampleToListRow(clonedSample)]);
                  onComplete(null as any, newStateValue);
                }
              });
          }}
          onAddNewClick={() => {
            const state = proposalContext.state;
            if (!state) {
              throw new Error('Sample Declaration is missing proposal context');
            }

            const proposalId = state.proposal.id;
            const questionId = props.answer.question.proposalQuestionId;
            if (proposalId <= 0 || !questionId) {
              throw new Error(
                'Sample Declaration is missing proposal id and/or proposalQuestionId'
              );
            }
            const templateId = config.templateId;
            api()
              .getBlankQuestionarySteps({ templateId })
              .then(result => {
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
        {isError && (
          <ProposalErrorLabel>{errors[proposalQuestionId]}</ProposalErrorLabel>
        )}
      </FormControl>
      <StyledModal
        onClose={() => setSelectedSample(null)}
        open={selectedSample !== null}
        data-cy="sample-declaration-modal"
      >
        {selectedSample ? (
          <SampleDeclarationContainer
            sample={selectedSample}
            sampleUpdated={updatedSample => {
              const index = rows.findIndex(
                sample => sample.id === updatedSample.id
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
            sampleCreated={newSample => {
              const newStateValue = [...stateValue, newSample.id];
              setStateValue(newStateValue);
              onComplete(null as any, newStateValue);

              const newRows = [...rows, sampleToListRow(newSample)];
              setRows(newRows);
            }}
            sampleEditDone={() => setSelectedSample(null)}
          ></SampleDeclarationContainer>
        ) : (
          <UOLoader />
        )}
      </StyledModal>
    </>
  );
}

export { QuestionaryComponentSampleDeclaration };
