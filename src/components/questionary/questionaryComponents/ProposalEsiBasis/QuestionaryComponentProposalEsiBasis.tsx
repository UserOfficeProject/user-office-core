import {
  Avatar,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@material-ui/core';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import AddBox from '@material-ui/icons/AddBox';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { Field, FieldProps } from 'formik';
import React, { MouseEvent, useContext, useState } from 'react';

import BoxIcon from 'components/common/icons/BoxIcon';
import StyledModal from 'components/common/StyledModal';
import UOLoader from 'components/common/UOLoader';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { ProposalEsiContextType } from 'components/proposalEsi/ProposalEsiContainer';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import SampleEsiContainer from 'components/sampleEsi/SampleEsiContainer';
import {
  DataType,
  GetSampleEsiQuery,
  SampleDeclarationConfig,
} from 'generated/sdk';
import { getQuestionsByType } from 'models/questionary/QuestionaryFunctions';
import { SampleEsiWithQuestionary } from 'models/questionary/sampleEsi/SampleEsiWithQuestionary';
import { ButtonContainer } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';
import withPrompt, { WithPromptType } from 'utils/withPrompt';

function QuestionaryComponentProposalEsiBasis(
  props: BasicComponentProps & { prompt: WithPromptType } & {
    confirm: WithConfirmType;
  }
) {
  const { answer, prompt, confirm } = props;
  const answerId = answer.question.id;
  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as ProposalEsiContextType;
  const [selectedSampleEsi, setSelectedSampleEsi] =
    useState<GetSampleEsiQuery['sampleEsi']>(null);
  const { api } = useDataApiWithFeedback();

  if (!state) {
    throw new Error(createMissingContextErrorMessage());
  }

  return (
    <Field name={answerId}>
      {({ field, form }: FieldProps<SampleEsiWithQuestionary[]>) => {
        const declareEsi = (sampleId: number) => {
          api()
            .createSampleEsi({
              esiId: state!.esi.id,
              sampleId: sampleId,
            })
            .then((response) => {
              if (response.createSampleEsi?.esi) {
                form.setFieldValue(answerId, [
                  ...field.value,
                  response.createSampleEsi.esi,
                ]);
                setSelectedSampleEsi(response.createSampleEsi.esi);
              }
            });
        };

        const revokeEsi = (id: number) => {
          api()
            .deleteSampleEsi({
              esiId: state!.esi.id,
              sampleId: id,
            })
            .then((response) => {
              if (!response.deleteSampleEsi.rejection) {
                const newValue = field.value.filter(
                  (esi) => esi.sample.id !== id
                );
                form.setFieldValue(answerId, newValue);
              }
            });
        };

        const openEsi = async (id: number) => {
          await api()
            .updateSampleEsi({
              esiId: state!.esi.id,
              sampleId: id,
              isSubmitted: false,
            })
            .then((response) => {
              const updatedEsi = response.updateSampleEsi.esi;
              if (updatedEsi) {
                setSelectedSampleEsi(updatedEsi);
                const newValue = field.value.map((esi) =>
                  esi.sampleId === updatedEsi.sampleId ? updatedEsi : esi
                );
                form.setFieldValue(answerId, newValue);
              }
            });
        };

        const addNewSample = async (title: string) => {
          const sampleQuestions = getQuestionsByType(
            state.esi.proposal.questionary.steps,
            DataType.SAMPLE_DECLARATION
          );

          const sampleQuestion = sampleQuestions[0];

          const result = await api().createSample({
            title: title,
            templateId: (sampleQuestion.config as SampleDeclarationConfig)
              .templateId!,
            proposalPk: state.esi.proposal.primaryKey,
            questionId: sampleQuestion.question.id,
            isPostProposalSubmission: true,
          });

          const sample = result.createSample.sample;

          if (sample !== null) {
            dispatch({ type: 'ESI_SAMPLE_CREATED', sample: sample });
            declareEsi(sample.id);
          }
        };

        const deleteSample = async (sampleId: number) => {
          await api()
            .deleteSample({
              sampleId: sampleId,
            })
            .then((response) => {
              const deletedSample = response.deleteSample.sample;
              if (deletedSample) {
                dispatch({
                  type: 'ESI_SAMPLE_DELETED',
                  sampleId: deletedSample.id,
                });
              }
            });
        };

        const allSamples = state?.esi?.proposal.samples;
        const declaredEsis = field.value || [];

        return (
          <>
            <label>{answer.question.question}</label>
            <List dense={true} data-cy="sample-esi-list">
              {allSamples?.map((sample) => {
                const esi = declaredEsis.find(
                  (curEsi) => curEsi.sampleId === sample.id
                );
                const hasDeclaredEsi = esi !== undefined;
                const isDeclarationComplete = esi?.isSubmitted;

                return (
                  <ListItem key={sample.id}>
                    <ListItemAvatar>
                      <Avatar>
                        <BoxIcon
                          htmlColor={
                            isDeclarationComplete
                              ? 'green'
                              : hasDeclaredEsi
                              ? 'red'
                              : 'inherit'
                          }
                        />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={sample.title}
                      secondary={
                        isDeclarationComplete
                          ? 'Ready'
                          : hasDeclaredEsi
                          ? 'Unfinished declaration'
                          : ''
                      }
                    />
                    {!hasDeclaredEsi && (
                      <ListItemIcon>
                        <IconButton
                          edge="end"
                          title="Add"
                          data-cy="add-esi-btn"
                          onClick={(e: MouseEvent) => {
                            e.stopPropagation();
                            declareEsi(sample.id);
                          }}
                        >
                          <AddBox />
                        </IconButton>
                      </ListItemIcon>
                    )}

                    {hasDeclaredEsi && (
                      <ListItemIcon>
                        <IconButton
                          edge="end"
                          title="Remove ESI"
                          data-cy="delete-esi-btn"
                          onClick={(e: MouseEvent) => {
                            e.stopPropagation();
                            confirm(
                              async () => {
                                revokeEsi(sample.id);
                              },
                              {
                                title: 'Are you sure',
                                description: `Are you sure you want to delete ESI for "${sample.title}"`,
                              }
                            )();
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </ListItemIcon>
                    )}

                    {hasDeclaredEsi && (
                      <ListItemIcon>
                        <IconButton
                          edge="end"
                          title="Edit"
                          onClick={(e: MouseEvent) => {
                            e.stopPropagation();
                            openEsi(sample.id);
                          }}
                        >
                          {isDeclarationComplete ? <CheckIcon /> : <EditIcon />}
                        </IconButton>
                      </ListItemIcon>
                    )}

                    {!hasDeclaredEsi && sample.isPostProposalSubmission && (
                      <ListItemIcon>
                        <IconButton
                          edge="end"
                          title="Delete sample"
                          data-cy="delete-sample-btn"
                          onClick={(e: MouseEvent) => {
                            e.stopPropagation();
                            confirm(
                              async () => {
                                deleteSample(sample.id);
                              },
                              {
                                title: 'Are you sure',
                                description: `Are you sure you want to delete sample "${sample.title}"`,
                              }
                            )();
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemIcon>
                    )}
                  </ListItem>
                );
              })}
            </List>
            <ButtonContainer>
              <Button
                onClick={() =>
                  prompt(
                    async (title) => {
                      addNewSample(title);
                    },
                    { question: 'Name of the sample' }
                  )()
                }
                variant="outlined"
                data-cy="add-sample-btn"
                size="small"
                color="primary"
                startIcon={<AddCircleOutlineIcon />}
              >
                Add sample
              </Button>
            </ButtonContainer>
            <Divider style={{ margin: '12px 0' }} />
            <Typography variant="body1" align={'right'}>
              {`${declaredEsis.length ?? 0} of
              ${state?.esi?.proposal.samples?.length ?? 0} samples selected`}
            </Typography>
            <StyledModal
              onClose={() => setSelectedSampleEsi(null)}
              open={selectedSampleEsi !== null}
              data-cy="sample-esi-modal"
            >
              {selectedSampleEsi ? (
                <SampleEsiContainer
                  esi={selectedSampleEsi}
                  onUpdate={(updatedSampleEsi) => {
                    const newValue = field.value.map((sampleEsi) =>
                      sampleEsi.sampleId === updatedSampleEsi.sampleId
                        ? updatedSampleEsi
                        : sampleEsi
                    );

                    form.setFieldValue(answerId, newValue);
                  }}
                  onSubmitted={() => {
                    // refresh all samples
                    api()
                      .getEsi({ esiId: state!.esi.id })
                      .then((result) => {
                        form.setFieldValue(answerId, result.esi?.sampleEsis);
                      });

                    setSelectedSampleEsi(null);
                  }}
                ></SampleEsiContainer>
              ) : (
                <UOLoader />
              )}
            </StyledModal>
          </>
        );
      }}
    </Field>
  );
}

export default withConfirm(withPrompt(QuestionaryComponentProposalEsiBasis));
