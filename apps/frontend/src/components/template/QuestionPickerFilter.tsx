import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import React, { ChangeEvent, useEffect, useState } from 'react';

import { getQuestionaryComponentDefinitions } from 'components/questionary/QuestionaryComponentRegistry';
import { DataType } from 'generated/sdk';

import { QuestionFilter } from './QuestionPicker';

interface QuestionPickerProps {
  onChange?: (filter: QuestionFilter) => void;
}

function QuestionPickerFilter({ onChange }: QuestionPickerProps) {
  const [filter, setFilter] = useState<QuestionFilter>({
    dataType: 'all',
    searchText: '',
  });
  const [debounceTimeout, setDebounceTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null); // timeout for searching only when keystrokes stop
  const questionDefs = getQuestionaryComponentDefinitions();

  useEffect(() => {
    // clear filter when the component is removed
    return () => onChange?.({ searchText: '', dataType: 'all' });
  }, [onChange]);

  return (
    <Paper
      data-cy="question-picker-filter"
      elevation={1}
      sx={(theme) => ({
        width: '100%',
        padding: theme.spacing(2),
        paddingBottom: 0,
        marginBottom: theme.spacing(2),
      })}
    >
      <FormControl
        fullWidth
        sx={(theme) => ({ marginBottom: theme.spacing(2) })}
      >
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
      <FormControl
        fullWidth
        sx={(theme) => ({ marginBottom: theme.spacing(2) })}
      >
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
