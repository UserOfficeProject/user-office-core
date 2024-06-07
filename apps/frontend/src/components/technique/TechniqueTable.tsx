import AssignmentInd from '@mui/icons-material/AssignmentInd';
import { Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryParams } from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import SuperMaterialTable, {
  DefaultQueryParams,
  UrlQueryParamsType,
} from 'components/common/SuperMaterialTable';
import { useTechniquesData } from 'hooks/technique/useTechniquesData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import AssignedInstrumentsTable from './AssignedInstrumentsTable';
import { TechniqueFragment, UserRole } from '../../generated/sdk';

const columns = [
  {
    title: 'Name',
    field: 'name',
  },
  {
    title: 'Short code',
    field: 'shortCode',
  },
  {
    title: 'Description',
    field: 'description',
  },
  {
    title: 'Instruments',
    field: 'instruments.length',
    emptyValue: '-',
  },
];

const TechniqueTable = () => {
  const {
    loadingTechniques,
    techniques,
    setTechniquesWithLoading: setTechniques,
  } = useTechniquesData();

  const { api } = useDataApiWithFeedback();
  const { t } = useTranslation();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const [urlQueryParams, setUrlQueryParams] =
    useQueryParams<UrlQueryParamsType>(DefaultQueryParams);

  const onTechniqueDelete = async (techniqueDeletedId: number | string) => {
    try {
      await api({
        toastSuccessMessage: t('instrument') + ' removed successfully!',
      }).deleteInstrument({
        id: techniqueDeletedId as number,
      });

      return true;
    } catch (error) {
      return false;
    }
  };

  const AssignmentIndIcon = (): JSX.Element => <AssignmentInd />;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function setAssigningTechniqueId(id: number): void {
    throw new Error('Function not implemented.');
  }

  const AssignedInstruments = React.useCallback(
    ({ rowData }) => {
      return <AssignedInstrumentsTable technique={rowData} />;
    },
    [setTechniques]
  );

  return (
    <>
      <div data-cy="techniques-table">
        <SuperMaterialTable
          delete={onTechniqueDelete}
          setData={setTechniques}
          hasAccess={{
            create: isUserOfficer,
            update: isUserOfficer,
            remove: isUserOfficer,
          }}
          title={
            <Typography variant="h6" component="h2">
              Techniques
            </Typography>
          }
          columns={columns}
          data={techniques}
          isLoading={loadingTechniques}
          detailPanel={[
            {
              tooltip: 'Show Instruments and Permissions',
              render: AssignedInstruments,
            },
          ]}
          options={{
            search: true,
            debounceInterval: 400,
          }}
          actions={
            isUserOfficer
              ? [
                  {
                    icon: AssignmentIndIcon,
                    tooltip: 'Assign instrument',
                    onClick: (_event: unknown, rowData: unknown): void =>
                      setAssigningTechniqueId(
                        (rowData as TechniqueFragment).id
                      ),
                  },
                ]
              : []
          }
          urlQueryParams={urlQueryParams}
          setUrlQueryParams={setUrlQueryParams}
        />
      </div>
    </>
  );
};

export default TechniqueTable;
