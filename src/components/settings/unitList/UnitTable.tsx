import Delete from '@material-ui/icons/DeleteOutline';
import React, { useState } from 'react';
import { useQueryParams } from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import DialogConfirmation from 'components/common/DialogConfirmation';
import SuperMaterialTable, {
  DefaultQueryParams,
  UrlQueryParamsType,
} from 'components/common/SuperMaterialTable';
import { UserRole, Unit } from 'generated/sdk';
import { useUnitsData } from 'hooks/settings/useUnitData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import CreateUnit from './CreateUnit';

const UnitTable: React.FC = () => {
  const { api } = useDataApiWithFeedback();
  const { loadingUnits, units, setUnitsWithLoading: setUnits } = useUnitsData();
  const [unitToRemove, setUnitToRemove] = useState<Unit | null>(null);
  const columns = [{ title: 'Unit', field: 'name' }];
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const [urlQueryParams, setUrlQueryParams] = useQueryParams<
    UrlQueryParamsType
  >(DefaultQueryParams);

  const createModal = (
    onUpdate: Function,
    onCreate: Function,
    editUnit: Unit | null
  ) => (
    <CreateUnit unit={editUnit} close={(unit: Unit | null) => onCreate(unit)} />
  );

  const deleteUnit = async (id: number) => {
    return await api('Unit deleted successfully')
      .deleteUnit({
        id: id,
      })
      .then(resp => {
        if (!resp.deleteUnit.error) {
          const newObjectsArray = units.filter(
            objectItem => objectItem.id !== id
          );
          setUnits(newObjectsArray);
        }
      });
  };

  return (
    <div data-cy="unit-table">
      <DialogConfirmation
        title="Remove unit"
        text="Are you sure you want to remove this unit?"
        open={!!unitToRemove}
        action={() => deleteUnit((unitToRemove as Unit).id)}
        handleOpen={() => setUnitToRemove(null)}
      />
      <SuperMaterialTable
        createModal={createModal}
        hasAccess={{
          update: false,
          create: isUserOfficer,
          remove: isUserOfficer,
        }}
        setData={setUnits}
        icons={tableIcons}
        title={'Units'}
        columns={columns}
        data={units}
        isLoading={loadingUnits}
        options={{
          search: true,
          debounceInterval: 400,
        }}
        urlQueryParams={urlQueryParams}
        setUrlQueryParams={setUrlQueryParams}
        actions={[
          rowActionData => {
            return {
              icon: Delete,
              tooltip: 'Delete',
              onClick: (event, rowData) => setUnitToRemove(rowData as Unit),
            };
          },
        ]}
      />
    </div>
  );
};

export default UnitTable;
