import Delete from '@mui/icons-material/DeleteOutline';
import { Typography } from '@mui/material';
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
import { FunctionType } from 'utils/utilTypes';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import CreateUpdateProposalStatus from './CreateUpdateProposalStatus';

const columns = [
  { title: 'Short code', field: 'shortCode' },
  { title: 'Name', field: 'name' },
  { title: 'Description', field: 'description' },
];

const ProposalStatusesTable: React.FC<{ confirm: WithConfirmType }> = ({
  confirm,
}) => {
  const { api } = useDataApiWithFeedback();
  const {
    loadingProposalStatuses,
    proposalStatuses,
    setProposalStatusesWithLoading: setProposalStatuses,
  } = useProposalStatusesData();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const [urlQueryParams, setUrlQueryParams] =
    useQueryParams<UrlQueryParamsType>(DefaultQueryParams);

  const createModal = (
    onUpdate: FunctionType<void, [ProposalStatus | null]>,
    onCreate: FunctionType<void, [ProposalStatus | null]>,
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
    return await api({
      toastSuccessMessage: 'Proposal status deleted successfully',
    })
      .deleteProposalStatus({
        id: id,
      })
      .then((resp) => {
        if (!resp.deleteProposalStatus.rejection) {
          const newObjectsArray = proposalStatuses.filter(
            (objectItem) => objectItem.id !== id
          );
          setProposalStatuses(newObjectsArray);
        }
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
        urlQueryParams={urlQueryParams}
        setUrlQueryParams={setUrlQueryParams}
        actions={[
          (rowActionData) => {
            return {
              icon: Delete,
              tooltip: 'Delete',
              onClick: (event, rowData) =>
                confirm(
                  async () => {
                    await deleteProposalStatus((rowData as ProposalStatus).id);
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
      />
    </div>
  );
};

export default withConfirm(ProposalStatusesTable);
