/* eslint-disable @typescript-eslint/no-explicit-any */
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Email from '@material-ui/icons/Email';
import makeStyles from '@material-ui/styles/makeStyles';
import MaterialTable, { Options, Column } from 'material-table';
import React, { useState, useEffect } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import {
  BasicUserDetails,
  GetUsersQueryVariables,
  UserRole,
} from 'generated/sdk';
import { useUsersData } from 'hooks/user/useUsersData';
import { tableIcons } from 'utils/materialIcons';
import { FunctionType } from 'utils/utilTypes';

import InviteUserForm from './InviteUserForm';

type InvitationButtonProps = {
  title: string;
  action: FunctionType;
  'data-cy'?: string;
};

type PeopleTableProps<T extends BasicUserDetails = BasicUserDetails> = {
  selection: boolean;
  isLoading?: boolean;
  title?: string;
  userRole?: UserRole;
  invitationUserRole?: UserRole;
  action?: {
    fn: (data: any) => void;
    actionIcon: JSX.Element;
    actionText: string;
  };
  isFreeAction?: boolean;
  data?: T[];
  search?: boolean;
  onRemove?: FunctionType<void, T>;
  onUpdate?: FunctionType<void, [any[]]>;
  emailInvite?: boolean;
  showInvitationButtons?: boolean;
  selectedUsers?: number[];
  mtOptions?: Options;
  columns?: Column<any>[];
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
});

const columns = [
  { title: 'Name', field: 'firstname' },
  { title: 'Surname', field: 'lastname' },
  { title: 'Organisation', field: 'organisation' },
];

const getTitle = (invitationUserRole?: UserRole): string => {
  switch (invitationUserRole) {
    case UserRole.USER_OFFICER:
      return 'Invite User';
    case UserRole.SEP_CHAIR:
      return 'Invite SEP Chair';
    case UserRole.SEP_SECRETARY:
      return 'Invite SEP Secretary';
    case UserRole.INSTRUMENT_SCIENTIST:
      return 'Invite Instrument Scientist';
    default:
      return 'Invite User';
  }
};

const PeopleTable: React.FC<PeopleTableProps> = (props) => {
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
  const { isLoading } = props;
  const { usersData, loadingUsersData } = useUsersData(query);
  const [loading, setLoading] = useState(props.isLoading ?? false);
  const [sendUserEmail, setSendUserEmail] = useState(false);
  const [inviteUserModal, setInviteUserModal] = useState({
    show: false,
    title: '',
    userRole: UserRole.USER,
  });
  const [selectedParticipants, setSelectedParticipants] = useState<
    BasicUserDetails[]
  >([]);
  const [currentPageIds, setCurrentPageIds] = useState<number[]>([]);

  const classes = useStyles();

  const { data, action } = props;

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

  if (sendUserEmail && props.invitationUserRole && action) {
    return (
      <InviteUserForm
        title={getTitle(props.invitationUserRole)}
        action={action.fn}
        close={() => setSendUserEmail(false)}
        userRole={props.invitationUserRole}
      />
    );
  }
  const EmailIcon = (): JSX.Element => <Email />;

  const actionArray = [];
  action &&
    !props.selection &&
    actionArray.push({
      icon: () => action.actionIcon,
      isFreeAction: props.isFreeAction,
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

  const invitationButtons: InvitationButtonProps[] = [];

  if (props.showInvitationButtons) {
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
            userRole: UserRole.SEP_REVIEWER,
          }),
        'data-cy': 'invite-reviewer-button',
      }
    );
  }

  return (
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
            {props.title}
          </Typography>
        }
        page={query.offset as number}
        columns={props.columns ?? columns}
        onSelectionChange={(selectedItems, selectedItem) => {
          // when the user wants to (un)select all items
          // `selectedItem` will be undefined
          if (!selectedItem) {
            // first clear the current page because if any row was unselected
            // the (un)select all option will select every rows
            // which would result in duplicates
            setSelectedParticipants((selectedParticipants) =>
              selectedParticipants.filter(
                ({ id }) => !currentPageIds.includes(id)
              )
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
            (selectedItem as BasicUserDetails & {
              tableData: { checked: boolean };
            }).tableData.checked
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
        }}
        data={props.data || usersData.users}
        totalCount={usersData.totalCount}
        isLoading={loading || loadingUsersData}
        options={{
          search: props.search,
          debounceInterval: 400,
          pageSize: query.first as number,
          selection: props.selection,
          ...props.mtOptions,
        }}
        actions={actionArray}
        editable={
          props.onRemove
            ? {
                onRowDelete: (oldData) =>
                  new Promise<void>((resolve) => {
                    resolve();
                    (props.onRemove as FunctionType)(oldData);
                    setQuery({ ...query, refreshData: !query.refreshData });
                  }),
              }
            : {}
        }
        onChangePage={(page) =>
          setQuery({ ...query, offset: page * (query.first as number) })
        }
        onSearchChange={(search) => setQuery({ ...query, filter: search })}
        onChangeRowsPerPage={(rowsPerPage) =>
          setQuery({ ...query, first: rowsPerPage })
        }
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
        </ActionButtonContainer>
      )}
      {props.showInvitationButtons && (
        <ActionButtonContainer>
          {invitationButtons.map((item: InvitationButtonProps, i) => (
            <Button
              type="button"
              variant="contained"
              color="primary"
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
  );
};

export default PeopleTable;
