import MaterialTable from '@material-table/core';
import Button from '@mui/material/Button';
import { Link } from '@mui/material';
import React, { useMemo, useState } from 'react';

import { GetTemplatesQuery } from 'generated/sdk';
import { QuestionWithUsage } from 'hooks/template/useQuestions';
import { useTemplates } from 'hooks/template/useTemplates';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type TemplateTableRowType = NonNullable<GetTemplatesQuery['templates']>[0];
interface TemplateCountDetailsProps {
  question: QuestionWithUsage | null;
  onQuestionUsageChanged?: () => void;
}

function TemplateCountDetails({
  question,
  onQuestionUsageChanged,
}: TemplateCountDetailsProps) {
  const templateIds = useMemo(
    () => question?.templates.map((template) => template.templateId),
    [question]
  );
  const { templates } = useTemplates({ templateIds });
  const [removedTemplateIds, setRemovedTemplateIds] = useState<number[]>([]);
  const { api } = useDataApiWithFeedback();

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
    {
      title: '',
      sorting: false,
      render: (rowData: TemplateTableRowType) => (
        <Button
          color="error"
          variant="outlined"
          data-cy="remove-question-from-template-btn"
          onClick={async () => {
            if (!question?.id) {
              return;
            }

            await api({
              toastSuccessMessage: 'Question removed from template',
            }).deleteQuestionTemplateRelation({
              templateId: rowData.templateId,
              questionId: question.id,
            });

            setRemovedTemplateIds((templateIds) =>
              templateIds.includes(rowData.templateId)
                ? templateIds
                : [...templateIds, rowData.templateId]
            );
            onQuestionUsageChanged?.();
          }}
        >
          Remove
        </Button>
      ),
    },
  ];

  if (!templates) {
    return null;
  }

  // fix for MaterialTable requiring rows to have an 'id' property
  const templatesWithId = templates
    .filter((template) => !removedTemplateIds.includes(template.templateId))
    .map((template) => ({
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
