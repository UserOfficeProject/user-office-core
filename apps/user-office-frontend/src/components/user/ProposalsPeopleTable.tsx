/* eslint-disable @typescript-eslint/no-explicit-any */
import MaterialTable, { Action } from '@material-table/core';
import CloseIcon from '@mui/icons-material/Close';
import Email from '@mui/icons-material/Email';
import {
  Alert,
  AlertTitle,
  Button,
  IconButton,
  Typography,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Formik } from 'formik';
import React, { useState, useEffect, useContext } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import EmailSearchBar from 'components/common/EmailSearchBar';
import { FeatureContext } from 'context/FeatureContextProvider';
import {
  BasicUserDetails,
  UserRole,
  GetBasicUserDetailsByEmailQuery,
  GetUsersQueryVariables,
  FeatureId,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { usePrevColabs } from 'hooks/user/usePrevColabs';
import { tableIcons } from 'utils/materialIcons';
import { FunctionType } from 'utils/utilTypes';

import InviteUserForm from './InviteUserForm';

// This component is for displaying and picking from a users previous collaborators to work on a proposal.
// The table loads a users most recent and frequent collaborators for the user to choose from.
// It also allows for a user to add any user to the proposals by there email.
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
  query: GetUsersQueryVariables
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
    query.filter
      ? user.firstname.toLowerCase().includes(query.filter?.toLowerCase()) ||
        user.lastname.toLowerCase().includes(query.filter?.toLowerCase()) ||
        user.organisation.toLowerCase().includes(query.filter?.toLowerCase())
      : true
  );

  users = [...invitedUsersFormatted, ...users];
  const totalCount = users.length;

  if (typeof query.first === 'number' && typeof query.offset === 'number')
    users = users.slice(query.offset, query.offset + query.first);

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
};

const useStyles = makeStyles({
  tableWrapper: {
    '& .MuiToolbar-gutters': {
      paddingLeft: '0',
    },
  },
  verticalCentered: {
    display: 'flex',
    alignItems: 'center',
  },
  titleStyle: {
    display: 'inline',
  },
  inviteButton: {
    marginLeft: '10px',
    whiteSpace: 'nowrap',
  },
  email: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'baseline',
  },
  alertMessage: {
    paddingBottom: '10px',
  },
});

const columns = [
  { title: 'Firstname', field: 'firstname' },
  { title: 'Surname', field: 'lastname' },
  { title: 'Preferred name', field: 'preferredname' },
  { title: 'Organisation', field: 'organisation' },
];

