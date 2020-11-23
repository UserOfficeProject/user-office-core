import Delete from '@material-ui/icons/DeleteOutline';
import React, { useState } from 'react';

import { useCheckAccess } from 'components/common/Can';
import DialogConfirmation from 'components/common/DialogConfirmation';
import SuperMaterialTable from 'components/common/SuperMaterialTable';
import { UserRole, ProposalStatus } from 'generated/sdk';
import { useProposalStatusesData } from 'hooks/settings/useProposalStatusesData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import CreateUpdateProposalStatus from './CreateUpdateProposalStatus';

const ProposalStatusesTable: React.FC = () => {
  const { api } = useDataApiWithFeedback();
  const {
    loadingProposalStatuses,
    proposalStatuses,
    setProposalStatusesWithLoading: setProposalStatuses,
  } = useProposalStatusesData();
  const [
    proposalStatusToRemove,
    setProposalStatusToRemove,
  ] = useState<ProposalStatus | null>(null);
  const columns = [
    { title: 'Short code', field: 'shortCode' },
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
  ];
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const createModal = (
    onUpdate: Function,
    onCreate: Function,
    editProposalStatus: ProposalStatus | null
  ) => (
    <CreateUpdateProposalStatus
      proposalStatus={editProposalStatus}
      close={(proposalStatus: ProposalStatus | null) =>
        !!editProposalStatus
          ? onUpdate(proposalStatus)
          : onCreate(proposalStatus)
      }
    />
  );

  const deleteProposalStatus = async (id: number) => {
    return await api('Proposal status deleted successfully')
      .deleteProposalStatus({
        id: id,
      })
      .then(resp => {
        if (!resp.deleteProposalStatus.error) {
          const newObjectsArray = proposalStatuses.filter(
            objectItem => objectItem.id !== id
          );
          setProposalStatuses(newObjectsArray);
        }
      });
  };

  return (
    <div data-cy="proposal-statuses-table">
      <DialogConfirmation
        title="Remove proposal status"
        text="Are you sure you want to remove this proposal status?"
        open={!!proposalStatusToRemove}
        action={() =>
          deleteProposalStatus((proposalStatusToRemove as ProposalStatus).id)
        }
        handleOpen={() => setProposalStatusToRemove(null)}
      />
      <SuperMaterialTable
        createModal={createModal}
        hasAccess={{
          update: isUserOfficer,
          create: isUserOfficer,
          remove: false,
        }}
        setData={setProposalStatuses}
        icons={tableIcons}
        title={'Proposal statuses'}
        columns={columns}
        data={proposalStatuses}
        isLoading={loadingProposalStatuses}
        options={{
          search: true,
          debounceInterval: 400,
        }}
        actions={[
          rowActionData => {
            return {
              icon: Delete,
              tooltip: 'Remove',
              onClick: (event, rowData) =>
                setProposalStatusToRemove(rowData as ProposalStatus),
              hidden: rowActionData.isDefault,
            };
          },
        ]}
      />
    </div>
  );
};

export default ProposalStatusesTable;
