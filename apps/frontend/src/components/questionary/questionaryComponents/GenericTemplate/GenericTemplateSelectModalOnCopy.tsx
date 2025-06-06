import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import MultiMenuItem from 'components/common/MultiMenuItem';
import UOLoader from 'components/common/UOLoader';
import {
  CopyAnswerInput,
  GenericTemplatesFilter,
  GetGenericTemplatesOnCopyQuery,
  Maybe,
} from 'generated/sdk';
import { capitalize } from 'utils/helperFunctions';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type GenericTemplateSelectModalOnCopyProps = {
  close: () => void;
  filter: GenericTemplatesFilter;
  currentProposalPk: number;
  copyButtonLabel?: Maybe<string>;
  question: string;
  isMultipleCopySelect: boolean;
  handleGenericTemplateOnCopy: (copyAnswersInput: CopyAnswerInput[]) => void;
};

type GenericTemplateCopy =
  GetGenericTemplatesOnCopyQuery['genericTemplatesOnCopy'];

const GenericTemplateSelectModalOnCopy = ({
  close,
  filter,
  currentProposalPk,
  copyButtonLabel,
  question,
  isMultipleCopySelect = false,
  handleGenericTemplateOnCopy,
}: GenericTemplateSelectModalOnCopyProps) => {
  const theme = useTheme();
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { enqueueSnackbar } = useSnackbar();
  const [genericTemplates, setGenericTemplates] = useState<
    NonNullable<GenericTemplateCopy>
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
      .getGenericTemplatesOnCopy({})
      .then((result) => {
        if (unmounted) {
          return;
        }
        if (result.genericTemplatesOnCopy) {
          setGenericTemplates(
            result.genericTemplatesOnCopy.filter(
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
    <>
      {copyButtonLabel && (
        <Typography
          variant="h6"
          component="h1"
          sx={{
            textAlign: 'center',
            fontSize: '18px',
          }}
        >
          {copyButtonLabel || 'Copy'}
        </Typography>
      )}

      <Box
        sx={{
          minWidth: '100%',
        }}
      >
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
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'right',
          marginTop: theme.spacing(3),
        }}
      >
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
      </Box>
    </>
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
