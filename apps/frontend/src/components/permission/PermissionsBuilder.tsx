import {
  FormControl,
  InputLabel,
  MenuItem,
  Button,
  Select,
} from '@mui/material';
import { Stack, Box } from '@mui/system';
import React, { useEffect, useMemo, useState } from 'react';
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
import { usePolicyCondition } from 'hooks/permission/usePolicyCondition';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

export function PermissionsBuilder() {
  const { api } = useDataApiWithFeedback();

  const [subject, setSubject] = useState<string>('user');
  const [resource, setResource] = useState<ResourceType>(ResourceType.PROPOSAL);
  const [action, setAction] = useState('read');

  const emptyQuery = useMemo<RuleGroupType>(
    () => ({
      combinator: 'and',
      rules: [],
    }),
    []
  );

  const [query, setQuery] = useState<RuleGroupType>(emptyQuery);

  const {
    userAttributes,
    resourceAttributes,
    resourceFunctions,
    loadingMetaData,
  } = useAuthResourceMetadata(resource);

  const { condition, loadingCondition } = usePolicyCondition(
    subject,
    resource,
    action
  );

  useEffect(() => {
    if (loadingCondition) return;

    if (condition) {
      setQuery(JSON.parse(condition));
    } else {
      setQuery(emptyQuery);
    }
  }, [condition, loadingCondition, emptyQuery]);

  const fields: Field[] = useMemo(
    () => [
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
        label: `${fn}()`,
        operators: [
          { name: '=', label: '=' },
          { name: '!=', label: '!=' },
        ],
        defaultValue: 'true',
      })),
    ],
    [userAttributes, resourceAttributes, resourceFunctions, resource]
  );

  const defaultOperators: Operator[] = useMemo(
    () => [
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
    ],
    []
  );

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

  return loadingMetaData ? (
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
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Resource</InputLabel>
          <Select
            value={resource}
            label="Resource"
            onChange={(e) => setResource(e.target.value as ResourceType)}
          >
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
            <MenuItem value="update">update</MenuItem>
            <MenuItem value="delete">delete</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Box>
        {loadingCondition ? (
          <UOLoader style={{ marginLeft: '50%', marginTop: '50px' }} />
        ) : (
          <QueryBuilder
            fields={fields}
            operators={defaultOperators}
            query={query}
            onQueryChange={setQuery}
          />
        )}
      </Box>
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={handleCreatePolicy}
          disabled={loadingCondition || loadingMetaData}
        >
          Create/update
        </Button>
      </Box>
    </Stack>
  );
}
