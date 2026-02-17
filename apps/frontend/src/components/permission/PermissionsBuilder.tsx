import { FormControl, InputLabel, MenuItem } from '@mui/material';
import { Button } from '@mui/material';
import { Select } from '@mui/material';
import { Stack, Box } from '@mui/system';
import React, { useState } from 'react';
import {
  Field,
  formatQuery,
  Operator,
  QueryBuilder,
  RuleGroupType,
} from 'react-querybuilder';

import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

export function PermissionsBuilder() {
  const { api } = useDataApiWithFeedback();

  const [subject, setSubject] = useState('user_officer');
  const [object, setObject] = useState('call');
  const [action, setAction] = useState('read');

  const fields: Field[] = [
    { name: 'call.shortCode', label: 'call.shortCode' },
    { name: 'call.tags', label: 'call.tags' },
    { name: 'isCallEnded', label: 'isCallEnded' },
  ];

  const operators: Operator[] = [
    {
      name: '=',
      label: '=',
    },
    {
      name: '!=',
      label: '!=',
    },
    {
      name: 'contains',
      label: 'contains',
    },
  ];

  const [query, setQuery] = useState<RuleGroupType>({
    combinator: 'and',
    rules: [{ field: 'call.tags', operator: 'contains', value: 'ISIS' }],
  });

  const handleCreatePolicy = async () => {
    const formattedQuery = formatQuery(query, 'json');

    await api({
      toastSuccessMessage: 'Policy created successfully',
    }).addCasbinPolicy({
      subject,
      object,
      action,
      condition: formattedQuery,
    });
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2}>
        <FormControl fullWidth>
          <InputLabel>Subject</InputLabel>
          <Select
            value={subject}
            label="Subject"
            onChange={(e) => setSubject(e.target.value)}
          >
            <MenuItem value="user_officer">user_officer</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Object</InputLabel>
          <Select
            value={object}
            label="Object"
            onChange={(e) => setObject(e.target.value)}
          >
            <MenuItem value="call">call</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Action</InputLabel>
          <Select
            value={action}
            label="Action"
            onChange={(e) => setAction(e.target.value)}
          >
            <MenuItem value="read">read</MenuItem>
            <MenuItem value="archive">archive</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Box>
        <QueryBuilder
          fields={fields}
          operators={operators}
          query={query}
          onQueryChange={setQuery}
        />
      </Box>

      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={handleCreatePolicy}
          disabled={query.rules.length === 0}
        >
          Create Policy
        </Button>
      </Box>
    </Stack>
  );
}
