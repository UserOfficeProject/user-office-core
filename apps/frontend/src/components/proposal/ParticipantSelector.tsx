import { Info } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import {
  Autocomplete,
  Button,
  CircularProgress,
  DialogContent,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
} from '@mui/material';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import StyledDialog from 'components/common/StyledDialog';
import { FeatureContext } from 'context/FeatureContextProvider';
import { getCurrentUser } from 'context/UserContextProvider';
import { BasicUserDetails, FeatureId, Invite } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { isValidEmail, ValidEmailAddress } from 'utils/net';
import { getFullUserNameWithInstitution } from 'utils/user';
import withConfirm, { WithConfirmProps } from 'utils/withConfirm';

import NoOptionsText from './NoOptionsText';

type UserOrEmail = BasicUserDetails | ValidEmailAddress;

const keyOf = (u: UserOrEmail) =>
  typeof u === 'string' ? `email:${u.toLowerCase()}` : `id:${String(u.id)}`;

const isSameParticipants = (a: UserOrEmail[], b: UserOrEmail[]): boolean =>
  a.length === b.length && a.every((v, i) => keyOf(v) === keyOf(b[i]));

interface ParticipantSelectorProps {
  modalOpen: boolean;
  title?: string;
  onClose?: () => void;
  onAddParticipants?: (data: {
    users: BasicUserDetails[];
    invites: Invite[];
  }) => void;
  excludeUserIds?: number[];
  excludeEmails?: string[];
  preset?: UserOrEmail[];
  multiple?: boolean;
  allowInviteByEmail?: boolean;
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

function ParticipantSelector({
  modalOpen,
  title,
  onClose,
  onAddParticipants,
  excludeUserIds,
  excludeEmails,
  allowInviteByEmail = false,
  confirm,
  preset = [],
  multiple = true,
}: ParticipantSelectorProps & WithConfirmProps) {
  const api = useDataApi();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<BasicUserDetails[]>([]);
  const [exactEmailMatch, setExactEmailMatch] = useState<
    BasicUserDetails | undefined
  >();
  const [selectedItems, setSelectedItems] = useState<UserOrEmail[]>(preset);
  const isPendingSearch = useRef(false);
  const featureContext = useContext(FeatureContext);
  const isEmailSearchOnly = !!featureContext.featuresMap.get(
    FeatureId.EMAIL_SEARCH
  )?.isEnabled;

  const labelText = isEmailSearchOnly
    ? 'Enter a full email address'
    : 'ex. Nathalie or john@gmail.com';

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

      setOptions(previousCollaborators?.users || []);
      isPendingSearch.current = false;

      return;
    }

    if (query.length < MIN_SEARCH_LENGTH) {
      setOptions([]);
      setLoading(false);
      isPendingSearch.current = false;

      return;
    }

