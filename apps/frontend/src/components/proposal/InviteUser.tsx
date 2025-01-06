import AddIcon from '@mui/icons-material/Add';
import {
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { getCurrentUser } from 'context/UserContextProvider';
import { BasicUserDetails } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { getFullUserNameWithInstitution } from 'utils/user';

type ValidEmail = string;
type UserOrEmail = BasicUserDetails | ValidEmail;

interface InviteUserProps {
  modalOpen: boolean;
  onClose?: () => void;
  onAddParticipants?: (data: {
    users: BasicUserDetails[];
    invites: ValidEmail[];
  }) => void;
  excludeUserIds?: number[];
  excludeEmails?: string[];
}

const isValidEmail = (email: unknown): email is ValidEmail =>
  typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const categorizeSelectedItems = (items: UserOrEmail[]) => ({
  users: items.filter(
    (item): item is BasicUserDetails => typeof item !== 'string'
  ),
  invites: items.filter((item): item is ValidEmail => typeof item === 'string'),
});

function NoOptionsText({
  query,
  onAddEmail,
  onAddUser,
  previousCollaborators,
  excludeEmails = [],
}: {
  query: string;
  onAddEmail: () => void;
  onAddUser: (user: BasicUserDetails) => void;
  previousCollaborators: BasicUserDetails[];
  excludeEmails?: string[];
}) {
  if (!query) {
    return (
      <>
        {previousCollaborators.map((collaborator) => (
          <MenuItem
            key={collaborator.id}
            onClick={() => onAddUser(collaborator)}
          >
            {getFullUserNameWithInstitution(collaborator)}
          </MenuItem>
        ))}
      </>
    );
  }

  if (isValidEmail(query)) {
    if (excludeEmails.includes(query)) {
      return <>{query} has already been invited</>;
    }

    return (
      <Typography
        sx={{ marginTop: 1, color: 'primary.main', cursor: 'pointer' }}
        onClick={onAddEmail}
      >
        Invite {query} via email
      </Typography>
    );
  }

  if ((query as string).includes('@')) {
    return <>Keep typing a full email</>;
  }

  return (
    <>
      No results found for &quot;{query}&quot;. You can try typing their email.
    </>
  );
}

export default function InviteUser({
  modalOpen,
  onClose,
  onAddParticipants,
  excludeUserIds,
  excludeEmails,
}: InviteUserProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<BasicUserDetails[]>([]);
  const [selectedItems, setSelectedItems] = useState<UserOrEmail[]>([]);
  const [previousCollaborators, setPreviousCollaborators] = useState<
    BasicUserDetails[]
  >([]);

  const api = useDataApi();

  useEffect(() => {
    const userId = getCurrentUser()?.user.id as number;

    api()
      .getPreviousCollaborators({
        userId: userId,
        first: 0,
        offset: 0,
        subtractUsers: excludeUserIds,
      })
      .then((data) => {
        setPreviousCollaborators(data.previousCollaborators?.users ?? []);
      });
  }, [api, excludeUserIds]);

  const fetchResults = useCallback(async () => {
    if (!query.trim()) {
      setOptions([]);
      setLoading(false);

      return;
    }

    setLoading(true);
    try {
      const { users } = await api().getUsers({ filter: query });
      setOptions(users?.users || []);
    } catch (error) {
      console.error('Error fetching results:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [api, query]);

  // Debounce effect for search queries
  useEffect(() => {
    const debounceFetch = setTimeout(fetchResults, 300);

    return () => clearTimeout(debounceFetch);
  }, [fetchResults]);

  const addValidEmailToSelection = () => {
    if (isValidEmail(query)) {
      setSelectedItems((prev) => [...prev, query]);
      setQuery('');
    }
  };

  const handleSubmit = () => {
    const { users, invites } = categorizeSelectedItems(selectedItems);
    setQuery('');
    setSelectedItems([]);
    onAddParticipants?.({ users, invites });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && isValidEmail(query)) {
      addValidEmailToSelection();
    }
  };

  const handleClose = () => {
    setQuery('');
    setSelectedItems([]);
    onClose?.();
  };

  const getOptionLabel = (option: UserOrEmail) =>
    isValidEmail(option)
      ? option
      : getFullUserNameWithInstitution(option) || '';

  return (
    <Dialog open={modalOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Add people to proposal</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
        <Autocomplete
          multiple
          fullWidth
          options={options}
          loading={loading}
          getOptionLabel={getOptionLabel}
          value={selectedItems}
          onChange={(_, newValue) => setSelectedItems(newValue)}
          filterSelectedOptions
          onInputChange={(_, newValue) => setQuery(newValue)}
          onKeyDown={handleKeyDown}
          renderInput={(params) => (
            <TextField
              {...params}
              label="ex. Nathalie or john@gmail.com"
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading && <CircularProgress color="inherit" size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <MenuItem {...props} key={getOptionLabel(option)}>
              {getOptionLabel(option)}
            </MenuItem>
          )}
          noOptionsText={
            <NoOptionsText
              query={query}
              onAddEmail={addValidEmailToSelection}
              previousCollaborators={previousCollaborators}
              onAddUser={(user) => setSelectedItems((prev) => [...prev, user])}
              excludeEmails={excludeEmails}
            />
          }
        />

        <Button
          variant="outlined"
          onClick={handleSubmit}
          sx={{ margin: '16px 0 8px 0' }}
          startIcon={<AddIcon />}
        >
          Add
        </Button>
      </DialogContent>
    </Dialog>
  );
}
