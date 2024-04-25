import CloseIcon from '@mui/icons-material/Close';
import {
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import { IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import MultiMenuItem from 'components/common/MultiMenuItem';
import UOLoader from 'components/common/UOLoader';
import {
  CopyAnswerInput,
  GenericTemplatesFilter,
  GetGenericTemplatesWithProposalDataQuery,
  Maybe,
} from 'generated/sdk';
import { capitalize } from 'utils/helperFunctions';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type GenericTemplateSelectModalOnCopyProps = {
  close: () => void;
  filter: GenericTemplatesFilter;
  currentProposalPk: number;
  copyButtonLabel: Maybe<string>;
  question: string;
  isMultipleCopySelect: boolean;
  handleGenericTemplateOnCopy: (copyAnswersInput: CopyAnswerInput[]) => void;
};

type GenericTemplates =
  GetGenericTemplatesWithProposalDataQuery['genericTemplates'];

const GenericTemplateSelectModalOnCopy = ({
  close,
  filter,
  currentProposalPk,
  copyButtonLabel,
  question,
  isMultipleCopySelect = false,
  handleGenericTemplateOnCopy,
}: GenericTemplateSelectModalOnCopyProps) => {
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
  const [genericTemplates, setGenericTemplates] = useState<
    NonNullable<GenericTemplates>
  >([]);
  const [selectedProposalPk, setSelectedProposalPk] = useState<number>(0);

  const [genericTemplateAnswer, setGenericTemplateAnswer] = useState<string[]>(
    []
  );

  const getGenericTemplateAnswers = (): CopyAnswerInput[] => {
    const templateAnswers: CopyAnswerInput[] = [];
    if (genericTemplateAnswer && genericTemplates) {
      genericTemplateAnswer.map((tempvalue) => {
        const template = genericTemplates.find(
          (value) => value.id === +tempvalue
        );
        if (template) {
          templateAnswers.push({
            sourceQuestionaryId: template.questionaryId,
            title: template.title,
          });
        }
      });
    }

    return templateAnswers;
  };

  useEffect(() => {
    let unmounted = false;
    api()
      .getGenericTemplatesWithProposalData({
        filter,
      })
      .then((result) => {
        if (unmounted) {
          return;
        }
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

  const SelectMenuItem = isMultipleCopySelect ? MultiMenuItem : MenuItem;

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
        {copyButtonLabel || 'Copy'}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <div className={classes.selectorContainer}>
            <Autocomplete
              id="generic-template-proposal-select"
              aria-labelledby="generic-template-proposal-select-label"
              fullWidth={true}
              noOptionsText={capitalize(
                `No proposal(s) with matching ${question || 'answers(s)'}`
              )}
              disableClearable
              onChange={(_event, selectedValue) => {
                setGenericTemplateAnswer([]);
                setSelectedProposalPk(selectedValue.proposalPk);
              }}
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
              renderInput={(params) => (
                <TextField
                  {...params}
                  key={params.id}
                  data-cy="genericTemplateProposalTitle"
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

            <FormControl fullWidth disabled={selectedProposalPk ? false : true}>
              <InputLabel id="generic-template-answer-label">
                {question || 'Answer(s)'}
              </InputLabel>

              <Select
                labelId="generic-template-answer-select-label"
                id="generic-template-answer-select"
                data-cy="genericTemplateAnswers"
                multiple={isMultipleCopySelect}
                value={
                  isMultipleCopySelect
                    ? genericTemplateAnswer
                    : genericTemplateAnswer.length > 0
                      ? genericTemplateAnswer[0]
                      : ''
                }
                onChange={(event: SelectChangeEvent<string | string[]>) => {
                  if (Array.isArray(event.target.value)) {
                    setGenericTemplateAnswer(event.target.value);
                  } else {
                    setGenericTemplateAnswer([event.target.value]);
                  }
                }}
                renderValue={(selected) =>
                  Array.isArray(selected)
                    ? `${question || ''} selected(${selected.length})`
                    : genericTemplates.find((value) => value.id === +selected)
                        ?.title
                }
                MenuProps={{
                  variant: 'menu',
                }}
              >
                {genericTemplates
                  .filter((template) =>
                    selectedProposalPk
                      ? template.proposalPk === selectedProposalPk
                      : false
                  )
                  .map((option) => {
                    return (
                      <SelectMenuItem value={option.id} key={option.id}>
                        {option.title}
                      </SelectMenuItem>
                    );
                  })}
              </Select>
            </FormControl>
          </div>
        </Grid>
      </Grid>

      <div className={classes.buttonContainer}>
        {isExecutingCall && <UOLoader size="2em" />}
        <Button
          disabled={genericTemplateAnswer.length <= 0}
          data-cy="genericTemplateAnswerSaveButton"
          onClick={() => {
            close();
            const copyAnswersInput = getGenericTemplateAnswers();

            if (copyAnswersInput) {
              handleGenericTemplateOnCopy(copyAnswersInput);
            } else {
              enqueueSnackbar(
                capitalize(`No ${question || 'answer(s)'} selected`),
                {
                  variant: 'warning',
                }
              );
            }
          }}
        >
          Save
        </Button>
      </div>
    </Container>
  );
};

GenericTemplateSelectModalOnCopy.propTypes = {
  close: PropTypes.func.isRequired,
  filter: PropTypes.object.isRequired,
  currentProposalPk: PropTypes.number.isRequired,
  copyButtonLabel: PropTypes.string,
  question: PropTypes.string.isRequired,
  isMultipleCopySelect: PropTypes.bool.isRequired,
  handleGenericTemplateOnCopy: PropTypes.func.isRequired,
};

export default GenericTemplateSelectModalOnCopy;
