import PublishIcon from '@mui/icons-material/Publish';
import ShareIcon from '@mui/icons-material/Share';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useHistory } from 'react-router';
import { useQueryParams } from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import SuperMaterialTable, {
  DefaultQueryParams,
  UrlQueryParamsType,
} from 'components/common/SuperMaterialTable';
import { UserRole, Unit, SettingsId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useUnitsData } from 'hooks/settings/useUnitData';
import { downloadBlob } from 'utils/downloadBlob';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

import CreateUnit from './CreateUnit';

const columns = [
  { title: 'Quantity', field: 'quantity' },
  { title: 'Symbol', field: 'symbol' },
  { title: 'Unit', field: 'unit' },
];

const UnitTable: React.FC = () => {
  const { api } = useDataApiWithFeedback();
  const { toFormattedDateTime } = useFormattedDateTime({
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });
  const history = useHistory();
  const { loadingUnits, units, setUnitsWithLoading: setUnits } = useUnitsData();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const [urlQueryParams, setUrlQueryParams] =
    useQueryParams<UrlQueryParamsType>(DefaultQueryParams);

  const createModal = (
    onUpdate: FunctionType<void, [Unit | null]>,
    onCreate: FunctionType<void, [Unit | null]>,
    editUnit: Unit | null
  ) => (
    <CreateUnit unit={editUnit} close={(unit: Unit | null) => onCreate(unit)} />
  );

  const deleteUnit = async (id: string | number) => {
    return await api({ toastSuccessMessage: 'Unit deleted successfully' })
      .deleteUnit({ id: id as string })
      .then((resp) => resp.deleteUnit.rejection === null);
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
        title={
          <Typography variant="h6" component="h2">
            Units
          </Typography>
        }
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
        extraActionButtons={
          <>
            <Button
              startIcon={<PublishIcon />}
              type="button"
              onClick={() => {
                history.push('/ImportUnits');
              }}
              data-cy="import-units-button"
            >
              Import
            </Button>
            <Button
              startIcon={<ShareIcon />}
              type="button"
              onClick={() => {
                api()
                  .getUnitsAsJson()
                  .then((result) => {
                    if (!result.unitsAsJson) {
                      return;
                    }

                    const blob = new Blob([result.unitsAsJson], {
                      type: 'application/json;charset=utf8',
                    });
                    downloadBlob(blob, `units_${toFormattedDateTime()}.json`);
                  });
              }}
              data-cy="export-units-button"
            >
              Export
            </Button>
          </>
        }
      />
    </div>
  );
};

export default UnitTable;
