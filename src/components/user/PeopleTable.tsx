import Button from '@material-ui/core/Button';
import Email from '@material-ui/icons/Email';
import makeStyles from '@material-ui/styles/makeStyles';
import MaterialTable, { Query, Options, Column } from 'material-table';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import { BasicUserDetails, GetUsersQuery, UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { tableIcons } from 'utils/materialIcons';

import { InviteUserForm } from './InviteUserForm';

function sendUserRequest(
  searchQuery: Query<any>,
  api: any,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  selectedUsers: number[] | undefined,
  userRole: UserRole | undefined,
  selectedParticipants: number[]
) {
  const variables = {
    filter: searchQuery.search,
    offset: searchQuery.pageSize * searchQuery.page,
    first: searchQuery.pageSize,
    subtractUsers: selectedUsers ? selectedUsers : [],
    userRole: userRole ? userRole : null,
  };

  setLoading(true);

  return api()
    .getUsers(variables)
    .then((data: GetUsersQuery) => {
      setLoading(false);

      return {
        page: searchQuery.page,
        totalCount: data?.users?.totalCount,
        data: data?.users?.users.map((user: BasicUserDetails) => {
          return {
            firstname: user.firstname,
            lastname: user.lastname,
            organisation: user.organisation,
            id: user.id,
            tableData: { checked: selectedParticipants.includes(user.id) },
          };
        }),
      };
    });
}

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
  onRemove?: (user: T) => void;
  onUpdate?: (user: T[]) => void;
  emailInvite?: boolean;
  invitationButtons?: { title: string; action: Function }[];
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

const PeopleTable = <T extends BasicUserDetails>(
  props: PeopleTableProps<T>
) => {
  const { isLoading } = props;
  const sendRequest = useDataApi();
  const [loading, setLoading] = useState(props.isLoading ?? false);
  const [pageSize, setPageSize] = useState(5);
  const [sendUserEmail, setSendUserEmail] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<T[]>([]);
  const [searchText, setSearchText] = useState('');
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
      onClick: (event: React.MouseEvent<JSX.Element>, rowData: any) =>
        action.fn(rowData),
    });
  props.emailInvite &&
    actionArray.push({
      icon: EmailIcon,
      isFreeAction: true,
      tooltip: 'Add by email',
      onClick: () => setSendUserEmail(true),
    });

  return (
    <div data-cy="co-proposers" className={classes.tableWrapper}>
      <MaterialTable
        icons={tableIcons}
        title={props.title}
        columns={props.columns ?? columns}
        onSelectionChange={(selectedItems, selectedItem) => {
          // when the user wants to (un)select all items
          // `selectedItem` will be undefined
          if (!selectedItem) {
            // first clear the current page because if any row was unselected
            // the (un)select all option will select every rows
            // which would result in duplicates
            setSelectedParticipants(selectedParticipants =>
              selectedParticipants.filter(
                ({ id }) => !currentPageIds.includes(id)
              )
            );

            if (selectedItems.length > 0) {
              setSelectedParticipants(selectedParticipants => [
                ...selectedParticipants,
                ...(selectedItems.map(selectedItem => ({
                  id: selectedItem.id,
                  firstname: selectedItem.firstname,
                  lastname: selectedItem.lastname,
                  organisation: selectedItem.organisation,
                })) as T[]),
              ]);
            }

            return;
          }

          setSelectedParticipants(selectedParticipants =>
            selectedItem.tableData.checked
              ? ([
                  ...selectedParticipants,
                  {
                    id: selectedItem.id,
                    firstname: selectedItem.firstname,
                    lastname: selectedItem.lastname,
                    organisation: selectedItem.organisation,
                  },
                ] as T[])
              : selectedParticipants.filter(({ id }) => id !== selectedItem.id)
          );
        }}
        data={
          props.data
            ? props.data
            : query => {
                if (searchText !== query.search) {
                  setSearchText(query.search);
                }

                setPageSize(query.pageSize);

                return sendUserRequest(
                  query,
                  sendRequest,
                  setLoading,
                  props.selectedUsers,
                  props.userRole,
                  selectedParticipants.map(({ id }) => id)
                ).then((users: any) => {
                  setCurrentPageIds(
                    users.data.map(({ id }: { id: number }) => id)
                  );

                  return users;
                });
              }
        }
        isLoading={loading}
        options={{
          search: props.search,
          debounceInterval: 400,
          pageSize,
          selection: props.selection,
          ...props.mtOptions,
        }}
        actions={actionArray}
        editable={
          props.onRemove
            ? {
                onRowDelete: oldData =>
                  new Promise<void>(resolve => {
                    resolve();
                    (props.onRemove as any)(oldData);
                  }),
              }
            : {}
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
      {props.invitationButtons && (
        <ActionButtonContainer>
          {props.invitationButtons?.map(
            (item: { title: string; action: Function }, i) => (
              <Button
                type="button"
                variant="contained"
                color="primary"
                onClick={() => item.action()}
                key={i}
              >
                {item.title}
              </Button>
            )
          )}
        </ActionButtonContainer>
      )}
    </div>
  );
};

PeopleTable.propTypes = {
  title: PropTypes.string,
  action: PropTypes.shape({
    fn: PropTypes.func.isRequired,
    actionIcon: PropTypes.element.isRequired,
    actionText: PropTypes.string.isRequired,
  }),
  selection: PropTypes.bool.isRequired,
  isFreeAction: PropTypes.bool,
  userRole: PropTypes.any,
  invitationUserRole: PropTypes.any,
  data: PropTypes.array,
  search: PropTypes.bool,
  onRemove: PropTypes.func,
  onUpdate: PropTypes.func,
  emailInvite: PropTypes.bool,
  invitationButtons: PropTypes.array,
  selectedUsers: PropTypes.array,
  mtOptions: PropTypes.object,
  isLoading: PropTypes.bool,
  columns: PropTypes.array,
};

export default PeopleTable;