    setOptions([]);
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
          setExactEmailMatch(basicUserDetailsByEmail || undefined);
        }
      } else {
        if (isEmailSearchOnly) {
          // Disallow partial name search
          return;
        }

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
    } catch {
      setOptions([]);
    } finally {
      isPendingSearch.current = false;
      setLoading(false);
    }
  }, [api, query, excludeUserIds, selectedItems, isEmailSearchOnly]);

  // Debounce effect for search queries
  useEffect(() => {
    isPendingSearch.current = true;

    const debounceFetch = setTimeout(fetchUserSearchResults, 300);

    return () => clearTimeout(debounceFetch);
  }, [query, fetchUserSearchResults]);

  const addToSelectedItems = (user: UserOrEmail) => {
    setSelectedItems((prev) => (multiple ? [...prev, user] : [user]));

    setExactEmailMatch(undefined);
    setOptions([]);
    setQuery('');
  };

  const addValidEmailToSelection = (email: string) => {
    if (isValidEmail(email)) {
      const lowerCaseEmail = email.toLowerCase();

      /*
       * Duplicate invites are still possible at this point, as invites are
       * not fetched and therefore do not go through the associated duplicate
       * filtering.
       */
      if (
        excludeEmails
          ?.concat(categorizeSelectedItems(selectedItems).invites)
          .includes(lowerCaseEmail)
      ) {
        return;
      }

      addToSelectedItems(lowerCaseEmail);
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
    if (isSameParticipants(selectedItems, preset || []) === false) {
      confirm(
        async () => {
          onClose?.();

          return;
        },
        {
          title: 'Please confirm',
          description:
            'Are you sure you want to close the dialog? Your changes will be lost.',
        }
      )();

      return;
    }

    setQuery('');
    setSelectedItems([]);
    onClose?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!multiple && selectedItems.length === 1) {
      // Prevent further input when single selection is made
      event.preventDefault();

      return;
    }

    if (event.key === 'Enter' || event.key === ' ' || event.key === ',') {
      event.preventDefault();

      if (isPendingSearch.current) {
        return;
      }

      if (exactEmailMatch) {
        addToSelectedItems(exactEmailMatch);
        setExactEmailMatch(undefined);
      } else if (options.length === 1) {
        addToSelectedItems(options[0]);
      } else if (isValidEmail(query) && !isEmailSearchOnly) {
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

  const isLoading = loading || isPendingSearch.current;

  return (
    <StyledDialog
      open={modalOpen}
      fullWidth
      maxWidth="md"
      onClose={handleClose}
      title={title || (multiple ? 'Add Participant(s)' : 'Select Participant')}
      tooltip={
        isEmailSearchOnly && (
          <Tooltip
            title={
              <span>
                Click to see your previous collaborators or start typing to
                search by email address. Click a user to add them to the
                proposal.
              </span>
            }
          >
            <IconButton>
              <Info />
            </IconButton>
          </Tooltip>
        )
      }
      data-cy="participant-selector"
    >
      <DialogContent
        dividers
        sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}
      >
        <Autocomplete
          multiple={multiple}
          fullWidth
          options={options}
          loading={isLoading}
          getOptionLabel={getOptionLabel}
          value={
            multiple
              ? selectedItems
              : selectedItems.length
                ? selectedItems[0]
                : undefined
          }
          onChange={(_, newValue) =>
            setSelectedItems(
              newValue
                ? multiple
                  ? (newValue as UserOrEmail[])
                  : [newValue as UserOrEmail]
                : []
            )
          }
          filterSelectedOptions
          onInputChange={(_, newValue) => setQuery(newValue)}
          onKeyDown={handleKeyDown}
          data-cy="invite-user-autocomplete"
          renderInput={(params) => (
            <TextField
              {...params}
              label={labelText}
              variant="outlined"
              onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                if (event.key === 'Backspace') {
                  event.stopPropagation();
                }
              }}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isLoading && (
                      <CircularProgress color="inherit" size={20} />
                    )}
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
            !isLoading ? (
              <NoOptionsText
                query={query}
                onAddEmail={(email) =>
                  allowInviteByEmail
                    ? addValidEmailToSelection(email)
                    : undefined
                }
                exactEmailMatch={exactEmailMatch}
                onAddUser={(user) => {
                  multiple
                    ? addToSelectedItems(user)
                    : setSelectedItems([user]);
                }}
                excludeEmails={
                  excludeEmails?.concat(
                    categorizeSelectedItems(selectedItems).invites
                  ) || []
                }
                isEmailSearchOnly={isEmailSearchOnly}
                allowInviteByEmail={allowInviteByEmail}
              />
            ) : null
          }
        />

        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ margin: '16px 0 8px 0' }}
          startIcon={<AddIcon />}
          disabled={
            !selectedItems.length ||
            isSameParticipants(selectedItems, preset || [])
          }
          data-cy="invite-user-submit-button"
        >
          {multiple ? 'Add' : 'Select'}
        </Button>
      </DialogContent>
    </StyledDialog>
  );
}

export default withConfirm(ParticipantSelector);
