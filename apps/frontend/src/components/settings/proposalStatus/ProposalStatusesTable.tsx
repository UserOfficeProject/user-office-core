import Delete from '@mui/icons-material/DeleteOutline';
import { Typography } from '@mui/material';
import React from 'react';

import SuperMaterialTable from 'components/common/SuperMaterialTable';
import { UserRole, Status } from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { useStatusesData } from 'hooks/settings/useStatusesData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import CreateUpdateProposalStatus from './CreateUpdateProposalStatus';

const columns = [
  { title: 'Short code', field: 'shortCode' },
  { title: 'Name', field: 'name' },
  { title: 'Description', field: 'description' },
];

const ProposalStatusesTable = ({ confirm }: { confirm: WithConfirmType }) => {
  const { api } = useDataApiWithFeedback();

  const {
    statuses: proposalStatuses,
    loadingStatuses: loadingProposalStatuses,
    setStatusesWithLoading: setProposalStatuses,
  } = useStatusesData('proposal');
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const createModal = (
    onUpdate: FunctionType<void, [Status | null]>,
    onCreate: FunctionType<void, [Status | null]>,
    editProposalStatus: Status | null
  ) => (
    <CreateUpdateProposalStatus
      proposalStatus={editProposalStatus}
      close={(proposalStatus: Status | null) =>
        !!editProposalStatus
          ? onUpdate(proposalStatus)
          : onCreate(proposalStatus)
      }
    />
  );

  const deleteProposalStatus = async (id: number) => {
    return await api({
      toastSuccessMessage: 'Proposal status deleted successfully',
    })
      .deleteStatus({
        id: id,
      })
      .then(() => {
        const newObjectsArray = proposalStatuses.filter(
          (objectItem) => objectItem.id !== id
        );
        setProposalStatuses(newObjectsArray);
      });
  };

  return (
    <div data-cy="proposal-statuses-table">
      <SuperMaterialTable
        createModal={createModal}
        hasAccess={{
          update: isUserOfficer,
          create: isUserOfficer,
          remove: false,
        }}
        setData={setProposalStatuses}
        icons={tableIcons}
        title={
          <Typography variant="h6" component="h2">
            Proposal statuses
          </Typography>
        }
        columns={columns}
        data={proposalStatuses}
        isLoading={loadingProposalStatuses}
        options={{
          search: true,
          debounceInterval: 400,
        }}
        actions={[
          (rowActionData) => {
            return {
              icon: Delete,
              tooltip: 'Delete',
              onClick: (event, rowData) =>
                confirm(
                  async () => {
                    await deleteProposalStatus((rowData as Status).id);
                  },
                  {
                    title: 'Remove proposal status',
                    description:
                      'Are you sure you want to remove this proposal status?',
                  }
                )(),
              hidden: rowActionData.isDefault,
            };
          },
        ]}
        persistUrlQueryParams={true}
      />
    </div>
  );
};

export default withConfirm(ProposalStatusesTable);
