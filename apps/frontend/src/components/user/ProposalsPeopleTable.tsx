/* eslint-disable @typescript-eslint/no-explicit-any */
import MaterialTable, {
  Action,
  Query,
  QueryResult,
} from '@material-table/core';
import CloseIcon from '@mui/icons-material/Close';
import Email from '@mui/icons-material/Email';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Formik } from 'formik';
import React, { useState, useContext } from 'react';

import EmailSearchBar from 'components/common/EmailSearchBar';
import { FeatureContext } from 'context/FeatureContextProvider';
import { getCurrentUser } from 'context/UserContextProvider';
import {
  BasicUserDetails,
  UserRole,
  GetBasicUserDetailsByEmailQuery,
  FeatureId,
  BasicUserDetailsFragment,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { tableIcons } from 'utils/materialIcons';
import { FunctionType } from 'utils/utilTypes';

import InviteUserForm from './InviteUserForm';

// This component is for displaying and picking from a users previous collaborators to work on a proposal.
// The table loads a users most recent and frequent collaborators for the user to choose from.
// It also allows for a user to add any user to the proposals by their email.
// To add the email form into the material table it uses component overriding to override the material table toolbar
// with the StylisedToolbar. When find user is click it queries the backend for a user with that email then updates the table.

type BasicUserDetailsWithTableData = (BasicUserDetails & {
  tableData?: { checked: boolean };
})[];

async function getUserByEmail(email: string, api: any) {
  return api()
    .getBasicUserDetailsByEmail({ email: email, role: UserRole.USER })
    .then((user: GetBasicUserDetailsByEmailQuery) => {
      const userDetails = user?.basicUserDetailsByEmail;

      return userDetails;
    });
}

const getUsersTableData = (
  users: BasicUserDetailsWithTableData,
  selectedUsers: BasicUserDetails[],
  invitedUsers: BasicUserDetails[],
  query: Query<BasicUserDetails & { tableData: { checked: boolean } }>
) => {
  const queryInvitedUsersIds = invitedUsers.map(
    (user: BasicUserDetails) => user.id
  ); // ids of all users being invited

  users = users.filter(
    (user: BasicUserDetails) => !queryInvitedUsersIds.includes(user.id)
  );
  // update users array to remove any invitedUsers. We re-add them so that they appear at the top of the list
  // this helps users find someone in the list even if they are already there

  const invitedUsersFormatted = invitedUsers.filter((user) =>
    query.search
      ? user.firstname.toLowerCase().includes(query.search.toLowerCase()) ||
        user.lastname.toLowerCase().includes(query.search.toLowerCase()) ||
        user.institution.toLowerCase().includes(query.search.toLowerCase())
      : true
  );

  users = [...invitedUsersFormatted, ...users];
  const totalCount = users.length;
  const offset = query.page * query.pageSize;

  if (typeof query.pageSize === 'number' && typeof offset === 'number')
    users = users.slice(offset, offset + query.pageSize);

  return {
    users: users.map((user: BasicUserDetails) => ({
      ...user,
      tableData: {
        checked: selectedUsers.some(
          (selectedUser) => selectedUser.id === user.id
        ),
      },
    })),
    totalCount: totalCount,
  };
};

type PeopleTableProps = {
  selection: boolean;
  title?: string;
  userRole?: UserRole;
  invitationUserRole?: UserRole;
  action?: {
    fn: (data: any) => void;
    actionIcon: JSX.Element;
    actionText: string;
  };
  isFreeAction?: boolean;
  onUpdate?: FunctionType<void, [any[]]>;
  emailInvite?: boolean;
  selectedUsers?: number[];
  selectedParticipants: BasicUserDetails[];
  setSelectedParticipants: React.Dispatch<
    React.SetStateAction<BasicUserDetails[]>
  >;
};

const columns = [
  { title: 'Firstname', field: 'firstname' },
  { title: 'Surname', field: 'lastname' },
  { title: 'Preferred name', field: 'preferredname' },
  { title: 'Institution', field: 'institution' },
];

const ProposalsPeopleTable = ({
  selectedParticipants,
  selection,
  setSelectedParticipants,
  action,
  emailInvite,
  invitationUserRole,
  selectedUsers,
  title,
  userRole,
}: PeopleTableProps) => {
  const tableRef = React.createRef<MaterialTable<BasicUserDetailsFragment>>();
  const [query] = useState<{
    subtractUsers: number[];
    userRole: UserRole | null;
  }>({
    subtractUsers: selectedUsers ? selectedUsers : [],
    userRole: userRole ? userRole : null,
  });

  const featureContext = useContext(FeatureContext);
  const isEmailInviteEnabled = !!featureContext.featuresMap.get(
    FeatureId.EMAIL_INVITE
  )?.isEnabled;

  const api = useDataApi();
  const [sendUserEmail, setSendUserEmail] = useState(false);
  const [currentPageIds, setCurrentPageIds] = useState<number[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<BasicUserDetails[]>([]);
  const [displayError, setDisplayError] = useState<boolean>(false);
  const [tableEmails, setTableEmails] = useState<string[]>([]);

  if (sendUserEmail && invitationUserRole && action) {
    return (
      <InviteUserForm
        title={'Invite User'}
        action={action.fn}
        close={() => setSendUserEmail(false)}
        userRole={invitationUserRole}
      />
    );
  }
  const EmailIcon = (): JSX.Element => <Email />;

  // Typescript doesn't like this not being typed explicitly
  const actionArray:
    | (
        | Action<BasicUserDetails & { tableData: { checked: boolean } }>
        | ((
            rowData: BasicUserDetails & { tableData: { checked: boolean } }
          ) => Action<BasicUserDetails & { tableData: { checked: boolean } }>)
      )[]
    | {
        icon: (() => JSX.Element) | (() => JSX.Element);
        tooltip: string;
        onClick:
          | ((
              event: React.MouseEvent<JSX.Element, MouseEvent>,
              rowData: BasicUserDetails | BasicUserDetails[]
            ) => void)
          | (() => void);
        isFreeAction?: boolean;
      }[]
    | undefined = [];

  action &&
    !selection &&
    actionArray.push({
      icon: () => action.actionIcon,
      tooltip: action.actionText,
      onClick: (
        event: React.MouseEvent<JSX.Element>,
        rowData: BasicUserDetails | BasicUserDetails[]
      ) => action.fn(rowData),
    });

  emailInvite &&
    isEmailInviteEnabled &&
    actionArray.push({
      icon: EmailIcon,
      isFreeAction: true,
      tooltip: 'Add by email',
      onClick: () => setSendUserEmail(true),
    });

  function selectedParticipantsChanged(
    selectedItems: (BasicUserDetails & {
      tableData: {
        checked: boolean;
      };
    })[],
    selectedItem:
      | (BasicUserDetails & {
          tableData: {
            checked: boolean;
          };
        })
      | undefined
  ) {
    // when the user wants to (un)select all items
    // `selectedItem` will be undefined
    if (!selectedItem) {
      // first clear the current page because if any row was unselected
      // the (un)select all option will select every rows
      // which would result in duplicates
      setSelectedParticipants((selectedParticipants) =>
        selectedParticipants.filter(({ id }) => !currentPageIds.includes(id))
      );

      if (selectedItems.length > 0) {
        setSelectedParticipants((selectedParticipants) => [
          ...selectedParticipants,
          ...(selectedItems.map((selectedItem) => ({
            id: selectedItem.id,
            firstname: selectedItem.firstname,
            lastname: selectedItem.lastname,
            institution: selectedItem.institution,
          })) as BasicUserDetails[]),
        ]);
      }

      return;
    }

    setSelectedParticipants((selectedParticipants) =>
      selectedItem.tableData.checked
        ? ([
            ...selectedParticipants,
            {
              id: selectedItem.id,
              firstname: selectedItem.firstname,
              lastname: selectedItem.lastname,
              institution: selectedItem.institution,
            },
          ] as BasicUserDetails[])
        : selectedParticipants.filter(({ id }) => id !== selectedItem.id)
    );
  }

  const fetchRemoteUsersData = (
    tableQuery: Query<
      BasicUserDetails & {
        tableData: {
          checked: boolean;
        };
      }
    >
  ) =>
    new Promise<
      QueryResult<
        BasicUserDetails & {
          tableData: {
            checked: boolean;
          };
        }
      >
    >(async (resolve, reject) => {
      try {
        const userId = getCurrentUser()?.user.id as number;

        const { previousCollaborators } = await api().getPreviousCollaborators({
          userId: userId,
          filter: tableQuery.search,
          first: tableQuery.pageSize,
          offset: tableQuery.page * tableQuery.pageSize,
          subtractUsers: query.subtractUsers,
          userRole: query.userRole,
        });

        const usersTableData = getUsersTableData(
          previousCollaborators?.users || [],
          selectedParticipants || [],
          invitedUsers,
          tableQuery
        );

        const currentPage = [...invitedUsers, ...usersTableData.users].slice(
          tableQuery.page,
          tableQuery.page + tableQuery.pageSize
        );

        setCurrentPageIds(currentPage.map(({ id }) => id));

        resolve({
          data: usersTableData.users,
          page: tableQuery.page,
          totalCount: usersTableData.totalCount,
        });
      } catch (error) {
        reject(error);
      }
    });

  const emailSearchText = isEmailInviteEnabled
    ? 'Please check the spelling and if the user has registered with us. If not found, the user can be added through email invite.'
    : 'Please check the spelling and if the user has registered with us or has the correct privacy settings to be found by this search.';

  return (
    <Formik
      initialValues={{
        email: '',
      }}
      onSubmit={async (values, { setFieldError, setFieldValue }) => {
        // If there is an email and it has not already been searched
        if (values.email && !tableEmails.includes(values.email)) {
          const userDetails = await getUserByEmail(values.email, api);

          if (!userDetails) {
            setDisplayError(true);
            setFieldError('email', 'No user found for the given email');

            return;
          }

          if (selectedUsers?.includes(userDetails.id)) {
            setFieldError('email', 'User is already on the proposal');

            return;
          }

          for (const selectedParticipant of selectedParticipants) {
            if (selectedParticipant.id === userDetails.id) {
              setFieldError('email', 'User is already selected');

              return;
            }
          }

          if (!invitedUsers.some((user) => user.id === userDetails.id)) {
            //Add users to the table
            setInvitedUsers([userDetails].concat(invitedUsers));
            setTableEmails(tableEmails.concat([values.email]));
            setFieldValue('email', '');

            //If we are selecting multiple users add the user as pre selected.
            if (selection)
              setSelectedParticipants(
                selectedParticipants.concat([userDetails])
              );

            tableRef.current && tableRef.current.onQueryChange({});
          } else {
            setFieldError('email', 'Could not add user to Proposal');
          }
        } else if (tableEmails.includes(values.email)) {
          setFieldError(
            'email',
            'User has already been added, possibly use filter instead'
          );
        } else {
          setFieldError('email', 'Please enter a email');
        }
      }}
    >
      {() => (
        <>
          <Box sx={{ paddingBottom: '10px' }}>
            {displayError && (
              <Alert
                severity="warning"
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setDisplayError(false);
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
              >
                <AlertTitle>We cannot find that email</AlertTitle>
                {emailSearchText}
              </Alert>
            )}
          </Box>

          <Box
            data-cy="co-proposers"
            sx={{
              '& .MuiToolbar-gutters': {
                paddingLeft: '0',
                paddingRight: '0',
                marginRight: '24px',
              },
            }}
          >
            <MaterialTable
              tableRef={tableRef}
              icons={tableIcons}
              title={
                <Typography variant="h6" component="h1">
                  {title}
                </Typography>
              }
              style={{ position: 'static' }}
              columns={columns}
              onSelectionChange={(selectedItems, selectedItem) =>
                selectedParticipantsChanged(selectedItems, selectedItem)
              }
              data={fetchRemoteUsersData}
              options={{
                search: true,
                debounceInterval: 400,
                pageSize: 10,
                selection,
                selectionProps: (rowdata: any) => ({
                  inputProps: {
                    'aria-label': `${rowdata.firstname}-${rowdata.lastname}-${rowdata.institution}-select`,
                  },
                }),
                headerSelectionProps: {
                  inputProps: { 'aria-label': 'Select All Rows' },
                },
              }}
              actions={actionArray}
              localization={{
                body: { emptyDataSourceMessage: 'No Previous Collaborators' },
                toolbar: {
                  searchPlaceholder: 'Filter found users',
                  searchTooltip: 'Filter found users',
                  nRowsSelected: '{0} User(s) Selected',
                },
              }}
              components={{
                Toolbar: EmailSearchBar,
              }}
            />
          </Box>
        </>
      )}
    </Formik>
  );
};

export default ProposalsPeopleTable;
