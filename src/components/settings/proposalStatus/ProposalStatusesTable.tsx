import React from 'react';

import { useCheckAccess } from 'components/common/Can';
import SuperMaterialTable from 'components/common/SuperMaterialTable';
import { UserRole, ProposalStatus } from 'generated/sdk';
import { useProposalStatusesData } from 'hooks/settings/useProposalStatusesData';
import { tableIcons } from 'utils/materialIcons';

import CreateUpdateProposalStatus from './CreateUpdateProposalStatus';

const ProposalStatusesTable: React.FC = () => {
  const {
    loadingProposalStatuses,
    proposalStatuses,
    setProposalStatusesWithLoading: setProposalStatuses,
  } = useProposalStatusesData();
  const columns = [
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

  return (
    <div data-cy="proposal-statuses-table">
      <SuperMaterialTable
        createModal={createModal}
        hasAccess={{
          update: isUserOfficer,
          create: isUserOfficer,
          remove: isUserOfficer,
        }}
        setData={setProposalStatuses}
        icons={tableIcons}
        title={'Scientific evaluation panels'}
        columns={columns}
        data={proposalStatuses}
        isLoading={loadingProposalStatuses}
        options={{
          search: true,
          debounceInterval: 400,
        }}
      />
    </div>
  );
};

export default ProposalStatusesTable;
