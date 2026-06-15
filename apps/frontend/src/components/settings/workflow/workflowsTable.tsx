import Edit from '@mui/icons-material/Edit';
import FileCopy from '@mui/icons-material/FileCopy';
import { Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import SuperMaterialTable from 'components/common/SuperMaterialTable';
import { UserRole, Workflow, WorkflowType } from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { useWorkflowsData } from 'hooks/settings/useWorkflowsData';
import { capitalize } from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import CreateWorkflow from './CreateWorkflow';

const columns = [
  { title: 'Name', field: 'name' },
  { title: 'Description', field: 'description' },
];

const WorkflowsTable = ({
  entityType,
  editorPath,
  title,
  createTitle,
  confirm,
}: {
  entityType: WorkflowType;
  editorPath: 'ProposalWorkflowEditor' | 'ExperimentWorkflowEditor';
  title: string;
  createTitle: string;
  confirm: WithConfirmType;
}) => {
  const { api } = useDataApiWithFeedback();
  const {
    loadingWorkflows,
    workflows,
    setWorkflowsWithLoading: setWorkflows,
  } = useWorkflowsData(entityType);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const navigate = useNavigate();

  const createModal = (
    onUpdate: FunctionType<void, [Workflow | null]>,
    onCreate: FunctionType<void, [Workflow | null]>
  ) => (
    <CreateWorkflow
      close={(workflow: Workflow | null) => {
        onCreate(workflow);

        navigate(`/${editorPath}/${(workflow as Workflow).id}`);
      }}
      entityType={entityType}
      title={createTitle}
    />
  );

  const deleteWorkflow = async (id: number | string) => {
    try {
      await api({
        toastSuccessMessage: `${capitalize(entityType)} workflow deleted successfully`,
      }).deleteWorkflow({
        id: id as number,
      });

      return true;
    } catch {
      return false;
    }
  };

  const EditIcon = (): JSX.Element => <Edit />;
  const FileCopyIcon = (): JSX.Element => <FileCopy />;

  return (
    <div data-cy="workflows-table">
      <SuperMaterialTable
        delete={deleteWorkflow}
        createModal={createModal}
        hasAccess={{
          update: false,
          create: isUserOfficer,
          remove: isUserOfficer,
        }}
        setData={setWorkflows}
        icons={tableIcons}
        title={
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
        }
        columns={columns}
        data={workflows}
        isLoading={loadingWorkflows}
        options={{
          search: true,
          debounceInterval: 400,
        }}
        actions={[
          {
            icon: EditIcon,
            tooltip: 'Edit',
            onClick: (event, rowData): void =>
              navigate(`/${editorPath}/${(rowData as Workflow).id}`),
            position: 'row',
          },
          {
            icon: FileCopyIcon,
            hidden: false,
            tooltip: 'Clone',
            onClick: (event, rowData): void => {
              confirm(
                () => {
                  api({
                    toastSuccessMessage: `${capitalize(
                      entityType
                    )} workflow cloned successfully`,
                  })
                    .cloneWorkflow({
                      workflowId: (rowData as Workflow).id,
                    })
                    .then((result) => {
                      const clonedWorkflow = result.cloneWorkflow;
                      if (clonedWorkflow) {
                        const newWorkflows = [...workflows];
                        newWorkflows.push(clonedWorkflow as Workflow);
                        setWorkflows(newWorkflows);
                      }
                    });
                },
                {
                  title: 'Are you sure?',
                  description: `Are you sure you want to clone ${
                    (rowData as Workflow).name
                  }?`,
                  confirmationText: 'Yes',
                  cancellationText: 'Cancel',
                }
              )();
            },
            position: 'row',
          },
        ]}
        persistUrlQueryParams={true}
      />
    </div>
  );
};

export default withConfirm(WorkflowsTable);
