import { FormControl, FormLabel } from '@material-ui/core';
import ModalWrapper from 'components/common/ModalWrapper';
import { Sample, SubtemplateConfig } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import React, { useEffect, useState } from 'react';
import { stringToNumericArray } from 'utils/ArrayUtils';
import useCallWithFeedback from 'utils/useCallWithFeedback';
import { BasicComponentProps } from '../IBasicComponentProps';
import ProposalErrorLabel from '../ProposalErrorLabel';
import SampleDeclarationEditor from '../SampleDeclarationEditor';
import { QuestionariesList, QuestionariesListRow } from './QuestionariesList';

export default function ProposalComponentSampleDeclaration(
  props: BasicComponentProps
) {
  const { templateField, errors, onComplete } = props;
  const proposalQuestionId = templateField.question.proposalQuestionId;
  const config = templateField.config as SubtemplateConfig;
  const isError = errors[proposalQuestionId] ? true : false;

  const { callWithFeedback } = useCallWithFeedback();
  const api = useDataApi();

  const [stateValue, setStateValue] = useState<string>(templateField.value);
  const [rows, setRows] = useState<QuestionariesListRow[]>([]);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);

  const sampleToQuestionaryListRow = (sample: Sample): QuestionariesListRow => {
    return { id: sample.id, label: sample.title };
  };

  useEffect(() => {
    const getSamples = async (answerId: number): Promise<Sample[]> => {
      return api()
        .getSamplesByAnswerId({ answerId })
        .then(response => {
          return response.samplesByAnswerId || [];
        });
    };

    if (templateField.answerId) {
      getSamples(templateField.answerId).then(samples =>
        setRows(samples.map(sampleToQuestionaryListRow))
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
            let newStateValue = stringToNumericArray(stateValue);
            newStateValue = newStateValue.filter(sample => sample !== item.id);
            setStateValue(newStateValue.join(','));

            let newSamples = rows.slice();
            newSamples = newSamples.filter(row => row.id !== item.id);
            setRows(newSamples);

            onComplete(null as any, newStateValue.join(','));
          }}
          onAddNewClick={() =>
            callWithFeedback(
              api()
                .createSample({
                  title: 'Untitled',
                  templateId: config.templateId,
                })
                .then(response => response.createSample)
            ).then(response => {
              const { sample: newSample } = response;
              if (newSample) {
                const newStateValue = stringToNumericArray(stateValue);
                newStateValue.push(newSample.id);
                setStateValue(newStateValue.join(','));

                const newSamples = rows.slice();
                newSamples.push(sampleToQuestionaryListRow(newSample));
                setRows(newSamples);

                setSelectedSample(newSample);

                onComplete(null as any, newStateValue.join(','));
              }
            })
          }
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
          <SampleDeclarationEditor
            sample={selectedSample!}
            sampleEditDone={updatedSample => {
              const index = rows.findIndex(
                sample => sample.id === updatedSample.id
              );
              const newRows = [...rows];
              newRows.splice(index, 1, {
                ...rows[index],
                ...sampleToQuestionaryListRow(updatedSample),
              });
              setRows(newRows);
              setSelectedSample(null);
            }}
          ></SampleDeclarationEditor>
        ) : null}
      </ModalWrapper>
    </>
  );
}
