import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FileCopy from '@mui/icons-material/FileCopy';
import {
  Button,
  Checkbox,
  DialogContent,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import { Field, FieldProps } from 'formik';
import React, { MouseEvent, useContext, useState } from 'react';

import ErrorMessage from 'components/common/ErrorMessage';
import BoxIcon from 'components/common/icons/BoxIcon';
import StyledDialog from 'components/common/StyledDialog';
import UOLoader from 'components/common/UOLoader';
import { ExperimentSafetyContextType } from 'components/experimentSafety/ExperimentSafetyContainer';
import SampleEsiContainer from 'components/experimentSample/ExperimentSampleContainer';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import {
  DataType,
  GetExperimentSampleQuery,
  SampleDeclarationConfig,
  SampleFragment,
} from 'generated/sdk';
import { ExperimentSampleWithQuestionary } from 'models/questionary/experimentSample/ExperimentSampleWithQuestionary';
import { getQuestionsByType } from 'models/questionary/QuestionaryFunctions';
import { StyledButtonContainer } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';
import withPrompt, { WithPromptType } from 'utils/withPrompt';

function QuestionaryComponentExperimentSafetyBasis(
  props: BasicComponentProps & { prompt: WithPromptType } & {
    confirm: WithConfirmType;
  }
) {
  const { answer, prompt, confirm } = props;
  const answerId = answer.question.id;
  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as ExperimentSafetyContextType;
  const [selectedExperimentSample, setSelectedExperimentSample] =
    useState<GetExperimentSampleQuery['experimentSample']>(null);
  const { api } = useDataApiWithFeedback();

  if (!state) {
    throw new Error(createMissingContextErrorMessage());
  }

  return (
    <Field name={answerId}>
      {({ field, form }: FieldProps<ExperimentSampleWithQuestionary[]>) => {
        const addSampleToExperiment = (sampleId: number) => {
          api()
            .addSampleToExperiment({
              experimentPk: state!.experimentSafety.experimentPk,
              sampleId: sampleId,
            })
            .then(({ addSampleToExperiment }) => {
              if (addSampleToExperiment) {
                dispatch({
                  type: 'SAMPLE_ADDED_TO_EXPERIMENT',
                  experimentSample: addSampleToExperiment,
                });
                setSelectedExperimentSample(addSampleToExperiment);
                form.setFieldValue(answerId, [
                  ...field.value,
                  addSampleToExperiment,
                ]);
              }
            });
        };

        const removeSampleFromExperiment = (sampleId: number) => {
          api()
            .removeSampleFromExperiment({
              experimentPk: state!.experimentSafety.experimentPk,
              sampleId: sampleId,
            })
            .then(({ removeSampleFromExperiment }) => {
              if (removeSampleFromExperiment) {
                dispatch({
                  type: 'SAMPLE_REMOVED_FROM_EXPERIMENT',
                  sampleId: removeSampleFromExperiment.sampleId,
                });

                // Refresh ESI list
                api()
                  .getExperimentSafety({
                    experimentSafetyPk:
                      state!.experimentSafety.experimentSafetyPk,
                  })
                  .then((result) => {
                    form.setFieldValue(
                      answerId,
                      result.experimentSafety?.samples
                    );
                  });
              }
            });
        };

        const createSample = async (title: string) => {
          const sampleQuestions = getQuestionsByType(
            state.experimentSafety.proposal.questionary.steps,
            DataType.SAMPLE_DECLARATION
          );

          const sampleQuestion = sampleQuestions[0];

          const result = await api().createSample({
            title: title,
            templateId: (sampleQuestion.config as SampleDeclarationConfig)
              .templateId!,
            proposalPk: state.experimentSafety.proposal.primaryKey,
            questionId: sampleQuestion.question.id,
            isPostProposalSubmission: true,
          });

          const sample = result.createSample;
          if (sample !== null) {
            dispatch({ type: 'SAMPLE_CREATED', sample: sample });
            addSampleToExperiment(sample.id);
          }
        };

        const deleteSample = async (sampleId: number) => {
          await api()
            .deleteSample({
              sampleId: sampleId,
            })
            .then((response) => {
              const deletedSample = response.deleteSample;
              if (deletedSample) {
                const newValue = field.value.filter(
                  (esi) => esi.sampleId !== deletedSample.id
                );
                dispatch({
                  type: 'SAMPLE_DELETED',
                  sampleId: deletedSample.id,
                });
                dispatch({
                  type: 'SAMPLE_REMOVED_FROM_EXPERIMENT',
                  sampleId: deletedSample.id,
                });
                form.setFieldValue(answerId, newValue);
              }
            });
        };

        const removeSampleFromExperimentConfirmation = async (
          sampleId: number
        ) => {
          confirm(
            () => {
              removeSampleFromExperiment(sampleId);
            },
            {
              title: 'Are you sure?',
              description:
                'Are you sure you want to deselect the sample? The information entered for the ESI will be lost!',
            }
          )();
        };

        const handleEditExperimentSampleClick = async (id: number) => {
          await api()
            .updateExperimentSample({
              sampleId: id,
              experimentPk: state!.experimentSafety.experimentPk,
              isSubmitted: false,
            })
            .then(({ updateExperimentSample }) => {
              if (updateExperimentSample) {
                setSelectedExperimentSample(updateExperimentSample);
                const newValue = field.value.map((esi) =>
                  esi.sampleId === updateExperimentSample.sampleId
                    ? updateExperimentSample
                    : esi
                );
                dispatch({
                  type: 'EXPERIMENT_SAMPLE_UPDATED',
                  experimentSample: updateExperimentSample,
                });
                form.setFieldValue(answerId, newValue);
              }
            });
        };

        const handleCloneSampleClick = async (
          sampleToClone: SampleFragment
        ) => {
          prompt(
            async (newTitle) => {
              await api()
                .cloneSample({
                  sampleId: sampleToClone.id,
                  title: newTitle,
                  isPostProposalSubmission: true,
                })
                .then((response) => {
                  const newSample = response.cloneSample;
                  if (newSample !== null) {
                    dispatch({ type: 'SAMPLE_CREATED', sample: newSample });
                  }
                });
            },
            {
              question: 'Sample title',
              prefilledAnswer: `Copy of ${sampleToClone.title}`,
            }
          )();
        };

        const handleCloneExperimentClick = async (
          sampleToClone: SampleFragment
        ) => {
          prompt(
            async (newTitle) => {
              await api()
                .cloneExperimentSample({
                  experimentPk: state.experimentSafety.experimentPk,
                  sampleId: sampleToClone.id,
                  newSampleTitle: newTitle,
                })
                .then(({ cloneExperimentSample }) => {
                  if (cloneExperimentSample !== null) {
                    dispatch({
                      type: 'SAMPLE_CREATED',
                      sample: cloneExperimentSample.sample,
                    });
                    dispatch({
                      type: 'SAMPLE_ADDED_TO_EXPERIMENT',
                      experimentSample: cloneExperimentSample,
                    });
                    form.setFieldValue(answerId, [
                      ...field.value,
                      cloneExperimentSample,
                    ]);
                  }
                });
            },
            {
              question: 'Sample title',
              prefilledAnswer: `Copy of ${sampleToClone.title}`,
            }
          )();
        };

        const allSamples = state?.experimentSafety?.proposal.samples;
        const declaredExperimentSamples = field.value || [];

        return (
          <>
            <label>{answer.question.question}</label>
            <List dense={true} data-cy="sample-esi-list">
              {allSamples?.map((sample) => {
                const declaredExperimentSample = declaredExperimentSamples.find(
                  (curEsi) => curEsi.sampleId === sample.id
                );
                const hasDeclaredEsi = declaredExperimentSample !== undefined;
                const isDeclarationComplete =
                  declaredExperimentSample?.isEsiSubmitted;

                return (
                  <ListItem key={sample.id}>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={hasDeclaredEsi}
                        onChange={(e) =>
                          e.target.checked
                            ? addSampleToExperiment(sample.id)
                            : removeSampleFromExperimentConfirmation(sample.id)
                        }
                        data-cy="select-sample-chk"
                      />
                    </ListItemIcon>
                    <ListItemIcon>
                      <BoxIcon
                        htmlColor={
                          isDeclarationComplete
                            ? 'green'
                            : hasDeclaredEsi
                              ? 'red'
                              : 'inherit'
                        }
                      />
                    </ListItemIcon>
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

                    {hasDeclaredEsi && (
                      <ListItemIcon>
                        <IconButton
                          edge="end"
                          title="Edit"
                          onClick={(e: MouseEvent) => {
                            e.stopPropagation();
                            handleEditExperimentSampleClick(sample.id);
                          }}
                          data-cy="edit-esi-btn"
                        >
                          <EditIcon />
                        </IconButton>
                      </ListItemIcon>
                    )}

                    {
                      <ListItemIcon>
                        <IconButton
                          edge="end"
                          title="Clone sample"
                          onClick={(e: MouseEvent) => {
                            e.stopPropagation();
                            hasDeclaredEsi
                              ? handleCloneExperimentClick(sample)
                              : handleCloneSampleClick(sample);
                          }}
                          data-cy="clone-sample-btn"
                        >
                          <FileCopy />
                        </IconButton>
                      </ListItemIcon>
                    }

                    {sample.isPostProposalSubmission && (
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
            <ErrorMessage name={answerId} />
            <StyledButtonContainer>
              <Button
                onClick={() =>
                  prompt(
                    async (title) => {
                      createSample(title);
                    },
                    {
                      question: 'Name of the sample',
                      title: 'Create New Sample',
                    }
                  )()
                }
                variant="outlined"
                data-cy="add-sample-btn"
                size="small"
                startIcon={<AddCircleOutlineIcon />}
              >
                Create new sample
              </Button>
            </StyledButtonContainer>
            <Divider style={{ margin: '12px 0' }} />
            <Typography variant="body1" align={'right'}>
              {`${declaredExperimentSamples.length ?? 0} of
              ${state?.experimentSafety?.proposal.samples?.length ?? 0} samples selected`}
            </Typography>
            <StyledDialog
              onClose={() => setSelectedExperimentSample(null)}
              open={selectedExperimentSample !== null}
              data-cy="sample-esi-modal"
              maxWidth="md"
              fullWidth
              title="Declare the Sample"
            >
              <DialogContent>
                {selectedExperimentSample ? (
                  <SampleEsiContainer
                    experimentSample={selectedExperimentSample}
                    onUpdate={(updatedExperimentSample) => {
                      const newValue = field.value.map((sampleEsi) =>
                        sampleEsi.sampleId === updatedExperimentSample.sampleId
                          ? updatedExperimentSample
                          : sampleEsi
                      );
                      dispatch({
                        type: 'EXPERIMENT_SAMPLE_UPDATED',
                        experimentSample: updatedExperimentSample,
                      });
                      form.setFieldValue(answerId, newValue);
                    }}
                    onSubmitted={() => {
                      // refresh all samples
                      api()
                        .getExperimentSafety({
                          experimentSafetyPk:
                            state!.experimentSafety.experimentSafetyPk,
                        })
                        .then((result) => {
                          form.setFieldValue(
                            answerId,
                            result.experimentSafety?.samples
                          );
                        });

                      setSelectedExperimentSample(null);
                    }}
                  ></SampleEsiContainer>
                ) : (
                  <UOLoader />
                )}
              </DialogContent>
            </StyledDialog>
          </>
        );
      }}
    </Field>
  );
}

export default withConfirm(
  withPrompt(QuestionaryComponentExperimentSafetyBasis)
);
