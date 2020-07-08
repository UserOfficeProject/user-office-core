import Button from '@material-ui/core/Button';
import { Email } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import MaterialTable, { MTableToolbar, Query } from 'material-table';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { UserRole, GetUsersQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/useDataApi';
import { BasicUserDetails } from 'models/User';
import { tableIcons } from 'utils/materialIcons';

import { InviteUserForm } from './InviteUserForm';

function sendUserRequest(
  searchQuery: Query<any>,
  api: any,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  selectedUsers: number[] | undefined,
  userRole: UserRole | undefined
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
          };
        }),
      };
    });
}

type PeopleTableProps = {
  title: string;
  userRole?: UserRole;
  invitationUserRole?: UserRole;
  actionIcon: JSX.Element;
  actionText: string;
  action: (data: any) => void;
  isFreeAction?: boolean;
  data?: BasicUserDetails[];
  search?: boolean;
  onRemove?: (user: BasicUserDetails) => void;
  emailInvite?: boolean;
  selectedUsers?: number[];
  menuItems?: any[];
};

const PeopleTable: React.FC<PeopleTableProps> = props => {
  const sendRequest = useDataApi();
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(5);
  const [sendUserEmail, setSendUserEmail] = useState(false);
  const columns = [
    { title: 'Name', field: 'firstname' },
    { title: 'Surname', field: 'lastname' },
    { title: 'Organisation', field: 'organisation' },
  ];

  const classes = makeStyles({
    tableWrapper: {
      '& .MuiToolbar-gutters': {
        paddingLeft: '0',
      },
    },
  })();

  const getTitle = (): string => {
    switch (props.invitationUserRole) {
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

  if (sendUserEmail && props.invitationUserRole) {
    return (
      <InviteUserForm
        title={getTitle()}
        action={props.action}
        close={() => setSendUserEmail(false)}
        userRole={props.invitationUserRole}
      />
    );
  }
  const EmailIcon = (): JSX.Element => <Email />;
  const actionArray = [];

  const ToolbarElement = (data: any) => (
    <div>
      <MTableToolbar {...data} />
      {props.menuItems?.map((item: any, i) => (
        <Button variant="outlined" onClick={() => item.action()} key={i}>
          {item.title}
        </Button>
      ))}
    </div>
  );

  props.action &&
    actionArray.push({
      icon: () => props.actionIcon,
      isFreeAction: props.isFreeAction,
      tooltip: props.actionText,
      onClick: (event: any, rowData: any) => props.action(rowData),
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
        columns={columns}
        components={{
          Toolbar: ToolbarElement,
        }}
        data={
          props.data
            ? props.data
            : query => {
                setPageSize(query.pageSize);

                return sendUserRequest(
                  query,
                  sendRequest,
                  setLoading,
                  props.selectedUsers,
                  props.userRole
                );
              }
        }
        isLoading={loading}
        options={{
          search: props.search,
          debounceInterval: 400,
          pageSize,
        }}
        actions={actionArray}
        editable={
          props.onRemove
            ? {
                onRowDelete: oldData =>
                  new Promise(resolve => {
                    resolve();
                    (props.onRemove as any)(oldData);
                  }),
              }
            : {}
        }
      />
    </div>
  );
};

PeopleTable.propTypes = {
  title: PropTypes.string.isRequired,
  actionIcon: PropTypes.element.isRequired,
  actionText: PropTypes.string.isRequired,
  action: PropTypes.func.isRequired,
  isFreeAction: PropTypes.bool,
  userRole: PropTypes.any,
  invitationUserRole: PropTypes.any,
  data: PropTypes.array,
  search: PropTypes.bool,
  onRemove: PropTypes.func,
  emailInvite: PropTypes.bool,
  selectedUsers: PropTypes.array,
  menuItems: PropTypes.array,
};

export default PeopleTable;
