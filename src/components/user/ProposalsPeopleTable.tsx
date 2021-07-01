/* eslint-disable @typescript-eslint/no-explicit-any */
import { IconButton, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Email from '@material-ui/icons/Email';
// import HelpIcon from '@material-ui/icons/Help';
import { Alert } from '@material-ui/lab';
import makeStyles from '@material-ui/styles/makeStyles';
import { Formik, Field, Form } from 'formik';
import { TextField } from 'formik-material-ui';
import MaterialTable, {
  Action,
  MTableToolbar,
  Query,
  Options,
} from 'material-table';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
// import { useEffect } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
`1`;
import {
  BasicUserDetails,
  GetPreviousCollaboratorsQuery,
  UserRole,
  GetBasicUserDetailsByEmailQuery,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { tableIcons } from 'utils/materialIcons';
import { FunctionType } from 'utils/utilTypes';

import { getCurrentUser } from '../../context/UserContextProvider';
// import { InviteUserByEmailForm } from './InviteUserByEmailForm';
import InviteUserForm from './InviteUserForm';

function sendUserRequest(
  currentUserId: number | undefined,
  searchQuery: Query<any>,
  api: any,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  selectedUsers: number[] | undefined,
  userRole: UserRole | undefined,
  selectedParticipants: number[]
) {
  //---Some of these might remain unused
  const variables = {
    userId: currentUserId,
    filter: searchQuery.search,
    // offset: searchQuery.pageSize * searchQuery.page,
    // first: searchQuery.pageSize,
    subtractUsers: selectedUsers ? selectedUsers : [],
    userRole: userRole ? userRole : null,
  };

  setLoading(true);

  return api()
    .getPreviousCollaborators(variables)
    .then((data: GetPreviousCollaboratorsQuery) => {
      setLoading(false);

      return {
        page: searchQuery.page,
        totalCount: data?.previousCollaborators?.totalCount,
        data: data?.previousCollaborators?.users.map(
          (user: BasicUserDetails) => {
            return {
              firstname: user.firstname,
              lastname: user.lastname,
              organisation: user.organisation,
              id: user.id,
              tableData: { checked: selectedParticipants.includes(user.id) },
            };
          }
        ),
      };
    });
}

async function getUserByEmail(email: string, api: any) {
  return api()
    .getBasicUserDetailsByEmail({ email: email, role: UserRole.USER })
    .then((user: GetBasicUserDetailsByEmailQuery) => {
      // const temp = {
      //   firstname: user?.basicUserDetailsByEmail?.firstname,
      //   lastname: user?.basicUserDetailsByEmail?.lastname,
      //   organisation: user?.basicUserDetailsByEmail?.organisation,
      // };

      const userDetails = user?.basicUserDetailsByEmail;

      return userDetails;
    });
}

type PeopleTableProps<T extends BasicUserDetails = BasicUserDetails> = {
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
  addMultipleUsers?: boolean;
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
    // noWrap: true,
    whiteSpace: 'nowrap',
    display: 'inline',
    overflow: 'visible',
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
});

const columns = [
  { title: 'Name', field: 'firstname' },
  { title: 'Surname', field: 'lastname' },
  { title: 'Organisation', field: 'organisation' },
];

const ProposalsPeopleTable: React.FC<PeopleTableProps> = (props) => {
  const tableRef = React.useRef();
  // const tableRef = useRef();
  const sendRequest = useDataApi();
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(5);
  const [sendUserEmail, setSendUserEmail] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<
    BasicUserDetails[]
  >([]);
  const [currentPageIds, setCurrentPageIds] = useState<number[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<BasicUserDetails[]>([]);
  const [displayError, setDisplayError] = useState<boolean>(false);
  const [tableEmails, setTableEmails] = useState<string[]>([]);

  // useEffect(() => {}, [invitedUsers]);

  const userID = getCurrentUser()?.user.id;

  const classes = useStyles();

  const { action } = props;

  if (sendUserEmail && props.invitationUserRole && action) {
    return (
      <InviteUserForm
        title={'Invite User'}
        action={action.fn}
        close={() => setSendUserEmail(false)}
        userRole={props.invitationUserRole}
      />
      // <InviteUserByEmailForm
      //   title={'Find Users By Email'}
      //   action={action.fn}
      //   close={() => setSendUserEmail(false)}
      //   userRole={props.invitationUserRole}
      //   addMultipleUsers={true}
      //   invitedUsers={invitedUsers}
      //   selectedUsers={props.selectedUsers}
      // />
    );
  }
  const EmailIcon = (): JSX.Element => <Email />;

  // type script doesn't like this not being typed explicitly
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

  const tableData = (
    query: Query<
      BasicUserDetails & {
        tableData: {
          checked: boolean;
        };
      }
    >
  ) => {
    setPageSize(query.pageSize);

    return sendUserRequest(
      userID,
      query,
      sendRequest,
      setLoading,
      props.selectedUsers,
      props.userRole,
      selectedParticipants.map(({ id }) => id)
    ).then((users: any) => {
      const queryInvitedUsersIds = invitedUsers.map(
        (user: BasicUserDetails) => user.id
      ); // ids of all users being invited

      users.data = users.data.filter(
        (user: BasicUserDetails) => !queryInvitedUsersIds.includes(user.id)
      );
      // update users array to remove any invitedUsers. We re-add them so that they appear at the top of the list
      // this helps users find someone in the list even if they are already there
      // Effectively, searching for someone in the list reorders the list

      const invitedUsersFormatted = invitedUsers
        .filter(
          (user) =>
            user.firstname.toLowerCase().includes(query.search.toLowerCase()) ||
            user.lastname.toLowerCase().includes(query.search.toLowerCase()) ||
            user.organisation.toLowerCase().includes(query.search.toLowerCase())
        )
        .map((user: BasicUserDetails) => ({
          ...user,
          tableData: { checked: true && props.selection },
        }));

      users.data = [...invitedUsersFormatted, ...users.data];
      users.totalCount = users.data.length;

      users.data = users.data.slice(
        query.pageSize * query.page,
        query.pageSize * query.page + query.pageSize
      );

      setCurrentPageIds(users.data.map(({ id }: { id: number }) => id));
      if (props.selection)
        selectedParticipantsChanged(invitedUsersFormatted, undefined);

      return users;
    });
  };

  const StylisedToolBar = (compProps: Options) => {
    return (
      <>
        <div className={classes.titleStyle}>
          <MTableToolbar {...compProps} />
        </div>
        <div>
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
              We cannot find that email. Please check the spelling and if the
              user has registered with us or has the correct privacy settings to
              be found by this search.
            </Alert>
          )}
          <Form
            // onSubmit={subformik.handleSubmit}
            className={classes.email}
          >
            <Field
              name="email"
              label="E-mail"
              type="email"
              component={TextField}
              margin="normal"
              fullWidth
              flex="1"
              data-cy="email"
            />
            <Button
              data-cy="findUser"
              variant="contained"
              color="primary"
              type="submit"
              className={classes.inviteButton}
            >
              Find User
            </Button>
          </Form>
        </div>
      </>
    );
  };

  return (
    <Formik
      initialValues={{
        email: '',
      }}
      initialErrors={{
        email: 'test',
      }}
      onSubmit={async (values, { setFieldError, setFieldValue }) => {
        // If there is an email and it has not already been searched
        if (values.email && !tableEmails.includes(values.email)) {
          const userDetails = await getUserByEmail(values.email, sendRequest);

          if (!userDetails) {
            setDisplayError(true);
            setFieldError('email', 'Please enter valid email address');

            return;
          }
          if (props.selectedUsers?.includes(userDetails.id)) {
            setFieldError('email', 'User is already on the proposal');

            return;
          }

          if (!invitedUsers.some((user) => user.id === userDetails.id)) {
            setInvitedUsers([userDetails].concat(invitedUsers));
            setTableEmails(tableEmails.concat([values.email]));
            setFieldValue('email', '');

            //This is the recommend why to refresh a table but it is unsupported in typescript and may not be supported anytime soon
            //See: Refresh Data Example https://material-table.com/#/docs/features/remote-data
            //and see: https://github.com/mbrn/material-table/issues/1752
            // @ts-ignore
            tableRef.current.onQueryChange();
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
      {(subformik) => (
        <div data-cy="co-proposers" className={classes.tableWrapper}>
          <MaterialTable
            tableRef={tableRef}
            icons={tableIcons}
            title={
              <Typography
                variant="h6"
                component="h2"
                // noWrap={true}
                // classes={classes.titleStyle}
              >
                {props.title}
              </Typography>
            }
            columns={columns}
            onSelectionChange={(selectedItems, selectedItem) =>
              selectedParticipantsChanged(selectedItems, selectedItem)
            }
            data={tableData}
            isLoading={loading}
            options={{
              // search: false,
              // searchFieldStyle: ,
              debounceInterval: 400,
              pageSize,
              selection: props.selection,
            }}
            actions={actionArray}
            localization={{
              body: { emptyDataSourceMessage: 'No Previous Collaborators' },
              toolbar: {
                searchPlaceholder: 'Filter',
                searchTooltip: 'Filter Users',
              },
            }}
            components={{
              Toolbar: StylisedToolBar,
            }}
          />
          {props.selection && (
            <ActionButtonContainer>
              <div className={classes.verticalCentered}>
                {selectedParticipants.length} user(s) selected
              </div>
              <Button
                type="button"
                variant="contained"
                color="primary"
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
              <Button onClick={() => console.log(selectedParticipants)}>
                tests
              </Button>
            </ActionButtonContainer>
          )}
        </div>
      )}
    </Formik>
  );
};

ProposalsPeopleTable.propTypes = {
  title: PropTypes.string,
  action: PropTypes.shape({
    fn: PropTypes.func.isRequired,
    actionIcon: PropTypes.element.isRequired,
    actionText: PropTypes.string.isRequired,
  }),
  selection: PropTypes.bool.isRequired,
  userRole: PropTypes.any,
  invitationUserRole: PropTypes.any,
  onUpdate: PropTypes.func,
  emailInvite: PropTypes.bool,
  selectedUsers: PropTypes.array,
  addMultipleUsers: PropTypes.bool,
};

export default ProposalsPeopleTable;
