import MaterialTable from '@material-table/core';
import React, { useMemo } from 'react';

import { QuestionWithUsage } from 'hooks/template/useQuestions';
import { useTemplates } from 'hooks/template/useTemplates';
import { tableIcons } from 'utils/materialIcons';

interface TemplateCountDetailsProps {
  question: QuestionWithUsage | null;
}

// NOTE: Keeping columns outside of the component is better to avoid console warning(https://github.com/material-table-core/core/issues/286)
const columns = [
  { title: 'ID', field: 'templateId' },
  { title: 'Name', field: 'name' },
  { title: 'Description', field: 'description' },
  { title: 'Is Archived', field: 'isArchived' },
];

function TemplateCountDetails({ question }: TemplateCountDetailsProps) {
  const templateIds = useMemo(
    () => question?.templates.map((template) => template.templateId),
    [question]
  );
  const { templates } = useTemplates({ templateIds });
  if (!templates) {
    return null;
  }

  const templatesWithId = templates.map((template) =>
    Object.assign(template, { id: template.templateId })
  );

  return (
    <MaterialTable
      style={{ width: '100%' }}
      icons={tableIcons}
      columns={columns}
      data={templatesWithId}
      title="Templates"
      options={{ paging: false }}
    />
  );
}

export default TemplateCountDetails;
