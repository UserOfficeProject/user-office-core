import AssignmentInd from '@mui/icons-material/AssignmentInd';
import { Dialog, DialogContent, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryParams } from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import SuperMaterialTable, {
  DefaultQueryParams,
  UrlQueryParamsType,
} from 'components/common/SuperMaterialTable';
import { useTechniquesData } from 'hooks/technique/useTechniquesData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

import AssignedInstrumentsTable from './AssignedInstrumentsTable';
<<<<<<< Updated upstream
import AssignInstrumentsToTechniques from './AssignInstrumentsToTechniques';
import {
  InstrumentFragment,
  TechniqueFragment,
  UserRole,
} from '../../generated/sdk';
=======
import CreateUpdateTechnique from './CreateUpdateTechnique';
import { TechniqueFragment, UserRole } from '../../generated/sdk';
>>>>>>> Stashed changes

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

  const [openInstrumentAssignment, setOpenInstrumentAssignment] =
    useState(false);
  const [selectedTechniques, setSelectedTechniques] = useState<
    TechniqueFragment[]
  >([]);

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
  function setAssigningTechniqueId(technique: TechniqueFragment): void {
    const techniqueList: TechniqueFragment[] = [];
    techniqueList.push(technique);
    setSelectedTechniques(techniqueList);
    setOpenInstrumentAssignment(true);
  }

  const assignInstrumentsToTechniques = async (
    instruments: InstrumentFragment[]
  ): Promise<void> => {
    const techniqueId = selectedTechniques[0].id;
    if (instruments?.length) {
      await api({
        toastSuccessMessage: `Instrument/s assigned to the selected technique successfully!`,
      }).assignInstrumentsToTechnique({
        instrumentIds: instruments.map((instrument) => instrument.id),
        techniqueId,
      });
    }
    setTechniques((techniques) =>
      techniques.map((techniqueItem) => {
        if (techniqueItem.id === techniqueId) {
          return {
            ...techniqueItem,
            instruments: [...techniqueItem.instruments, ...instruments],
          };
        } else {
          return techniqueItem;
        }
      })
    );
  };

  const AssignedInstruments = React.useCallback(
    ({ rowData }) => {
      return <AssignedInstrumentsTable technique={rowData} />;
    },
    [setTechniques]
  );

<<<<<<< Updated upstream
  const removeIntrumentsFromTechnique = async (
    instrumentIds: number[]
  ): Promise<void> => {
    const techniqueId = selectedTechniques[0].id;
    if (instrumentIds?.length) {
      instrumentIds.forEach(async (instrumentId) => {
        await api({
          toastSuccessMessage: `Instrument/s unassigned from selected technique successfully!`,
        }).removeInstrumentFromTechnique({
          instrumentId,
          techniqueId,
        });
      });
    }
    setTechniques((techniques) =>
      techniques.map((techniqueItem) => {
        if (techniqueItem.id === techniqueId) {
          return {
            ...techniqueItem,
            instruments: techniqueItem.instruments.filter(
              (instrument) => !instrumentIds.find((id) => id === instrument.id)
            ),
          };
        } else {
          return techniqueItem;
        }
      })
    );
  };
=======
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
>>>>>>> Stashed changes

  return (
    <>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={openInstrumentAssignment}
        onClose={(): void => setOpenInstrumentAssignment(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <AssignInstrumentsToTechniques
            assignInstrumentsToTechniques={assignInstrumentsToTechniques}
            close={(): void => setOpenInstrumentAssignment(false)}
            instrumentIds={selectedTechniques
              .map((selecteTechnique) =>
                (selecteTechnique.instruments || []).map(
                  (instrument) => instrument.id
                )
              )
              .flat()}
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
