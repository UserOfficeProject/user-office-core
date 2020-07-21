import { FormControl, FormLabel } from '@material-ui/core';
import ModalWrapper from 'components/common/ModalWrapper';
import { Sample, SubtemplateConfig } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { BasicComponentProps } from '../IBasicComponentProps';
import ProposalErrorLabel from '../ProposalErrorLabel';
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

  const [stateValue, setStateValue] = useState<number[]>([]);
  const [samples, setSamples] = useState<QuestionariesListRow[]>([]);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);

  useEffect(() => {
    const getSamples = async (answerId: number): Promise<Sample[]> => {
      return api()
        .getSamplesByAnswerId({ answerId })
        .then(response => {
          return response.samplesByAnswerId || [];
        });
    };

    const sampleToQuestionaryListRow = (
      sample: Sample
    ): QuestionariesListRow => {
      return { id: sample.id, label: sample.title };
    };

    if (props.templateField.answerId) {
      getSamples(props.templateField.answerId).then(samples =>
        setSamples(samples.map(sampleToQuestionaryListRow))
      );
    }
  }, [props]);

  return (
    <>
      <FormControl error={isError} required={config.required} fullWidth>
        <FormLabel error={isError}>{templateField.question.question}</FormLabel>
        <span>{config.small_label}</span>

        <QuestionariesList
          addButtonLabel={config.addEntryButtonLabel}
          data={samples}
          onEditClick={
            item => {}
            // api()
            //   .getQuestionary({ questionaryId:item.id })
            //   .then(response => {
            //     if (!response.questionary) {
            //       enqueueSnackbar(
            //         'Error occurred while retrieving questionary',
            //         {
            //           variant: 'error',
            //         }
            //       );

            //       return;
            //     }
            //     setSelectedSample(response.questionary || null);
            //   })
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
        {/* <SubquestionarySubmissionContainer
          questionaryEditDone={() => setSelectedSample(null)}
          questionary={selectedSample!}
          title={templateField.question.question}
        /> */}
      </ModalWrapper>
    </>
  );
}
