import Edit from '@material-ui/icons/Edit';
import React from 'react';
import { useHistory } from 'react-router';

import { useCheckAccess } from 'components/common/Can';
import SuperMaterialTable from 'components/common/SuperMaterialTable';
import { UserRole, ProposalWorkflow } from 'generated/sdk';
import { useProposalWorkflowsData } from 'hooks/settings/useProposalWorkflowsData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import CreateProposalWorkflow from './CreateProposalWorkflow';

const ProposalWorkflowsTable: React.FC = () => {
  const { api } = useDataApiWithFeedback();
  const {
    loadingProposalWorkflows,
    proposalWorkflows,
    setProposalWorkflowsWithLoading: setProposalWorkflows,
  } = useProposalWorkflowsData();
  const columns = [
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
  ];
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const history = useHistory();

  const createModal = (onUpdate: Function, onCreate: Function) => (
    <CreateProposalWorkflow
      close={(proposalWorkflow: ProposalWorkflow | null) =>
        onCreate(proposalWorkflow)
      }
    />
  );

  const deleteProposalWorkflow = async (id: number) => {
    return await api('Proposal workflow deleted successfully')
      .deleteProposalWorkflow({
        id: id,
      })
      .then(resp => {
        if (resp.deleteProposalWorkflow.error) {
          return false;
        } else {
          return true;
        }
      });
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
        title={'Proposal workflows'}
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
              history.push(
                `/WorkflowEditor/${(rowData as ProposalWorkflow).id}`
              ),
            position: 'row',
          },
        ]}
      />
    </div>
  );
};

export default ProposalWorkflowsTable;
