import { Column } from '@material-table/core';
import { Typography } from '@mui/material';
import React from 'react';

import SuperMaterialTable from 'components/common/SuperMaterialTable';
import { EmailTemplateFragment, UserRole } from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { useEmailTemplatesData } from 'hooks/emailTemplate/useEmailTemplatesData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

import CreateUpdateEmailTemplate from './CreateUpdateEmailTemplate';

const EmailTemplatesTable = () => {
  const {
    loadingEmailTemplates,
    emailTemplates,
    setEmailTemplatesWithLoading: setEmailTemplates,
  } = useEmailTemplatesData();

  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const { api } = useDataApiWithFeedback();
  const columns: Column<EmailTemplateFragment>[] = [
    {
      title: 'Name',
      field: 'name',
    },
    {
      title: 'Description',
      field: 'description',
    },
    {
      title: 'Subject',
      field: 'subject',
    },
    {
      title: 'Body',
      field: 'body',
    },
  ];

  const onEmailTemplateDelete = async (emailTemplateId: number | string) => {
    try {
      await api({
        toastSuccessMessage: 'Email template deleted successfully',
      }).deleteEmailTemplate({ id: emailTemplateId as number });

      return true;
    } catch (error) {
      return false;
    }
  };

  const createModal = (
    onUpdate: FunctionType<void, [EmailTemplateFragment | null]>,
    onCreate: FunctionType<void, [EmailTemplateFragment | null]>,
    editEmailTemplate: EmailTemplateFragment | null
  ) => (
    <CreateUpdateEmailTemplate
      emailTemplate={editEmailTemplate}
      close={(emailTemplate: EmailTemplateFragment | null) =>
        !!editEmailTemplate ? onUpdate(emailTemplate) : onCreate(emailTemplate)
      }
    />
  );

  return (
    <>
      <div data-cy="email-templates-table">
        <SuperMaterialTable
          delete={onEmailTemplateDelete}
          setData={setEmailTemplates}
          title={
            <Typography variant="h6" component="h2">
              Email Templates
            </Typography>
          }
          hasAccess={{
            create: isUserOfficer,
            update: isUserOfficer,
            remove: isUserOfficer,
          }}
          columns={columns}
          data={emailTemplates}
          isLoading={loadingEmailTemplates}
          options={{
            search: true,
            debounceInterval: 400,
          }}
          createModal={createModal}
          persistUrlQueryParams={true}
        ></SuperMaterialTable>
      </div>
    </>
  );
};

export default EmailTemplatesTable;
