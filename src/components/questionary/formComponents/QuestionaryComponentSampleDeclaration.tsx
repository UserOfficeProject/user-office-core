import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import React, { useEffect, useState } from 'react';

import ModalWrapper from 'components/common/ModalWrapper';
import {
  Answer,
  DataType,
  QuestionaryStep,
  Sample,
  SampleStatus,
  Sdk,
  SubtemplateConfig,
  TemplateCategoryId,
} from 'generated/sdk';
import { QuestionarySubmissionState } from 'models/QuestionarySubmissionState';
import { SampleBasic } from 'models/Sample';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import { BasicComponentProps } from '../../proposal/IBasicComponentProps';
import ProposalErrorLabel from '../../proposal/ProposalErrorLabel';
import { QuestionariesList, QuestionariesListRow } from './QuestionariesList';
import { SampleDeclarationContainer } from './SampleDeclarationContainer';

const sampleToListRow = (sample: SampleBasic): QuestionariesListRow => {
  return { id: sample.id, label: sample.title };
};

function createSampleStub(
  templateId: number,
  questionarySteps: QuestionaryStep[]
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
    questionaryId: 0,
    safetyComment: '',
    safetyStatus: SampleStatus.NONE,
    title: '',
  };
}

function QuestionaryComponentSampleDeclaration(props: BasicComponentProps) {
  const { templateField, errors, onComplete } = props;
  const proposalQuestionId = templateField.question.proposalQuestionId;
  const config = templateField.config as SubtemplateConfig;

  const isError = errors[proposalQuestionId] ? true : false;

  const { api } = useDataApiWithFeedback();

  const [stateValue, setStateValue] = useState<number[]>(
    templateField.value || []
  ); // ids of samples
  const [rows, setRows] = useState<QuestionariesListRow[]>([]);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);

  useEffect(() => {
    const getSamples = async (answerId: number): Promise<SampleBasic[]> => {
      return api()
        .getSamplesByAnswerId({ answerId })
        .then(response => {
          return response.samplesByAnswerId || [];
        });
    };

    if (templateField.answerId) {
      getSamples(templateField.answerId).then(samples =>
        setRows(samples.map(sampleToListRow))
      );
    }
  }, [templateField.answerId, api]);

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
            const newStateValue = stateValue.filter(
              sampleId => sampleId !== item.id
            );
            setStateValue(newStateValue);
            setRows(rows.filter(row => row.id !== item.id));
            onComplete(null as any, newStateValue);
          }}
          onCloneClick={item => {
            api()
              .cloneSample({ sampleId: item.id })
              .then(response => {
                const clonedSample = response.cloneSample.sample;
                if (clonedSample) {
                  const newStateValue = [...stateValue, clonedSample.id];
                  setRows([...rows, sampleToListRow(clonedSample)]);
                  onComplete(null as any, newStateValue);
                }
              });
          }}
          onAddNewClick={() => {
            const config = props.templateField.config as SubtemplateConfig;
            const templateId = config.templateId;
            api()
              .getBlankQuestionarySteps({ templateId })
              .then(result => {
                const blankSteps = result.blankQuestionarySteps;
                if (blankSteps) {
                  const sampleStub = createSampleStub(templateId, blankSteps);
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
      <ModalWrapper
        close={() => setSelectedSample(null)}
        isOpen={selectedSample !== null}
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
        ) : null}
      </ModalWrapper>
    </>
  );
}

function isSample(answer: Answer) {
  const { dataType, config } = answer.question;

  return (
    dataType === DataType.SUBTEMPLATE &&
    (config as SubtemplateConfig).templateCategory ===
      TemplateCategoryId.SAMPLE_DECLARATION
  );
}

async function sampleDeclarationPreSubmit(
  state: QuestionarySubmissionState,
  dispatch: React.Dispatch<Event>,
  api: Sdk
) {
  const sampleAnswers = state.steps[state.stepIndex].fields?.filter(isSample);
  if (!sampleAnswers) {
    return;
  }
  for (const sampleAnswer of sampleAnswers) {
    const sampleIds = sampleAnswer.value;
    if (sampleIds) {
      const { samples } = await api.getSamples({
        filter: { sampleIds: sampleAnswer.value },
      });
      if (samples) {
        await api.createAnswerQuestionaryRelations({
          answerId: sampleAnswer.answerId!,
          questionaryIds: samples.map(sample => sample.questionaryId),
        });
      }
    }
  }
}

export { QuestionaryComponentSampleDeclaration, sampleDeclarationPreSubmit };
