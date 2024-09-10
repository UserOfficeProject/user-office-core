import { Column } from '@material-table/core';
import { AssignmentInd } from '@mui/icons-material';
import { Dialog, DialogContent, Typography } from '@mui/material';
import i18n from 'i18n';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ScienceIcon from 'components/common/icons/ScienceIcon';
import SimpleTabs from 'components/common/SimpleTabs';
import SuperMaterialTable from 'components/common/SuperMaterialTable';
import ParticipantModal from 'components/proposal/ParticipantModal';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { useTechniquesData } from 'hooks/technique/useTechniquesData';
import { StyledContainer } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

import AssignedInstrumentsTable from './AssignedInstrumentsTable';
import AssignedScientistsTable from './AssignedScientistsTable';
import AssignInstrumentsToTechniques from './AssignInstrumentsToTechniques';
import CreateUpdateTechnique from './CreateUpdateTechnique';
import {
  BasicUserDetails,
  InstrumentFragment,
  Technique,
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

  const [openTechniqueAssignment, setOpenTechniqueAssignment] = useState(false);
  const [selectedTechnique, setSelectedTechnique] =
    useState<TechniqueFragment | null>(null);

  const { t } = useTranslation();
  const [assigningTechniqueScientistsId, setAssigningTechniqueScientistsId] =
    useState<number | null>(null);

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

  const AssignmentInstrumentIcon = (): JSX.Element => <ScienceIcon />;
  const AssignmentScientistIcon = (): JSX.Element => <AssignmentInd />;

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
  const assignScientistsToTechnique = async (
    scientists: BasicUserDetails[]
  ) => {
    await api({
      toastSuccessMessage: `Scientist assigned to technique successfully!`,
    }).assignScientistsToTechnique({
      scientistIds: scientists.map((scientist) => scientist.id),
      techniqueId: assigningTechniqueScientistsId as number,
    });

    setTechniques((techniques) =>
      techniques.map((technique) => {
        if (technique.id === assigningTechniqueScientistsId) {
          return {
            ...technique,
            scientists: [...technique.scientists, ...scientists],
          };
        } else {
          return technique;
        }
      })
    );

    setAssigningTechniqueScientistsId(null);
  };

  const AssignedInstruments = React.useCallback(
    ({ rowData }: { rowData: Technique }) => {
      const removeScientistFromTechnique = async (
        scientistId: number,
        techniqueId: number
      ): Promise<void> => {
        await api({
          toastSuccessMessage:
            'Scientist removed from ' +
            i18n.format(t('Technique'), 'lowercase') +
            ' successfully!',
        })
          .removeScientistFromTechnique({
            scientistId,
            techniqueId,
          })
          .then(() => {
            setTechniques((techniques) =>
              techniques.map((techniqueItem) => {
                if (techniqueItem.id === techniqueId) {
                  return {
                    ...techniqueItem,
                    scientists: techniqueItem.scientists.filter(
                      (scientist) => scientist.id !== scientistId
                    ),
                  };
                }

                return techniqueItem;
              })
            );
          });
      };

      return (
        <StyledContainer margin={[0]} padding={[1, 0, 0, 0]} maxWidth={false}>
          <SimpleTabs
            tabNames={[
              `${i18n.format(t('instrument'), 'plural')}`,
              `Assigned ${i18n.format(t('scientist'), 'plural')}`,
            ]}
          >
            <AssignedInstrumentsTable technique={rowData} />
            <AssignedScientistsTable
              removeScientistFromTechnique={removeScientistFromTechnique}
              technique={rowData}
            />
          </SimpleTabs>
        </StyledContainer>
      );
    },
    [api, setTechniques, t]
  );

  const removeInstrumentsFromTechnique = async (
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
      <ParticipantModal
        show={!!assigningTechniqueScientistsId}
        close={(): void => {
          setSelectedTechnique(null);
          setAssigningTechniqueScientistsId(null);
        }}
        addParticipants={assignScientistsToTechnique}
        selectedUsers={selectedTechnique?.scientists.map(
          (scientist) => scientist.id
        )}
        selection={true}
        userRole={UserRole.INSTRUMENT_SCIENTIST}
        title={t('instrumentSci')}
        invitationUserRole={UserRole.INSTRUMENT_SCIENTIST}
      />
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
            removeInstrumentsFromTechnique={removeInstrumentsFromTechnique}
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
                    icon: AssignmentInstrumentIcon,
                    tooltip:
                      'Assign/remove ' +
                      i18n.format(
                        i18n.format(t('instrument'), 'plural'),
                        'lowercase'
                      ),
                    onClick: (_event: unknown, rowData: unknown): void =>
                      setAssigningTechniqueId(rowData as TechniqueFragment),
                  },
                  {
                    icon: AssignmentScientistIcon,
                    tooltip: 'Assign scientist',
                    onClick: (_event: unknown, rowData: unknown): void => {
                      setSelectedTechnique(rowData as TechniqueFragment);
                      setAssigningTechniqueScientistsId(
                        (rowData as TechniqueFragment).id
                      );
                    },
                  },
                ]
              : []
          }
          createModal={createModal}
        />
      </div>
    </>
  );
};

export default TechniqueTable;
