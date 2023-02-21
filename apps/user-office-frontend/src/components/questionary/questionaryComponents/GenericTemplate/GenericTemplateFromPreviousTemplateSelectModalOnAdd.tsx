import CloseIcon from '@mui/icons-material/Close';
import { Autocomplete, TextField } from '@mui/material';
import { IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import {
  GenericTemplatesFilter,
  GetGenericTemplatesWithProposalDataQuery,
} from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FlattenArrayType } from 'utils/utilTypes';

type GenericTemplateFromPreviousTemplateSelectModalOnAddProps = {
  close: () => void;
  filter: GenericTemplatesFilter;
  currentProposalPk: number;
  addButtonLabel: string;
  handleCreateGenericTemplateWithClonedAnswers: (
    title: string,
    sourceQuestionaryId: number
  ) => void;
};

type GenericTemplates =
  GetGenericTemplatesWithProposalDataQuery['genericTemplates'];

type GenericTemplateAnswer = FlattenArrayType<GenericTemplates>;

const GenericTemplateFromPreviousTemplateSelectModalOnAdd: React.FC<
  GenericTemplateFromPreviousTemplateSelectModalOnAddProps
> = ({
  close,
  filter,
  currentProposalPk,
  addButtonLabel,
  handleCreateGenericTemplateWithClonedAnswers,
}) => {
  const useStyles = makeStyles((theme) => ({
    mainContainer: {
      margin: theme.spacing(2, 0, 0),
      padding: theme.spacing(0, 1),
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    cardHeader: {
      textAlign: 'center',
      fontSize: '18px',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'right',
      marginTop: theme.spacing(3),
    },
    selectorContainer: {
      minWidth: '100%',
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      zIndex: '1',
    },
  }));
  const classes = useStyles();
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { enqueueSnackbar } = useSnackbar();
  const [genericTemplates, setGenericTemplates] =
    useState<GenericTemplates>(null);
  const [selectedProposalPk, setSelectedProposalPk] = useState<number | null>(
    null
  );

  const [genericTemplateAnswer, setGenericTemplateAnswer] =
    useState<GenericTemplateAnswer | null>(null);

  useEffect(() => {
    let unmounted = false;
    if (unmounted) {
      return;
    }
    api()
      .getGenericTemplatesWithProposalData({
        filter,
      })
      .then((result) => {
        if (result.genericTemplates) {
          setGenericTemplates(
            result.genericTemplates.filter(
              (value) => value.proposalPk !== currentProposalPk
            )
          );
        }
      });

    return () => {
      unmounted = true;
    };
  }, [api, currentProposalPk, filter]);

  return (
    <Container component="main" className={classes.mainContainer}>
      <IconButton
        data-cy="close-modal-btn"
        className={classes.closeButton}
        onClick={(): void => close()}
      >
        <CloseIcon />
      </IconButton>

      <Typography variant="h6" component="h1" className={classes.cardHeader}>
        {addButtonLabel
          ? `${addButtonLabel} From Previous`
          : 'Add From Previous'}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          {genericTemplates && (
            <div className={classes.selectorContainer}>
              <Autocomplete
                id="selectedProposalId"
                aria-labelledby="generic-template-proposal-select-label"
                fullWidth={true}
                noOptionsText="No proposal(s) with matching template"
                disableClearable
                onChange={(_event, selectedValue) =>
                  setSelectedProposalPk(selectedValue.proposalPk)
                }
                getOptionLabel={(option) => option.proposal.title}
                isOptionEqualToValue={(option, value) =>
                  option.proposalPk === value.proposalPk
                }
                options={genericTemplates.filter(
                  (template, index) =>
                    genericTemplates.findIndex(
                      (value) => value.proposalPk == template.proposalPk
                    ) === index
                )}
                data-cy="generic-template-proposal-select"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    key={params.id}
                    label="Proposal title"
                    placeholder="Select proposal title"
                  />
                )}
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option.proposalPk}>
                      {option.proposal.title}
                    </li>
                  );
                }}
                loading={isExecutingCall}
              />

              <Autocomplete
                id="selectedTemplateId"
                aria-labelledby="generic-template-select-label"
                fullWidth={true}
                noOptionsText="No matching template(s)"
                disableClearable
                onChange={(_event, newValue) =>
                  setGenericTemplateAnswer(newValue)
                }
                getOptionLabel={(option) => option.title}
                isOptionEqualToValue={(option, value) => {
                  return value.questionId === filter.questionId;
                }}
                options={genericTemplates.filter((template) =>
                  selectedProposalPk
                    ? template.proposalPk === selectedProposalPk
                    : false
                )}
                data-cy="generic-template-select"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Template title"
                    placeholder="Select template title"
                  />
                )}
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option.id}>
                      {option.title}
                    </li>
                  );
                }}
                loading={isExecutingCall}
              />
            </div>
          )}
        </Grid>
      </Grid>
      <div className={classes.buttonContainer}>
        <Button
          disabled={genericTemplateAnswer ? false : true}
          data-cy="generic-template-create-button"
          onClick={() => {
            close();
            if (genericTemplateAnswer) {
              handleCreateGenericTemplateWithClonedAnswers(
                genericTemplateAnswer.title,
                genericTemplateAnswer.questionaryId
              );
            } else {
              enqueueSnackbar('Template not selected', {
                variant: 'warning',
              });
            }
          }}
        >
          Save
        </Button>
      </div>
    </Container>
  );
};

GenericTemplateFromPreviousTemplateSelectModalOnAdd.propTypes = {
  close: PropTypes.func.isRequired,
};

export default GenericTemplateFromPreviousTemplateSelectModalOnAdd;
