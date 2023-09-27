import MaterialTable from '@material-table/core';
import { Link } from '@mui/material';
import React, { useMemo } from 'react';

import { GetTemplatesQuery } from 'generated/sdk';
import { QuestionWithUsage } from 'hooks/template/useQuestions';
import { useTemplates } from 'hooks/template/useTemplates';
import { tableIcons } from 'utils/materialIcons';

type TemplateTableRowType = NonNullable<GetTemplatesQuery['templates']>[0];
interface TemplateCountDetailsProps {
  question: QuestionWithUsage | null;
}

const columns = [
  {
    title: 'Name',
    field: 'name',
    render: (rowData: TemplateTableRowType) => (
      <Link
        title={rowData.name}
        href={`/QuestionaryEditor/${rowData.templateId}`}
      >
        {rowData.name}
      </Link>
    ),
  },
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

  // fix for MaterialTable requiring rows to have an 'id' property
  const templatesWithId = templates.map((template) => ({
    id: template.templateId,
    ...template,
  }));

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
