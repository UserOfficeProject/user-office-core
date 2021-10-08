import {
  Avatar,
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
import CheckIcon from '@material-ui/icons/Check';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { Field, FieldProps } from 'formik';
import React, { MouseEvent, useContext, useState } from 'react';

import BoxIcon from 'components/common/icons/BoxIcon';
import StyledModal from 'components/common/StyledModal';
import UOLoader from 'components/common/UOLoader';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { ProposalEsiContextType } from 'components/proposalEsi/ProposalEsiContainer';
import { QuestionaryContext } from 'components/questionary/QuestionaryContext';
import SampleEsiContainer from 'components/sampleEsi/SampleEsiContainer';
import { GetSampleEsiQuery } from 'generated/sdk';
import { SampleEsiWithQuestionary } from 'models/questionary/sampleEsi/SampleEsiWithQuestionary';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

function QuestionaryComponentProposalEsiBasis(props: BasicComponentProps) {
  const { answer } = props;
  const answerId = answer.question.id;
  const { state } = useContext(QuestionaryContext) as ProposalEsiContextType;
  const [selectedSampleEsi, setSelectedSampleEsi] = useState<
    GetSampleEsiQuery['sampleEsi']
  >(null);
  const { api } = useDataApiWithFeedback();

  return (
    <Field name={answerId}>
      {({ field, form }: FieldProps<SampleEsiWithQuestionary[]>) => {
        const declareEsi = (id: number) => {
          api()
            .createSampleEsi({
              esiId: state!.esi.id,
              sampleId: id,
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

        const allSamples = state?.esi.visit?.proposal.samples;
        const declaredEsis = field.value || [];

        return (
          <>
            <label>{answer.question.question}</label>
            <List dense={true}>
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
                          data-cy="add-sample-btn"
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
                          title="Remove"
                          onClick={(e: MouseEvent) => {
                            e.stopPropagation();
                            revokeEsi(sample.id);
                          }}
                        >
                          <DeleteIcon />
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
                  </ListItem>
                );
              })}
            </List>
            <Divider style={{ marginBottom: '12px' }} />
            <Typography variant="body1" align={'right'}>
              {`${declaredEsis.length ?? 0} of
              ${
                state?.esi.visit?.proposal.samples?.length ?? 0
              } samples selected`}
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
                  onCreate={(newSample) => {
                    form.setFieldValue(answerId, [...field.value, newSample]);
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

export default QuestionaryComponentProposalEsiBasis;
