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

import UOLoader from 'components/common/UOLoader';
import { ResourceType } from 'generated/sdk';
import { useAuthResourceMetadata } from 'hooks/permission/useAuthResourceMetadata';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

export function PermissionsBuilder() {
  const { api } = useDataApiWithFeedback();

  const [subject, setSubject] = useState('user_officer');
  const [resource, setResource] = useState<ResourceType>(ResourceType.CALL);
  const [action, setAction] = useState('read');

  const { userAttributes, resourceAttributes, resourceFunctions, loading } =
    useAuthResourceMetadata(resource);

  const fields: Field[] = [
    ...userAttributes.map((attr) => ({
      name: `user.${attr}`,
      label: `user.${attr}`,
    })),
    ...resourceAttributes.map((attr) => ({
      name: `${resource.toLowerCase()}.${attr}`,
      label: `${resource.toLowerCase()}.${attr}`,
    })),
    ...resourceFunctions.map((fn) => ({
      name: fn,
      label: fn,
      operators: [
        { name: '=', label: '=' },
        { name: '!=', label: '!=' },
      ],
      defaultValue: 'true',
    })),
  ];

  const defaultOperators: Operator[] = [
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
      resource,
      action,
      condition: formattedQuery,
    });
  };

  return loading ? (
    <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />
  ) : (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2}>
        <FormControl fullWidth>
          <InputLabel>Subject</InputLabel>
          <Select
            value={subject}
            label="Subject"
            onChange={(e) => setSubject(e.target.value)}
          >
            <MenuItem value="user">user</MenuItem>
            <MenuItem value="user_officer">user_officer</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Resource</InputLabel>
          <Select
            value={resource}
            label="Resource"
            onChange={(e) => setResource(e.target.value as ResourceType)}
          >
            <MenuItem value={ResourceType.CALL}>call</MenuItem>
            <MenuItem value={ResourceType.PROPOSAL}>proposal</MenuItem>
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
            <MenuItem value="delete">delete</MenuItem>
            <MenuItem value="edit">edit</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Box>
        <QueryBuilder
          fields={fields}
          operators={defaultOperators}
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
