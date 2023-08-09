import { Column } from '@material-table/core';
import Edit from '@mui/icons-material/Edit';
import { Typography } from '@mui/material';
import i18n from 'i18n';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useHistory } from 'react-router';
import { useQueryParams } from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import CopyToClipboard from 'components/common/CopyToClipboard';
import SuperMaterialTable, {
  DefaultQueryParams,
  UrlQueryParamsType,
} from 'components/common/SuperMaterialTable';
import { UserContext } from 'context/UserContextProvider';
import { Sep, UserRole } from 'generated/sdk';
import { useSEPsData } from 'hooks/SEP/useSEPsData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

import AddSEP from './General/AddSEP';
import SEPStatusFilter, {
  SEPStatusQueryFilter,
  defaultSEPStatusQueryFilter,
  SEPStatus,
} from './SEPStatusFilter';

const columns: Column<Sep>[] = [
  {
    title: 'Code',
    field: 'code',
    render: (rawData) => (
      <CopyToClipboard
        text={rawData.code}
        successMessage={`'${rawData.code}' copied to clipboard`}
        position="right"
      >
        {rawData.code || ''}
      </CopyToClipboard>
    ),
  },
  { title: 'Description', field: 'description' },
  {
    title: 'Active',
    field: 'active',
    lookup: { true: 'Yes', false: 'No' },
  },
  {
    title: '# proposals',
    field: 'proposalCount',
  },
];

const SEPsTable = () => {
  const { currentRole } = useContext(UserContext);
  const { api } = useDataApiWithFeedback();
  const [isActiveFilter, setIsActiveFilter] = useState<undefined | boolean>(
    true
  );
  const history = useHistory();
  const { t } = useTranslation();
  const {
    loadingSEPs,
    SEPs,
    setSEPsWithLoading: setSEPs,
  } = useSEPsData({
    filter: '',
    active: isActiveFilter,
    role: currentRole as UserRole,
  });
  const [editSEPID, setEditSEPID] = useState(0);

  const [urlQueryParams, setUrlQueryParams] = useQueryParams<
    UrlQueryParamsType & SEPStatusQueryFilter
  >({
    ...DefaultQueryParams,
    sepStatus: defaultSEPStatusQueryFilter,
  });
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const handleStatusFilterChange = (sepStatus: SEPStatus) => {
    setUrlQueryParams((queries) => ({ ...queries, sepStatus }));
    if (sepStatus === SEPStatus.ALL) {
      setIsActiveFilter(undefined);
    } else {
      setIsActiveFilter(sepStatus === SEPStatus.ACTIVE ? true : false);
    }
  };

  if (editSEPID) {
    return <Redirect push to={`/SEPPage/${editSEPID}`} />;
  }

  const EditIcon = (): JSX.Element => <Edit />;

  const deleteSEP = async (id: number | string) => {
    try {
      await api({
        toastSuccessMessage: t('SEP') + ' deleted successfully',
      }).deleteSEP({
        id: id as number,
      });

      const newObjectsArray = SEPs.filter((objectItem) => objectItem.id !== id);
      setSEPs(newObjectsArray);

      return true;
    } catch (error) {
      return false;
    }
  };

  const createModal = (
    onUpdate: FunctionType<void, [Sep | null]>,
    onCreate: FunctionType<void, [Sep | null]>,
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
      <SEPStatusFilter
        sepStatus={urlQueryParams.sepStatus}
        onChange={handleStatusFilterChange}
      />
      <SuperMaterialTable
        createModal={createModal}
        hasAccess={{
          update: false,
          create: isUserOfficer,
          remove: isUserOfficer,
        }}
        setData={setSEPs}
        icons={tableIcons}
        title={
          <Typography variant="h6" component="h2">
            {`${i18n.format(t('Scientific evaluation panel'), 'plural')}`}
          </Typography>
        }
        columns={columns}
        data={SEPs}
        delete={deleteSEP}
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
