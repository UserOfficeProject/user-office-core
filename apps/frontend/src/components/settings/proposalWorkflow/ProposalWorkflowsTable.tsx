import Edit from '@mui/icons-material/Edit';
import { Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import SuperMaterialTable from 'components/common/SuperMaterialTable';
import { UserRole, ProposalWorkflow } from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { useProposalWorkflowsData } from 'hooks/settings/useProposalWorkflowsData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

import CreateProposalWorkflow from './CreateProposalWorkflow';

const columns = [
  { title: 'Name', field: 'name' },
  { title: 'Description', field: 'description' },
];

const ProposalWorkflowsTable = () => {
  const { api } = useDataApiWithFeedback();
  const {
    loadingProposalWorkflows,
    proposalWorkflows,
    setProposalWorkflowsWithLoading: setProposalWorkflows,
  } = useProposalWorkflowsData();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const navigate = useNavigate();

  const createModal = (
    onUpdate: FunctionType<void, [ProposalWorkflow | null]>,
    onCreate: FunctionType<void, [ProposalWorkflow | null]>
  ) => (
    <CreateProposalWorkflow
      close={(proposalWorkflow: ProposalWorkflow | null) => {
        onCreate(proposalWorkflow);

        navigate(
          `/ProposalWorkflowEditor/${(proposalWorkflow as ProposalWorkflow).id}`
        );
      }}
    />
  );

  const deleteProposalWorkflow = async (id: number | string) => {
    try {
      await api({
        toastSuccessMessage: 'Proposal workflow deleted successfully',
      }).deleteProposalWorkflow({
        id: id as number,
      });

      return true;
    } catch (error) {
      return false;
    }
  };

  const EditIcon = (): JSX.Element => <Edit />;

  return (
    <div data-cy="proposal-workflows-table">
      <SuperMaterialTable
        delete={deleteProposalWorkflow}
        createModal={createModal}
        hasAccess={{
          update: false,
          create: isUserOfficer,
          remove: isUserOfficer,
        }}
        setData={setProposalWorkflows}
        icons={tableIcons}
        title={
          <Typography variant="h6" component="h2">
            Proposal workflows
          </Typography>
        }
        columns={columns}
        data={proposalWorkflows}
        isLoading={loadingProposalWorkflows}
        options={{
          search: true,
          debounceInterval: 400,
        }}
        actions={[
          {
            icon: EditIcon,
            tooltip: 'Edit',
            onClick: (event, rowData): void =>
              navigate(
                `/ProposalWorkflowEditor/${(rowData as ProposalWorkflow).id}`
              ),
            position: 'row',
          },
        ]}
        persistUrlQueryParams={true}
      />
    </div>
  );
};

export default ProposalWorkflowsTable;
