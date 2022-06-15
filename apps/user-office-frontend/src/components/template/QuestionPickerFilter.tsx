import {
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { ChangeEvent, useEffect, useState } from 'react';

import { getQuestionaryComponentDefinitions } from 'components/questionary/QuestionaryComponentRegistry';
import { DataType } from 'generated/sdk';

import { QuestionFilter } from './QuestionPicker';

interface QuestionPickerProps {
  onChange?: (filter: QuestionFilter) => void;
}

const useStyles = makeStyles((theme) => ({
  container: {
    width: '100%',
    padding: theme.spacing(2),
    paddingBottom: 0,
    marginBottom: theme.spacing(2),
  },
  formItem: {
    marginBottom: theme.spacing(2),
  },
}));

function QuestionPickerFilter({ onChange }: QuestionPickerProps) {
  const [filter, setFilter] = useState<QuestionFilter>({
    dataType: 'all',
    searchText: '',
  });
  const [debounceTimeout, setDebounceTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null); // timeout for searching only when keystrokes stop
  const classes = useStyles();
  const questionDefs = getQuestionaryComponentDefinitions();

  useEffect(() => {
    // clear filter when the component is removed
    return () => onChange?.({ searchText: '', dataType: 'all' });
  }, [onChange]);

  return (
    <Paper
      data-cy="question-picker-filter"
      elevation={1}
      className={classes.container}
    >
      <FormControl fullWidth className={classes.formItem}>
        <TextField
          label="Question text"
          data-cy="search-text"
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const newFilter = {
              ...filter,
              searchText: event.target.value,
            };
            setFilter(newFilter);
            if (debounceTimeout) {
              clearTimeout(debounceTimeout);
            }
            setDebounceTimeout(
              setTimeout(() => {
                onChange?.(newFilter);
              }, 500)
            );
          }}
          autoFocus
        />
      </FormControl>
      <FormControl fullWidth className={classes.formItem}>
        <InputLabel shrink>Question type</InputLabel>
        <Select
          label="DataType"
          fullWidth
          onChange={(event) => {
            const newFilter = {
              ...filter,
              dataType: event.target.value as DataType,
            };
            setFilter(newFilter);
            onChange?.(newFilter);
          }}
          value={filter.dataType}
          data-cy="data-type"
        >
          <MenuItem key={'all'} value={'all'} selected>
            All
          </MenuItem>
          {questionDefs.map((definition) => (
            <MenuItem key={definition.dataType} value={definition.dataType}>
              {definition.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Paper>
  );
}

export default QuestionPickerFilter;
