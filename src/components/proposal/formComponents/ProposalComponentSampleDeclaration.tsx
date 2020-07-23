import { FormControl, FormLabel } from '@material-ui/core';
import ModalWrapper from 'components/common/ModalWrapper';
import { Sample, SubtemplateConfig } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { BasicComponentProps } from '../IBasicComponentProps';
import ProposalErrorLabel from '../ProposalErrorLabel';
import SampleDeclarationEditor from '../SampleDeclarationEditor';
import { QuestionariesList, QuestionariesListRow } from './QuestionariesList';
import { stringToNumericArray } from 'utils/ArrayUtils';

export default function ProposalComponentSampleDeclaration(
  props: BasicComponentProps
) {
  const { templateField, errors, onComplete } = props;
  const proposalQuestionId = templateField.question.proposalQuestionId;
  const config = templateField.config as SubtemplateConfig;
  const isError = errors[proposalQuestionId] ? true : false;

  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();

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
          onDeleteClick={id => {}}
          // TODO make an API call deleteQuestionary()
          //   const newValue = stateValue.slice();
          //   newValue.splice(
          //     newValue.findIndex(item => item === id),
          //     1
          //   );
          //   setStateValue(newValue);
          //   onComplete(null as any, newValue.join(',')); // convert [1,2,3,...] to "1,2,3,..." because GraphQL does not support arrays yet
          // }
          onAddNewClick={() =>
            api()
              .createSample({
                title: 'Untitled',
                templateId: config.templateId,
              })
              .then(response => {
                const { sample: newSample, error } = response.createSample;
                if (error) {
                  enqueueSnackbar(error, { variant: 'error' });
                  return;
                }

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
