import AddIcon from '@mui/icons-material/Add';
import {
  Autocomplete,
  Button,
  CircularProgress,
  DialogContent,
  MenuItem,
  TextField,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import StyledDialog from 'components/common/StyledDialog';
import { getCurrentUser } from 'context/UserContextProvider';
import { BasicUserDetails, Invite } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { isValidEmail, ValidEmailAddress } from 'utils/net';
import { getFullUserNameWithInstitution } from 'utils/user';
import withConfirm, { WithConfirmProps } from 'utils/withConfirm';

import NoOptionsText from './NoOptionsText';

type UserOrEmail = BasicUserDetails | ValidEmailAddress;

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

const categorizeSelectedItems = (items: UserOrEmail[]) => ({
  users: items.filter(
    (item): item is BasicUserDetails => typeof item !== 'string'
  ),
  invites: items.filter(
    (item): item is ValidEmailAddress => typeof item === 'string'
  ),
});

const MIN_SEARCH_LENGTH = 3;

function InviteUser({
  modalOpen,
  onClose,
  onAddParticipants,
  excludeUserIds,
  excludeEmails,
  confirm,
}: InviteUserProps & WithConfirmProps) {
  const api = useDataApi();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<BasicUserDetails[]>([]);
  const [exactEmailMatch, setExactEmailMatch] = useState<
    BasicUserDetails | undefined
  >();
  const [selectedItems, setSelectedItems] = useState<UserOrEmail[]>([]);

  const fetchUserSearchResults = useCallback(async () => {
    setExactEmailMatch(undefined);

    if (!query.trim().length) {
      const excludedUserIds = [
        ...(excludeUserIds ?? []),
        ...categorizeSelectedItems(selectedItems).users.map((user) => user.id),
      ];

      const { previousCollaborators } = await api().getPreviousCollaborators({
        userId: getCurrentUser()?.user.id as number,
        subtractUsers: excludedUserIds,
      });

      console.log(previousCollaborators);
      setOptions(previousCollaborators?.users || []);

      return;
    }

    if (query.length < MIN_SEARCH_LENGTH) {
      setOptions([]);
      setLoading(false);

      return;
    }

    setLoading(true);
    try {
      if (isValidEmail(query)) {
        setExactEmailMatch(undefined);
        const { basicUserDetailsByEmail } =
          await api().getBasicUserDetailsByEmail({ email: query });
        const selectedUsers = categorizeSelectedItems(selectedItems).users;

        const userAlreadyExists =
          basicUserDetailsByEmail &&
          selectedUsers
            .map((user) => user.id)
            .concat(excludeUserIds ?? [])
            .includes(basicUserDetailsByEmail.id);

        if (userAlreadyExists === false) {
          setExactEmailMatch(
            basicUserDetailsByEmail ? basicUserDetailsByEmail : undefined
          );
        }
      } else {
        const excludedUserIds = [
          ...(excludeUserIds ?? []),
          ...categorizeSelectedItems(selectedItems).users.map(
            (user) => user.id
          ),
        ];

        const { users } = await api().getUsers({
          filter: query,
          subtractUsers: excludedUserIds,
        });

        setOptions(users?.users || []);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [api, query, excludeUserIds]);

  // Debounce effect for search queries
  useEffect(() => {
    const debounceFetch = setTimeout(fetchUserSearchResults, 300);

    return () => clearTimeout(debounceFetch);
  }, [fetchUserSearchResults]);

  const addToSelectedItems = (user: UserOrEmail) =>
    setSelectedItems((prev) => [...prev, user]);

  const addValidEmailToSelection = (email: string) => {
    if (isValidEmail(email)) {
      const lowerCaseEmail = email.toLowerCase();
      addToSelectedItems(lowerCaseEmail);
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
      isEmailSent: false,
      expiresAt: null,
    };
  };
  const handleSubmit = () => {
    const { users, invites } = categorizeSelectedItems(selectedItems);
    setQuery('');
    setSelectedItems([]);

    onAddParticipants?.({ users, invites: invites.map(constructInviteObject) });
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

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === ',') {
      event.preventDefault();
      if (exactEmailMatch) {
        addToSelectedItems(exactEmailMatch);
        setExactEmailMatch(undefined);
      } else if (options.length === 1) {
        addToSelectedItems(options[0]);
      } else if (isValidEmail(query)) {
        addValidEmailToSelection(query);
      }
    }
  };

  const getOptionLabel = (option: UserOrEmail) =>
    isValidEmail(option)
      ? option
      : getFullUserNameWithInstitution(option) || '';

  const getOptionKey = (option: UserOrEmail) =>
    isValidEmail(option) ? option : option.id;

  return (
    <StyledDialog
      open={modalOpen}
      fullWidth
      maxWidth="md"
      onClose={handleClose}
      title="Add people to proposal"
    >
      <DialogContent
        dividers
        sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}
      >
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
          data-cy="invite-user-autocomplete"
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
            <MenuItem {...props} key={getOptionKey(option)}>
              {getOptionLabel(option)}
            </MenuItem>
          )}
          noOptionsText={
            <NoOptionsText
              query={query}
              onAddEmail={(email) => addValidEmailToSelection(email)}
              exactEmailMatch={exactEmailMatch}
              onAddUser={(user) => {
                addToSelectedItems(user);
                setExactEmailMatch(undefined);
                setQuery('');
              }}
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
          data-cy="invite-user-submit-button"
        >
          Add
        </Button>
      </DialogContent>
    </StyledDialog>
  );
}

export default withConfirm(InviteUser);
