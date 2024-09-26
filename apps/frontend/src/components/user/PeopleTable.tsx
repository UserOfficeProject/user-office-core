import MaterialTableCore, {
  Options,
  Column,
  MTableToolbar,
  Query,
  QueryResult,
} from '@material-table/core';
import Email from '@mui/icons-material/Email';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import { Formik } from 'formik';
import { TFunction } from 'i18next';
import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import MaterialTable from 'components/common/DenseMaterialTable';
import EmailSearchBar from 'components/common/EmailSearchBar';
import { FeatureContext } from 'context/FeatureContextProvider';
import { getCurrentUser } from 'context/UserContextProvider';
import {
  BasicUserDetails,
  FeatureId,
  GetBasicUserDetailsByEmailQuery,
  Role,
  UserRole,
  Maybe,
  getSdk,
  BasicUserDetailsFragment,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { tableIcons } from 'utils/materialIcons';
import { FunctionType } from 'utils/utilTypes';

import InviteUserForm from './InviteUserForm';

type InvitationButtonProps = {
  title: string;
  action: FunctionType;
  'data-cy'?: string;
};

type BasicUserDetailsWithTableData = (BasicUserDetails & {
  tableData?: { checked: boolean };
})[];

type BasicUserDetailsWithRole = BasicUserDetails & { role?: Maybe<Role> };

type PeopleTableProps<T extends BasicUserDetails = BasicUserDetailsWithRole> = {
  selection: boolean;
  isLoading?: boolean;
  title?: string;
  userRole?: UserRole;
  invitationUserRole?: UserRole;
  action?: {
    fn: (data: T | T[]) => void;
    actionIcon: JSX.Element;
    actionText: string;
  };
  isFreeAction?: boolean;
  data?: T[];
  search?: boolean;
  onRemove?: FunctionType<void, T>;
  onUpdate?: FunctionType<void, [T[]]>;
  emailInvite?: boolean;
  emailSearch?: boolean;
  showInvitationButtons?: boolean;
  selectedUsers?: number[];
  mtOptions?: Options<T>;
  columns?: Column<T>[];
  preserveSelf?: boolean;
  setPrincipalInvestigator?: (user: BasicUserDetails) => void;
  selectedParticipants?: BasicUserDetails[];
  setSelectedParticipants?: React.Dispatch<
    React.SetStateAction<BasicUserDetails[]>
  >;
};

const localColumns = [
  { title: 'Firstname', field: 'firstname' },
  { title: 'Lastname', field: 'lastname' },
  { title: 'Preferred name', field: 'preferredname' },
  { title: 'Institution', field: 'institution' },
];

const getTitle = ({
  t,
  invitationUserRole,
}: {
  t: TFunction<'translation', undefined>;
  invitationUserRole?: UserRole;
}): string => {
  switch (invitationUserRole) {
    case UserRole.USER_OFFICER:
      return 'Invite User';
    case UserRole.FAP_CHAIR:
      return 'Invite ' + t('Fap') + ' Chair';
    case UserRole.FAP_SECRETARY:
      return 'Invite ' + t('Fap') + ' Secretary';
    case UserRole.INSTRUMENT_SCIENTIST:
      return 'Invite ' + t('instrumentSci');
    default:
      return 'Invite User';
  }
};

async function getUserByEmail(
  email: string,
  api: () => ReturnType<typeof getSdk>
) {
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
  query: Query<BasicUserDetailsWithRole>,
  totalCount: number
) => {
  if (query.page * query.pageSize === 0) {
    // update users array to remove any invitedUsers. We re-add them so that they appear at the top of the list
    // this helps users find someone in the list even if they are already there

    const invitedUsersFiltered = invitedUsers.filter((user) =>
      query.search
        ? user.firstname.toLowerCase().includes(query.search.toLowerCase()) ||
          user.lastname.toLowerCase().includes(query.search.toLowerCase()) ||
          user.institution.toLowerCase().includes(query.search.toLowerCase())
        : true
    );

    users = [...invitedUsersFiltered, ...users];
  }

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

const PeopleTable = ({
  selectedParticipants,
  selection,
  setSelectedParticipants,
  selectedUsers,
  userRole,
  data,
  action,
  emailInvite,
  emailSearch,
  invitationUserRole,
  isFreeAction,
  showInvitationButtons,
  columns,
  mtOptions,
  onRemove,
  preserveSelf,
  search,
  title,
  setPrincipalInvestigator,
}: PeopleTableProps) => {
  const [query, setQuery] = useState<{
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
  const isEmailSearchEnabled = !!featureContext.featuresMap.get(
    FeatureId.EMAIL_SEARCH
  )?.isEnabled;

  const api = useDataApi();
  const [sendUserEmail, setSendUserEmail] = useState(false);
  const [inviteUserModal, setInviteUserModal] = useState({
    show: false,
    title: '',
    userRole: UserRole.USER,
  });
  const [currentPageIds, setCurrentPageIds] = useState<number[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<BasicUserDetails[]>([]);
  const [tableEmails, setTableEmails] = useState<string[]>([]);
  const { t } = useTranslation();
  const tableRef =
    React.createRef<MaterialTableCore<BasicUserDetailsFragment>>();

  useEffect(() => {
    if (!data) {
      return;
    }

    setCurrentPageIds(data.map(({ id }) => id));
    tableRef.current && tableRef.current.onQueryChange({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.length]);

  if (sendUserEmail && invitationUserRole && action) {
    return (
      <InviteUserForm
        title={getTitle({ t, invitationUserRole })}
        action={action.fn}
        close={() => setSendUserEmail(false)}
        userRole={invitationUserRole}
      />
    );
  }
  const EmailIcon = (): JSX.Element => <Email />;

  const handleChangeCoIToPi = (user: BasicUserDetails) => {
    onRemove?.(user);
    setPrincipalInvestigator?.(user);
  };

  const actionArray = [];
  action &&
    !selection &&
    actionArray.push({
      icon: () => action.actionIcon,
      isFreeAction: isFreeAction,
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

  setPrincipalInvestigator &&
    onRemove &&
    actionArray.push({
      icon: () => (
        <Button data-cy="assign-as-pi" component="a" href="#" variant="text">
          Assign <br /> as PI
        </Button>
      ),
      tooltip: 'Set Principal Investigator',
      onClick: (
        event: React.MouseEvent<JSX.Element>,
        rowData: BasicUserDetails | BasicUserDetails[]
      ) => {
        event.preventDefault();

        return new Promise<void>(() => {
          const user = Array.isArray(rowData) ? rowData[0] : rowData;
          handleChangeCoIToPi(user);
          tableRef.current && tableRef.current.onQueryChange({});
        });
      },
    });

  const invitationButtons: InvitationButtonProps[] = [];

  if (showInvitationButtons) {
    invitationButtons.push(
      {
        title: 'Invite User',
        action: () =>
          setInviteUserModal({
            show: true,
            title: 'Invite User',
            userRole: UserRole.USER,
          }),
        'data-cy': 'invite-user-button',
      },
      {
        title: 'Invite Reviewer',
        action: () =>
          setInviteUserModal({
            show: true,
            title: 'Invite Reviewer',
            userRole: UserRole.FAP_REVIEWER,
          }),
        'data-cy': 'invite-reviewer-button',
      }
    );
  }

  const handleColumnSelectionChange = (
    selectedItems: BasicUserDetailsWithRole[],
    selectedItem: BasicUserDetailsWithRole | undefined
  ) => {
    // when the user wants to (un)select all items
    // `selectedItem` will be undefined
    if (!selectedItem) {
      // first clear the current page because if any row was unselected
      // the (un)select all option will select every rows
      // which would result in duplicates
      setSelectedParticipants?.((selectedParticipants) =>
        selectedParticipants.filter(({ id }) => !currentPageIds.includes(id))
      );

      if (selectedItems.length > 0) {
        setSelectedParticipants?.((selectedParticipants) => [
          ...selectedParticipants,
          ...(selectedItems.map((selectedItem) => ({
            id: selectedItem.id,
            firstname: selectedItem.firstname,
            lastname: selectedItem.lastname,
            institution: selectedItem.institution,
            institutionId: selectedItem.institutionId,
          })) as BasicUserDetails[]),
        ]);
      }

      return;
    }

    setSelectedParticipants?.((selectedParticipants) =>
      (
        selectedItem as BasicUserDetails & {
          tableData: { checked: boolean };
        }
      ).tableData.checked
        ? ([
            ...selectedParticipants,
            {
              id: selectedItem.id,
              firstname: selectedItem.firstname,
              lastname: selectedItem.lastname,
              institution: selectedItem.institution,
              institutionId: selectedItem.institutionId,
            },
          ] as BasicUserDetails[])
        : selectedParticipants.filter(({ id }) => id !== selectedItem.id)
    );
  };

  const fetchRemoteUsersData = (tableQuery: Query<BasicUserDetailsWithRole>) =>
    new Promise<QueryResult<BasicUserDetailsWithRole>>(
      async (resolve, reject) => {
        try {
          const [orderBy] = tableQuery.orderByCollection;
          const { users } = await api().getUsers({
            filter: tableQuery.search,
            first: tableQuery.pageSize,
            offset: tableQuery.page * tableQuery.pageSize,
            orderBy: orderBy?.orderByField,
            orderDirection: orderBy?.orderDirection,
            subtractUsers: query.subtractUsers,
            userRole: query.userRole,
          });

          const filteredData = data
            ? data.filter((user) =>
                tableQuery.search
                  ? user.firstname
                      .toLowerCase()
                      .includes(tableQuery.search.toLowerCase()) ||
                    user.lastname
                      .toLowerCase()
                      .includes(tableQuery.search.toLowerCase()) ||
                    user.institution
                      .toLowerCase()
                      .includes(tableQuery.search.toLowerCase())
                  : true
              )
            : undefined;

          const paginatedFilteredData = filteredData
            ? filteredData.slice(
                tableQuery.page * tableQuery.pageSize,
                tableQuery.pageSize + tableQuery.page * tableQuery.pageSize
              )
            : undefined;

          const usersTableData = getUsersTableData(
            paginatedFilteredData || users?.users || [],
            selectedParticipants || [],
            invitedUsers,
            tableQuery,
            filteredData?.length || users?.totalCount || 0
          );

          setCurrentPageIds(usersTableData.users.map(({ id }) => id));

          resolve({
            data: usersTableData.users,
            page: tableQuery.page,
            totalCount: usersTableData.totalCount,
          });
        } catch (error) {
          reject(error);
        }
      }
    );

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
            setFieldError('email', 'No user found for the given email');

            return;
          }

          if (selectedUsers?.includes(userDetails.id)) {
            setFieldError('email', 'User is already on the proposal');

            return;
          }

          if (invitedUsers.every((user) => user.id !== userDetails.id)) {
            //Add users to the table
            setInvitedUsers([userDetails].concat(invitedUsers));
            setTableEmails(tableEmails.concat([values.email]));
            setFieldValue('email', '');

            //If we are selecting multiple users add the user as pre selected.
            if (selection) {
              setSelectedParticipants?.(
                selectedParticipants?.concat([userDetails]) || []
              );
            }

            setQuery({
              ...query,
              subtractUsers: (query.subtractUsers as number[]).concat(
                userDetails.id
              ),
            });
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
      <Box
        data-cy="co-proposers"
        sx={{
          '& .MuiToolbar-gutters': {
            paddingLeft: '0',
          },
        }}
      >
        <Dialog
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={inviteUserModal.show}
          onClose={(): void =>
            setInviteUserModal({
              ...inviteUserModal,
              show: false,
            })
          }
          style={{ backdropFilter: 'blur(6px)' }}
        >
          <DialogContent>
            <InviteUserForm
              title={inviteUserModal.title}
              userRole={inviteUserModal.userRole}
              close={() =>
                setInviteUserModal({
                  ...inviteUserModal,
                  show: false,
                })
              }
              action={(invitedUser) => {
                if (invitedUser) {
                  tableRef.current && tableRef.current.onQueryChange({});
                }
              }}
            />
          </DialogContent>
        </Dialog>
        <MaterialTable
          tableRef={tableRef}
          icons={tableIcons}
          title={
            <Typography variant="h6" component="h1">
              {title}
            </Typography>
          }
          columns={columns ?? localColumns}
          onSelectionChange={handleColumnSelectionChange}
          data={fetchRemoteUsersData}
          options={{
            search: search,
            debounceInterval: 400,
            selection: selection,
            headerSelectionProps: {
              inputProps: { 'aria-label': 'Select All Rows' },
            },
            ...mtOptions,
            selectionProps: (rowdata: BasicUserDetails) => ({
              inputProps: {
                'aria-label': `${rowdata.firstname}-${rowdata.lastname}-${rowdata.institution}-select`,
              },
            }),
          }}
          actions={actionArray}
          editable={
            onRemove
              ? {
                  onRowDelete: (oldData) =>
                    new Promise<void>((resolve) => {
                      resolve();
                      (onRemove as FunctionType)(oldData);
                    }),
                  isDeletable: (rowData) => {
                    return (
                      getCurrentUser()?.user.id !== rowData.id || !preserveSelf
                    );
                  },
                }
              : {}
          }
          localization={{
            body: { emptyDataSourceMessage: 'No Users' },
            toolbar: {
              nRowsSelected: '{0} User(s) Selected',
              searchPlaceholder: 'Filter found users',
              searchTooltip: 'Filter found users',
            },
          }}
          components={{
            Toolbar:
              isEmailSearchEnabled && emailSearch
                ? EmailSearchBar
                : MTableToolbar,
          }}
        />
        {showInvitationButtons && (
          <ActionButtonContainer>
            {invitationButtons.map((item: InvitationButtonProps, i) => (
              <Button
                type="button"
                onClick={() => item.action()}
                data-cy={item['data-cy']}
                key={i}
              >
                {item.title}
              </Button>
            ))}
          </ActionButtonContainer>
        )}
      </Box>
    </Formik>
  );
};

export default PeopleTable;
