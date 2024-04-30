import { Options, Column, MTableToolbar } from '@material-table/core';
import Email from '@mui/icons-material/Email';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import makeStyles from '@mui/styles/makeStyles';
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
  GetUsersQueryVariables,
  Role,
  UserRole,
  Maybe,
  getSdk,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { useUsersData } from 'hooks/user/useUsersData';
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
  mobileUpdateButton: {
    paddingBottom: '10px',
  },
});

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
  t: TFunction<'translation', undefined, 'translation'>;
  invitationUserRole?: UserRole;
}): string => {
  switch (invitationUserRole) {
    case UserRole.USER_OFFICER:
      return 'Invite User';
    case UserRole.FAP_CHAIR:
      return 'Invite Fap Chair';
    case UserRole.FAP_SECRETARY:
      return 'Invite Fap Secretary';
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
  query: GetUsersQueryVariables,
  totalCount: number
) => {
  if (query.offset == 0) {
    // update users array to remove any invitedUsers. We re-add them so that they appear at the top of the list
    // this helps users find someone in the list even if they are already there

    const invitedUsersFiltered = invitedUsers.filter((user) =>
      query.filter
        ? user.firstname.toLowerCase().includes(query.filter?.toLowerCase()) ||
          user.lastname.toLowerCase().includes(query.filter?.toLowerCase()) ||
          user.institution.toLowerCase().includes(query.filter?.toLowerCase())
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
  isLoading,
  data,
  action,
  emailInvite,
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
  const [query, setQuery] = useState<
    GetUsersQueryVariables & { refreshData: boolean }
  >({
    offset: 0,
    first: 10,
    filter: '',
    orderBy: '',
    orderDirection: '',
    subtractUsers: selectedUsers ? selectedUsers : [],
    userRole: userRole ? userRole : null,
    refreshData: false,
  });
  const featureContext = useContext(FeatureContext);
  const isEmailInviteEnabled = !!featureContext.featuresMap.get(
    FeatureId.EMAIL_INVITE
  )?.isEnabled;
  const isEmailSearchEnabled = !!featureContext.featuresMap.get(
    FeatureId.EMAIL_SEARCH
  )?.isEnabled;

  const api = useDataApi();
  const { usersData, loadingUsersData } = useUsersData(query);
  const [loading, setLoading] = useState(isLoading ?? false);
  const [sendUserEmail, setSendUserEmail] = useState(false);
  const [inviteUserModal, setInviteUserModal] = useState({
    show: false,
    title: '',
    userRole: UserRole.USER,
  });
  const [currentPageIds, setCurrentPageIds] = useState<number[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<BasicUserDetails[]>([]);
  const [tableEmails, setTableEmails] = useState<string[]>([]);

  const classes = useStyles();
  const { t } = useTranslation();

  useEffect(() => {
    if (isLoading !== undefined) {
      setLoading(isLoading);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!data) {
      return;
    }

    setCurrentPageIds(data.map(({ id }) => id));
  }, [data]);

  useEffect(() => {
    if (!usersData.users) {
      return;
    }

    setCurrentPageIds(usersData.users.map(({ id }) => id));
  }, [usersData]);

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
          setQuery({ ...query, refreshData: !query.refreshData });
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

  const handleColumnOrderChange = (
    orderedColumnId: number,
    orderDirection: 'desc' | 'asc'
  ) => {
    if (
      localColumns[orderedColumnId] &&
      query.first &&
      query.first < usersData.totalCount
    ) {
      setQuery((queryParams) => ({
        ...queryParams,
        orderBy:
          orderedColumnId >= 0
            ? localColumns[orderedColumnId].field
            : undefined,
        orderDirection: orderDirection ? orderDirection : undefined,
      }));
    }
  };

  const usersTableData = getUsersTableData(
    data || usersData?.users,
    selectedParticipants || [],
    invitedUsers,
    query,
    data?.length || usersData.totalCount
  );

  const currentPage = (query.offset as number)
    ? ((query.offset as number) + invitedUsers.length) / (query.first as number)
    : 0;

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
            setFieldError('email', 'No user found for the given email');
            setLoading(false);

            return;
          }

          if (selectedUsers?.includes(userDetails.id)) {
            setFieldError('email', 'User is already on the proposal');
            setLoading(false);

            return;
          }

          if (invitedUsers.every((user) => user.id !== userDetails.id)) {
            //Add users to the table
            setInvitedUsers([userDetails].concat(invitedUsers));
            setTableEmails(tableEmails.concat([values.email]));
            setFieldValue('email', '');

            //If we are selecting multiple users add the user as pre selected.
            if (selection)
              setSelectedParticipants?.(
                selectedParticipants?.concat([userDetails]) || []
              );

            setQuery({
              ...query,
              refreshData: !query.refreshData,
              subtractUsers: (query.subtractUsers as number[]).concat(
                userDetails.id
              ),
              offset: 0,
            });
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
      <div data-cy="co-proposers" className={classes.tableWrapper}>
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
                  setQuery({ ...query, refreshData: !query.refreshData });
                }
              }}
            />
          </DialogContent>
        </Dialog>
        <MaterialTable
          icons={tableIcons}
          title={
            <Typography variant="h6" component="h1">
              {title}
            </Typography>
          }
          page={currentPage}
          columns={columns ?? localColumns}
          onSelectionChange={handleColumnSelectionChange}
          onOrderChange={handleColumnOrderChange}
          data={usersTableData.users}
          totalCount={usersTableData.totalCount + invitedUsers.length}
          isLoading={loading || loadingUsersData}
          options={{
            search: search,
            debounceInterval: 400,
            pageSize: query.first as number,
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
                      setQuery({ ...query, refreshData: !query.refreshData });
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
          onPageChange={(page) =>
            setQuery({
              ...query,
              offset: Math.max(
                page * (query.first as number) - invitedUsers.length,
                0
              ),
            })
          }
          onSearchChange={(search) => setQuery({ ...query, filter: search })}
          onRowsPerPageChange={(rowsPerPage) =>
            setQuery({ ...query, first: rowsPerPage })
          }
          components={{
            Toolbar: isEmailSearchEnabled ? EmailSearchBar : MTableToolbar,
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
      </div>
    </Formik>
  );
};

export default PeopleTable;
