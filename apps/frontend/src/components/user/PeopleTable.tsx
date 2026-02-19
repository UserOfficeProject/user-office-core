import MaterialTableCore, {
  Options,
  Column,
  MTableToolbar,
  Query,
  QueryResult,
} from '@material-table/core';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Formik } from 'formik';
import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';

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
  PaginationSortDirection,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { setSortDirectionOnSortField } from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';
import { FunctionType } from 'utils/utilTypes';

type InvitationButtonProps = {
  title: string;
  action: FunctionType;
  'data-cy'?: string;
};

type BasicUserDetailsWithTableData = (BasicUserDetails & {
  tableData?: { checked: boolean };
})[];

type BasicUserDetailsWithRole = BasicUserDetails & {
  role?: Maybe<Pick<Role, 'id' | 'shortCode' | 'title'>>;
};

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
  selectedParticipants?: BasicUserDetails[];
  setSelectedParticipants?: React.Dispatch<
    React.SetStateAction<BasicUserDetails[]>
  >;
  persistUrlQueryParams?: boolean;
};

const localColumns = [
  { title: 'Firstname', field: 'firstname' },
  { title: 'Lastname', field: 'lastname' },
  { title: 'Preferred name', field: 'preferredname' },
  { title: 'Institution', field: 'institution' },
];

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
  emailSearch,
  isFreeAction,
  showInvitationButtons,
  columns,
  mtOptions,
  onRemove,
  search,
  title,
  persistUrlQueryParams = false,
}: PeopleTableProps) => {
  const [query, setQuery] = useState<{
    subtractUsers: number[];
    userRole: UserRole | null;
  }>({
    subtractUsers: selectedUsers ? selectedUsers : [],
    userRole: userRole ? userRole : null,
  });
  const featureContext = useContext(FeatureContext);
  const isEmailSearchEnabled = !!featureContext.featuresMap.get(
    FeatureId.EMAIL_SEARCH
  )?.isEnabled;

  const api = useDataApi();

  const [currentPageIds, setCurrentPageIds] = useState<number[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<BasicUserDetails[]>([]);
  const [tableEmails, setTableEmails] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const tableRef =
    React.createRef<MaterialTableCore<BasicUserDetailsFragment>>();

  const sortDirection = persistUrlQueryParams
    ? searchParams.get('sortDirection')
    : '';
  useEffect(() => {
    if (!data) {
      return;
    }

    setCurrentPageIds(data.map(({ id }) => id));
    tableRef.current && tableRef.current.onQueryChange({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.length]);

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

  const invitationButtons: InvitationButtonProps[] = [];

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
            preferredname: selectedItem.preferredname,
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
              preferredname: selectedItem.preferredname,
              lastname: selectedItem.lastname,
              institution: selectedItem.institution,
              institutionId: selectedItem.institutionId,
            },
          ] as BasicUserDetails[])
        : selectedParticipants.filter(({ id }) => id !== selectedItem.id)
    );
  };

  const fetchRemoteUsersData = (tableQuery: Query<BasicUserDetailsWithRole>) =>
    new Promise<QueryResult<BasicUserDetailsWithRole>>((resolve, reject) => {
      try {
        const [orderBy] = tableQuery.orderByCollection;
        api()
          .getUsers({
            first: tableQuery.pageSize,
            offset: tableQuery.page * tableQuery.pageSize,
            subtractUsers: query.subtractUsers,
            userRole: query.userRole,
            sortField: orderBy?.orderByField,
            sortDirection:
              orderBy?.orderDirection == PaginationSortDirection.ASC
                ? PaginationSortDirection.ASC
                : orderBy?.orderDirection == PaginationSortDirection.DESC
                  ? PaginationSortDirection.DESC
                  : undefined,
            searchText: tableQuery.search,
          })
          .then(({ users }) => {
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
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });

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
            setFieldError('email', 'User has already been added');

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
        <MaterialTable
          tableRef={tableRef}
          icons={tableIcons}
          title={
            <Typography variant="h6" component="h1">
              {title}
            </Typography>
          }
          columns={setSortDirectionOnSortField(
            columns ? columns : localColumns,
            persistUrlQueryParams ? searchParams.get('sortField') : '',
            sortDirection === PaginationSortDirection.ASC
              ? PaginationSortDirection.ASC
              : sortDirection === PaginationSortDirection.DESC
                ? PaginationSortDirection.DESC
                : undefined
          )}
          onSelectionChange={handleColumnSelectionChange}
          data={fetchRemoteUsersData}
          onPageChange={(page) => {
            persistUrlQueryParams &&
              setSearchParams((searchParams) => {
                searchParams.set('page', page.toString());

                return searchParams;
              });
          }}
          onRowsPerPageChange={(pageSize) => {
            persistUrlQueryParams &&
              setSearchParams((searchParams) => {
                searchParams.set('pageSize', pageSize.toString());
                searchParams.set('page', '0');

                return searchParams;
              });
          }}
          onSearchChange={(searchText) => {
            persistUrlQueryParams &&
              setSearchParams((searchParams) => {
                if (searchText) {
                  searchParams.set('search', searchText);
                  searchParams.set('page', '0');
                } else {
                  searchParams.delete('search');
                }

                return searchParams;
              });
          }}
          onOrderCollectionChange={(orderByCollection) => {
            const [orderBy] = orderByCollection;

            if (!orderBy) {
              persistUrlQueryParams &&
                setSearchParams((searchParams) => {
                  searchParams.delete('sortField');
                  searchParams.delete('sortDirection');

                  return searchParams;
                });
            } else {
              persistUrlQueryParams &&
                setSearchParams((searchParams) => {
                  searchParams.set('sortField', orderBy.orderByField);
                  searchParams.set('sortDirection', orderBy.orderDirection);

                  return searchParams;
                });
            }
          }}
          options={{
            search: search,
            searchText: persistUrlQueryParams
              ? searchParams.get('search') || undefined
              : undefined,
            debounceInterval: 400,
            selection: selection,
            headerSelectionProps: {
              inputProps: { 'aria-label': 'Select All Rows' },
            },
            pageSize:
              persistUrlQueryParams && searchParams.get('pageSize')
                ? +searchParams.get('pageSize')!
                : undefined,
            initialPage:
              persistUrlQueryParams && searchParams.get('page')
                ? +searchParams.get('page')!
                : 0,
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
                    return getCurrentUser()?.user.id !== rowData.id;
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
