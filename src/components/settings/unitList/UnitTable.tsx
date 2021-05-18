import React from 'react';
import { useQueryParams } from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import SuperMaterialTable, {
  DefaultQueryParams,
  UrlQueryParamsType,
} from 'components/common/SuperMaterialTable';
import { UserRole, Unit } from 'generated/sdk';
import { useUnitsData } from 'hooks/settings/useUnitData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

import CreateUnit from './CreateUnit';

const UnitTable: React.FC = () => {
  const { api } = useDataApiWithFeedback();
  const { loadingUnits, units, setUnitsWithLoading: setUnits } = useUnitsData();
  const columns = [{ title: 'Unit', field: 'name' }];
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const [
    urlQueryParams,
    setUrlQueryParams,
  ] = useQueryParams<UrlQueryParamsType>(DefaultQueryParams);

  const createModal = (
    onUpdate: FunctionType<void, [Unit | null]>,
    onCreate: FunctionType<void, [Unit | null]>,
    editUnit: Unit | null
  ) => (
    <CreateUnit unit={editUnit} close={(unit: Unit | null) => onCreate(unit)} />
  );

  const deleteUnit = async (id: number | string) => {
    return await api('Unit deleted successfully')
      .deleteUnit({
        id: id as number,
      })
      .then((resp) => {
        if (!resp.deleteUnit.rejection) {
          const newObjectsArray = units.filter(
            (objectItem) => objectItem.id !== id
          );
          setUnits(newObjectsArray);

          return true;
        } else {
          return false;
        }
      });
  };

  return (
    <div data-cy="unit-table">
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
        delete={deleteUnit}
      />
    </div>
  );
};

export default UnitTable;
