import { Column } from '@material-table/core';
import { Dialog, DialogContent, Typography } from '@mui/material';
import i18n from 'i18n';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryParams } from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import ScienceIcon from 'components/common/icons/ScienceIcon';
import SuperMaterialTable, {
  DefaultQueryParams,
  UrlQueryParamsType,
} from 'components/common/SuperMaterialTable';
import { useTechniquesData } from 'hooks/technique/useTechniquesData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

import AssignedInstrumentsTable from './AssignedInstrumentsTable';
import AssignInstrumentsToTechniques from './AssignInstrumentsToTechniques';
import CreateUpdateTechnique from './CreateUpdateTechnique';
import {
  InstrumentFragment,
  TechniqueFragment,
  UserRole,
} from '../../generated/sdk';

const TechniqueTable = () => {
  const {
    loadingTechniques,
    techniques,
    setTechniquesWithLoading: setTechniques,
  } = useTechniquesData();

  const { api } = useDataApiWithFeedback();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const [urlQueryParams, setUrlQueryParams] =
    useQueryParams<UrlQueryParamsType>(DefaultQueryParams);

  const [openTechniqueAssignment, setOpenTechniqueAssignment] = useState(false);
  const [selectedTechnique, setSelectedTechnique] =
    useState<TechniqueFragment | null>(null);

  const { t } = useTranslation();

  const columns: Column<TechniqueFragment>[] = [
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
      title: i18n.format(t('instrument'), 'plural'),
      render: (data) => data.instruments.length,
    },
  ];

  const onTechniqueDelete = async (techniqueDeletedId: number | string) => {
    try {
      await api({
        toastSuccessMessage: t('Technique') + ' deleted successfully!',
      }).deleteTechnique({
        id: techniqueDeletedId as number,
      });

      return true;
    } catch (error) {
      return false;
    }
  };

  const AssignmentIndIcon = (): JSX.Element => <ScienceIcon />;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function setAssigningTechniqueId(technique: TechniqueFragment): void {
    setSelectedTechnique(technique);
    setOpenTechniqueAssignment(true);
  }

  const assignInstrumentsToTechniques = async (
    instruments: InstrumentFragment[]
  ): Promise<void> => {
    if (selectedTechnique) {
      const techniqueId = selectedTechnique.id;
      if (instruments?.length) {
        await api({
          toastSuccessMessage:
            t('instrument') +
            '/s assigned to the selected ' +
            i18n.format(t('Technique'), 'lowercase') +
            ' successfully!',
        })
          .assignInstrumentsToTechnique({
            instrumentIds: instruments.map((instrument) => instrument.id),
            techniqueId,
          })
          .then(() => {
            setTechniques((techniques) =>
              techniques.map((techniqueItem) => {
                if (techniqueItem.id === techniqueId) {
                  return {
                    ...techniqueItem,
                    instruments: [...techniqueItem.instruments, ...instruments],
                  };
                }

                return techniqueItem;
              })
            );
          });
      }
    }
  };

  const AssignedInstruments = React.useCallback(({ rowData }) => {
    return <AssignedInstrumentsTable technique={rowData} />;
  }, []);

  const removeIntrumentsFromTechnique = async (
    instrumentIds: number[]
  ): Promise<void> => {
    if (selectedTechnique) {
      const techniqueId = selectedTechnique.id;
      if (instrumentIds?.length) {
        await api({
          toastSuccessMessage:
            t('instrument') +
            '/s removed from selected ' +
            i18n.format(t('Technique'), 'lowercase') +
            ' successfully!',
        })
          .removeInstrumentsFromTechnique({
            instrumentIds,
            techniqueId,
          })
          .then(() => {
            setTechniques((techniques) =>
              techniques.map((techniqueItem) => {
                if (techniqueItem.id === techniqueId) {
                  return {
                    ...techniqueItem,
                    instruments: techniqueItem.instruments.filter(
                      (instrument) =>
                        !instrumentIds.find((id) => id === instrument.id)
                    ),
                  };
                }

                return techniqueItem;
              })
            );
          });
      }
    }
  };

  const createModal = (
    onUpdate: FunctionType<void, [TechniqueFragment | null]>,
    onCreate: FunctionType<void, [TechniqueFragment | null]>,
    editTechnique: TechniqueFragment | null
  ) => (
    <CreateUpdateTechnique
      technique={editTechnique}
      close={(technique: TechniqueFragment | null) =>
        !!editTechnique ? onUpdate(technique) : onCreate(technique)
      }
    />
  );

  return (
    <>
      <Dialog
        aria-labelledby="instrument-select-title"
        aria-describedby="instrument-select-description"
        open={openTechniqueAssignment}
        onClose={(): void => setOpenTechniqueAssignment(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <AssignInstrumentsToTechniques
            assignInstrumentsToTechniques={assignInstrumentsToTechniques}
            close={(): void => setOpenTechniqueAssignment(false)}
            currentlyAssignedInstrumentIds={(
              selectedTechnique?.instruments || []
            ).map((instrument) => instrument.id)}
            removeIntrumentsFromTechnique={removeIntrumentsFromTechnique}
          />
        </DialogContent>
      </Dialog>
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
              {i18n.format(t('Technique'), 'plural')}
            </Typography>
          }
          columns={columns}
          data={techniques}
          isLoading={loadingTechniques}
          detailPanel={[
            {
              tooltip:
                'Show ' +
                i18n.format(
                  i18n.format(t('instrument'), 'plural'),
                  'lowercase'
                ) +
                ' and permissions',
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
                    tooltip:
                      'Assign/remove ' +
                      i18n.format(
                        i18n.format(t('instrument'), 'plural'),
                        'lowercase'
                      ),
                    onClick: (_event: unknown, rowData: unknown): void =>
                      setAssigningTechniqueId(rowData as TechniqueFragment),
                  },
                ]
              : []
          }
          urlQueryParams={urlQueryParams}
          setUrlQueryParams={setUrlQueryParams}
          createModal={createModal}
        />
      </div>
    </>
  );
};

export default TechniqueTable;
