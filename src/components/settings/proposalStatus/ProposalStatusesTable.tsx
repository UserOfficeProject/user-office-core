import React from 'react';
import { useQueryParams } from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import SuperMaterialTable, {
  DefaultQueryParams,
  UrlQueryParamsType,
} from 'components/common/SuperMaterialTable';
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
  const columns = [
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
  ];
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const [urlQueryParams, setUrlQueryParams] = useQueryParams<
    UrlQueryParamsType
  >(DefaultQueryParams);

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
        if (resp.deleteProposalStatus.error) {
          return false;
        } else {
          return true;
        }
      });
  };

  return (
    <div data-cy="proposal-statuses-table">
      <SuperMaterialTable
        delete={deleteProposalStatus}
        createModal={createModal}
        hasAccess={{
          update: isUserOfficer,
          create: isUserOfficer,
          remove: isUserOfficer,
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
        urlQueryParams={urlQueryParams}
        setUrlQueryParams={setUrlQueryParams}
      />
    </div>
  );
};

export default ProposalStatusesTable;
