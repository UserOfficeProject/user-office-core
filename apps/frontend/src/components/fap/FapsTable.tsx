import { Column } from '@material-table/core';
import Edit from '@mui/icons-material/Edit';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';

import CopyToClipboard from 'components/common/CopyToClipboard';
import SuperMaterialTable from 'components/common/SuperMaterialTable';
import FapStatusFilter, { FapStatus } from 'components/fap/FapStatusFilter';
import AddFap from 'components/fap/General/AddFap';
import { UserContext } from 'context/UserContextProvider';
import { Fap, UserRole } from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { useFapsData } from 'hooks/fap/useFapsData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

const columns: Column<Fap>[] = [
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
    field: 'proposalCurrentCount',
  },
];

const FapsTable = () => {
  const { currentRole } = useContext(UserContext);
  const { api } = useDataApiWithFeedback();
  const [isActiveFilter, setIsActiveFilter] = useState<undefined | boolean>(
    true
  );
  const navigate = useNavigate();
  const {
    loadingFaps,
    faps,
    setFapsWithLoading: setFaps,
  } = useFapsData({
    filter: '',
    active: isActiveFilter,
    role: currentRole as UserRole,
  });
  const [editFapID, setEditFapID] = useState(0);

  const [searchParam, setSearchParam] = useSearchParams();
  const fapStatus = searchParam.get('fapStatus');

  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const { t } = useTranslation();

  const handleStatusFilterChange = (fapStatus: FapStatus) => {
    setSearchParam((searchParam) => {
      searchParam.set('fapStatus', fapStatus);

      return searchParam;
    });
    if (fapStatus === FapStatus.ALL) {
      setIsActiveFilter(undefined);
    } else {
      setIsActiveFilter(fapStatus === FapStatus.ACTIVE ? true : false);
    }
  };

  if (editFapID) {
    return <Navigate to={`/FapPage/${editFapID}`} />;
  }

  const EditIcon = (): JSX.Element => <Edit />;

  const deleteFap = async (id: number | string) => {
    try {
      await api({
        toastSuccessMessage: `${t('Fap')} deleted successfully`,
      }).deleteFap({
        id: id as number,
      });

      const newObjectsArray = faps.filter((objectItem) => objectItem.id !== id);
      setFaps(newObjectsArray);

      return true;
    } catch (error) {
      return false;
    }
  };

  const createModal = (
    onUpdate: FunctionType<void, [Fap | null]>,
    onCreate: FunctionType<void, [Fap | null]>,
    editFap: Fap | null
  ) => {
    if (!!editFap) {
      setEditFapID(editFap.id);

      return null;
    } else {
      return (
        <AddFap
          close={(fapAdded: Fap | null | undefined) => {
            setTimeout(() => {
              navigate(`/FapPage/${fapAdded?.id}`);
            });
          }}
        />
      );
    }
  };

  return (
    <div data-cy="Faps-table">
      <Grid container spacing={2}>
        <Grid item sm={3} xs={12}>
          <FapStatusFilter
            fapStatus={fapStatus || FapStatus.ACTIVE}
            onChange={handleStatusFilterChange}
          />
        </Grid>
      </Grid>
      <SuperMaterialTable
        createModal={createModal}
        hasAccess={{
          update: false,
          create: isUserOfficer,
          remove: isUserOfficer,
        }}
        setData={setFaps}
        icons={tableIcons}
        title={
          <Typography variant="h6" component="h2">
            {t('Facility access panel')}s
          </Typography>
        }
        columns={columns}
        data={faps}
        delete={deleteFap}
        isLoading={loadingFaps}
        options={{
          search: true,
          debounceInterval: 400,
        }}
        actions={[
          {
            icon: EditIcon,
            tooltip: 'Edit',
            onClick: (event, rowData): void =>
              setEditFapID((rowData as Fap).id),
            position: 'row',
          },
        ]}
        persistUrlQueryParams={true}
      />
    </div>
  );
};

export default FapsTable;
