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
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { getCurrentUser } from 'context/UserContextProvider';
import {
  BasicUserDetails,
  GetPreviousCollaboratorsQueryVariables,
  Invite,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { usePreviousCollaborators } from 'hooks/user/usePreviousCollaborators';
import { getFullUserNameWithInstitution } from 'utils/user';
import withConfirm, { WithConfirmProps } from 'utils/withConfirm';

type ValidEmail = string;
type UserOrEmail = BasicUserDetails | ValidEmail;

interface InviteUserProps {
  modalOpen: boolean;
  onClose?: () => void;
  onAddParticipants?: (data: {
    users: BasicUserDetails[];
    invites: Invite[];
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

const MIN_SEARCH_LENGTH = 3;

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

  if ((query as string).length < MIN_SEARCH_LENGTH) {
    return <>Please type at least {MIN_SEARCH_LENGTH} characters</>;
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

function InviteUser({
  modalOpen,
  onClose,
  onAddParticipants,
  excludeUserIds,
  excludeEmails,
  confirm,
}: InviteUserProps & WithConfirmProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<BasicUserDetails[]>([]);
  const [selectedItems, setSelectedItems] = useState<UserOrEmail[]>([]);

  const previousCollaboratorsArgs: GetPreviousCollaboratorsQueryVariables =
    useMemo(
      () => ({
        userId: getCurrentUser()?.user.id as number,
        subtractUsers: excludeUserIds || [],
      }),
      [excludeUserIds]
    );
  const previousCollaborators = usePreviousCollaborators(
    previousCollaboratorsArgs
  );

  const api = useDataApi();

  const fetchResults = useCallback(async () => {
    if (!query.trim().length || query.length < MIN_SEARCH_LENGTH) {
      setOptions([]);
      setLoading(false);

      return;
    }

    setLoading(true);
    try {
      const excludedUserIds = [
        ...(excludeUserIds ?? []),
        ...categorizeSelectedItems(selectedItems).users.map((user) => user.id),
      ];

      const { users } = await api().getUsers({
        filter: query,
        subtractUsers: excludedUserIds,
      });

      setOptions(users?.users || []);
    } catch (error) {
      console.error('Error fetching results:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [api, query, excludeUserIds]);

  // Debounce effect for search queries
  useEffect(() => {
    const debounceFetch = setTimeout(fetchResults, 300);

    return () => clearTimeout(debounceFetch);
  }, [fetchResults]);

  const addValidEmailToSelection = () => {
    if (isValidEmail(query)) {
      const lowerCaseEmail = query.toLowerCase();
      setSelectedItems((prev) => [...prev, lowerCaseEmail]);
      setQuery('');
    }
  };

  // Because we do not create Invite until the user submits the form, we need to construct an empty Invite object
  const constructInviteObject = (email: string): Invite => {
    return {
      email: email,
      claimedAt: null,
      createdAt: null,
      claimedByUserId: null,
      code: '',
      id: 0,
      createdByUserId: 0,
      note: '',
    };
  };
  const handleSubmit = () => {
    const { users, invites } = categorizeSelectedItems(selectedItems);
    setQuery('');
    setSelectedItems([]);

    onAddParticipants?.({ users, invites: invites.map(constructInviteObject) });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (
      event.key === 'Enter' ||
      event.key === ' ' ||
      (event.key === ',' && isValidEmail(query))
    ) {
      event.preventDefault();
      addValidEmailToSelection();
    }
  };

  const handleClose = () => {
    if (selectedItems.length > 0) {
      confirm(
        async () => {
          onClose?.();

          return;
        },
        {
          title: 'Please confirm',
          description:
            'User(s) have not yet been added to the proposal. Are you sure you want to close the dialog?',
        }
      )();

      return;
    }

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
              previousCollaborators={previousCollaborators?.users ?? []}
              onAddUser={(user) => setSelectedItems((prev) => [...prev, user])}
              excludeEmails={
                excludeEmails?.concat(
                  categorizeSelectedItems(selectedItems).invites
                ) || []
              }
            />
          }
        />

        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ margin: '16px 0 8px 0' }}
          startIcon={<AddIcon />}
          disabled={!selectedItems.length}
        >
          Add
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default withConfirm(InviteUser);
