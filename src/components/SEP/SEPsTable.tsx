import Edit from '@material-ui/icons/Edit';
import React, { useContext, useState } from 'react';
import { Redirect, useHistory } from 'react-router';
import { useQueryParams } from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import SuperMaterialTable, {
  DefaultQueryParams,
  UrlQueryParamsType,
} from 'components/common/SuperMaterialTable';
import { UserContext } from 'context/UserContextProvider';
import { Sep, UserRole } from 'generated/sdk';
import { useSEPsData } from 'hooks/SEP/useSEPsData';
import { tableIcons } from 'utils/materialIcons';

import AddSEP from './General/AddSEP';

const SEPsTable: React.FC = () => {
  const { currentRole } = useContext(UserContext);
  const history = useHistory();
  const { loadingSEPs, SEPs, setSEPsWithLoading: setSEPs } = useSEPsData(
    '',
    false,
    currentRole as UserRole
  );
  const columns = [
    { title: 'Code', field: 'code' },
    { title: 'Description', field: 'description' },
    {
      title: 'Active',
      field: 'active',
      render: (rowData: Sep): string => (rowData.active ? 'Yes' : 'No'),
    },
  ];
  const [editSEPID, setEditSEPID] = useState(0);
  const [urlQueryParams, setUrlQueryParams] = useQueryParams<
    UrlQueryParamsType
  >(DefaultQueryParams);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  if (editSEPID) {
    return <Redirect push to={`/SEPPage/${editSEPID}`} />;
  }

  const EditIcon = (): JSX.Element => <Edit />;

  const createModal = (
    onUpdate: Function,
    onCreate: Function,
    editSep: Sep | null
  ) => {
    if (!!editSep) {
      setEditSEPID(editSep.id);

      return null;
    } else {
      return (
        <AddSEP
          close={(sepAdded: Sep | null | undefined) => {
            setTimeout(() => {
              history.push(`/SEPPage/${sepAdded?.id}`);
            });
          }}
        />
      );
    }
  };

  return (
    <div data-cy="SEPs-table">
      <SuperMaterialTable
        createModal={createModal}
        hasAccess={{
          update: false,
          create: isUserOfficer,
          remove: isUserOfficer,
        }}
        setData={setSEPs}
        icons={tableIcons}
        title={'Scientific evaluation panels'}
        columns={columns}
        data={SEPs}
        isLoading={loadingSEPs}
        options={{
          search: true,
          debounceInterval: 400,
        }}
        actions={[
          {
            icon: EditIcon,
            tooltip: 'Edit',
            onClick: (event, rowData): void =>
              setEditSEPID((rowData as Sep).id),
            position: 'row',
          },
        ]}
        urlQueryParams={urlQueryParams}
        setUrlQueryParams={setUrlQueryParams}
      />
    </div>
  );
};

export default SEPsTable;
