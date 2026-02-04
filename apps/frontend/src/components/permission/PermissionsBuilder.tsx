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

import { useDataApi } from 'hooks/common/useDataApi';

export function PermissionsBuilder() {
  const api = useDataApi();

  const [subject, setSubject] = useState('user_officer');
  const [object, setObject] = useState('call');
  const [action, setAction] = useState('read');

  const fields: Field[] = [
    { name: 'call.shortCode', label: 'call.shortCode' },
    { name: 'call.tags', label: 'call.tags' },
    { name: 'user.facility', label: 'user.facility' },
  ];

  const operators: Operator[] = [
    {
      name: 'equals',
      label: '=',
    },
    {
      name: 'hasTag',
      label: 'has tag',
    },
  ];

  const [query, setQuery] = useState<RuleGroupType>({
    combinator: 'and',
    rules: [
      { field: 'user.facility', operator: '=', value: 'ISIS' },
      { field: 'call.shortCode', operator: '=', value: 'ISIS Direct 2026_2' },
      { field: 'call.tags', operator: 'hasTag', value: 'ISIS' },
    ],
  });

  const handleCreatePolicy = async () => {
    const formattedQuery = formatQuery(query, 'json');

    await api().addCasbinPolicy({
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
