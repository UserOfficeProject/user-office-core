import { FormControl, FormLabel } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { Questionary, SubtemplateConfig } from '../../../generated/sdk';
import { useDataApi } from '../../../hooks/useDataApi';
import { stringToNumericArray } from '../../../utils/ArrayUtils';
import ModalWrapper from '../../common/ModalWrapper';
import { SubquestionarySubmissionContainer } from '../../questionary/SubquestionarySubmissionContainer';
import { BasicComponentProps } from '../IBasicComponentProps';
import { ProposalErrorLabel } from '../ProposalErrorLabel';
import { QuestionariesList, QuestionariesListRow } from './QuestionariesList';

export default function ProposalComponentSampleDeclaration(
  props: BasicComponentProps
) {
  const { templateField, errors, onComplete } = props;
  const proposalQuestionId = templateField.question.proposalQuestionId;
  const config = templateField.config as SubtemplateConfig;
  const isError = errors[proposalQuestionId] ? true : false;

  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();

  //const [stateValue, setStateValue] = useState<Array<number>>([]);
  const [samples, setSamples] = useState<QuestionariesListRow[]>([]);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);

  const parseFieldValue = (value: number[] | string): number[] => {
    if (Array.isArray(value)) {
      return value;
    } else if (typeof value === 'string') {
      return stringToNumericArray(value, ',');
    } else {
      console.error(
        'Invalid datatype for ProposalComponentSubtemplate. Expected array or string'
      );
      return [];
    }
  };

  useEffect(() => {
    const newValue = props.templateField.value;
    const sampleIds = parseFieldValue(newValue);
    // ...
    setSamples(fetchedSamples);
  }, [props]);

  return (
    <>
      <FormControl error={isError} required={config.required} fullWidth>
        <FormLabel error={isError}>{templateField.question.question}</FormLabel>
        <span>{config.small_label}</span>

        <QuestionariesList
          addButtonLabel={config.addEntryButtonLabel}
          data={samples}
          onEditClick={item =>
            api()
              .getQuestionary({ questionaryId })
              .then(response => {
                if (!response.questionary) {
                  enqueueSnackbar(
                    'Error occurred while retrieving questionary',
                    {
                      variant: 'error',
                    }
                  );

                  return;
                }
                setSelectedSample(response.questionary);
              })
          }
          onDeleteClick={id =>
            // TODO make an API call deleteQuestionary()
            {
              const newValue = stateValue.slice();
              newValue.splice(
                newValue.findIndex(item => item === id),
                1
              );
              setStateValue(newValue);
              onComplete(null as any, newValue.join(',')); // convert [1,2,3,...] to "1,2,3,..." because GraphQL does not support arrays yet
            }
          }
          onAddNewClick={() =>
            api()
              .createQuestionary({ templateId: config.templateId })
              .then(response => {
                if (response.createQuestionary.error) {
                  enqueueSnackbar(response.createQuestionary.error, {
                    variant: 'error',
                  });

                  return;
                }
                const newQuestionaryId =
                  response.createQuestionary.questionary?.questionaryId;
                if (newQuestionaryId) {
                  const newValue = stateValue.slice();
                  newValue.push(newQuestionaryId);
                  setStateValue(newValue);

                  onComplete(null as any, newValue.join(','));
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
        <SubquestionarySubmissionContainer
          questionaryEditDone={() => setSelectedSample(null)}
          questionary={selectedSample!}
          title={templateField.question.question}
        />
      </ModalWrapper>
    </>
  );
}