const ProposalsPeopleTable: React.FC<PeopleTableProps> = (props) => {
  const tableRef = React.useRef();
  const [query, setQuery] = useState<
    GetUsersQueryVariables & { refreshData: boolean }
  >({
    offset: 0,
    first: 5,
    filter: '',
    subtractUsers: props.selectedUsers ? props.selectedUsers : [],
    userRole: props.userRole ? props.userRole : null,
    refreshData: false,
  });

  const featureContext = useContext(FeatureContext);
  const isEmailInviteEnabled = !!featureContext.featuresMap.get(
    FeatureId.EMAIL_INVITE
  )?.isEnabled;
  const { prevColabUsers, loadingUsersData } = usePrevColabs(query);

  const api = useDataApi();
  const [loading, setLoading] = useState(false);
  const [pageSize] = useState(10);
  const [sendUserEmail, setSendUserEmail] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<
    BasicUserDetails[]
  >([]);
  const [currentPageIds, setCurrentPageIds] = useState<number[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<BasicUserDetails[]>([]);
  const [displayError, setDisplayError] = useState<boolean>(false);
  const [tableEmails, setTableEmails] = useState<string[]>([]);

  const classes = useStyles();

  const { action } = props;

  useEffect(() => {
    if (!prevColabUsers.users) {
      return;
    }

    const page = query.offset ?? 0;
    const size = query.first ?? 5;

    const currentPage = [...invitedUsers, ...prevColabUsers.users].slice(
      page,
      page + size
    );

    setCurrentPageIds(currentPage.map(({ id }) => id));
  }, [invitedUsers, prevColabUsers, query.first, query.offset]);

  if (sendUserEmail && props.invitationUserRole && action) {
    return (
      <InviteUserForm
        title={'Invite User'}
        action={action.fn}
        close={() => setSendUserEmail(false)}
        userRole={props.invitationUserRole}
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
    !props.selection &&
    actionArray.push({
      icon: () => action.actionIcon,
      tooltip: action.actionText,
      onClick: (
        event: React.MouseEvent<JSX.Element>,
        rowData: BasicUserDetails | BasicUserDetails[]
      ) => action.fn(rowData),
    });

  props.emailInvite &&
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
            organisation: selectedItem.organisation,
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
              organisation: selectedItem.organisation,
            },
          ] as BasicUserDetails[])
        : selectedParticipants.filter(({ id }) => id !== selectedItem.id)
    );
  }

  const usersTableData = getUsersTableData(
    prevColabUsers?.users,
    selectedParticipants,
    invitedUsers,
    query
  );

  const currentPage = (query.offset as number) / (query.first as number);
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
          setLoading(true);
          const userDetails = await getUserByEmail(values.email, api);

          if (!userDetails) {
            setDisplayError(true);
            setFieldError('email', 'No user found for the given email');
            setLoading(false);

            return;
          }

          if (props.selectedUsers?.includes(userDetails.id)) {
            setFieldError('email', 'User is already on the proposal');
            setLoading(false);

            return;
          }

          if (!invitedUsers.some((user) => user.id === userDetails.id)) {
            //Add users to the table
            setInvitedUsers([userDetails].concat(invitedUsers));
            setTableEmails(tableEmails.concat([values.email]));
            setFieldValue('email', '');

            //If we are selecting multiple users add the user as pre selected.
            if (props.selection)
              setSelectedParticipants(
                selectedParticipants.concat([userDetails])
              );

            setQuery({ ...query, refreshData: !query.refreshData });
          } else {
            setFieldError('email', 'Could not add user to Proposal');
          }
          setLoading(false);
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
          <div className={classes.alertMessage}>
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
          </div>
          <div data-cy="co-proposers" className={classes.tableWrapper}>
            <MaterialTable
              tableRef={tableRef}
              icons={tableIcons}
              title={
                <Typography variant="h6" component="h1">
                  {props.title}
                </Typography>
              }
              page={currentPage}
              columns={columns}
              onSelectionChange={(selectedItems, selectedItem) =>
                selectedParticipantsChanged(selectedItems, selectedItem)
              }
              data={usersTableData.users}
              totalCount={usersTableData.totalCount}
              isLoading={loading || loadingUsersData}
              options={{
                debounceInterval: 400,
                pageSize,
                selection: props.selection,
                selectionProps: (rowdata: any) => ({
                  inputProps: {
                    'aria-label': `${rowdata.firstname}-${rowdata.lastname}-${rowdata.organisation}-select`,
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
                  nRowsSelected: '{0} Users(s) Selected',
                },
              }}
              onPageChange={(page) =>
                setQuery({ ...query, offset: page * (query.first as number) })
              }
              onSearchChange={(search) =>
                setQuery({ ...query, filter: search })
              }
              onRowsPerPageChange={(rowsPerPage) =>
                setQuery({ ...query, first: rowsPerPage })
              }
              components={{
                Toolbar: EmailSearchBar,
              }}
            />
            {props.selection && (
              <ActionButtonContainer>
                <div className={classes.verticalCentered}>
                  {selectedParticipants.length} user(s) selected
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    if (props.onUpdate) {
                      props.onUpdate(selectedParticipants);
                      setSelectedParticipants([]);
                    }
                  }}
                  disabled={selectedParticipants.length === 0}
                  data-cy="assign-selected-users"
                >
                  Update
                </Button>
              </ActionButtonContainer>
            )}
          </div>
        </>
      )}
    </Formik>
  );
};

export default ProposalsPeopleTable;
