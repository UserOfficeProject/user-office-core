import MaterialTable from 'material-table';
import React, { useMemo } from 'react';

import { QuestionWithUsage } from 'hooks/template/useQuestions';
import { useTemplates } from 'hooks/template/useTemplates';
import { tableIcons } from 'utils/materialIcons';

interface TemplateCountDetailsProps {
  question: QuestionWithUsage | null;
}
function TemplateCountDetails({ question }: TemplateCountDetailsProps) {
  const templateIds = useMemo(
    () => question?.templates.map((template) => template.templateId),
    [question]
  );
  const { templates } = useTemplates({ templateIds });
  if (!templates) {
    return null;
  }

  return (
    <MaterialTable
      style={{ width: '100%' }}
      icons={tableIcons}
      columns={[
        { title: 'ID', field: 'templateId' },
        { title: 'Name', field: 'name' },
        { title: 'Description', field: 'description' },
        { title: 'Is Archived', field: 'isArchived' },
      ]}
      data={templates}
      title="Templates"
      options={{ paging: false }}
    />
  );
}

export default TemplateCountDetails;
