import { Column } from 'material-table';
import React from 'react';

import { Template, TemplateCategoryId } from 'generated/sdk';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { TemplateRowDataType, TemplatesTable } from './TemplatesTable';
import withMarkTemplateAsActiveAction from './withMarkTemplateAsActiveAction';

type RiskAssessmentTemplateRowDataType = TemplateRowDataType &
  Record<string, unknown>;

type RiskAssessmentTemplatesTableProps = {
  dataProvider: () => Promise<
    Pick<
      Template,
      'templateId' | 'name' | 'description' | 'isArchived' | 'questionaryCount'
    >[]
  >;
  confirm: WithConfirmType;
};

function RiskAssessmentTemplatesTable(
  props: RiskAssessmentTemplatesTableProps
) {
  const columns: Column<RiskAssessmentTemplateRowDataType>[] = [
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
    { title: '# Risk assessments', field: 'questionaryCount' },
  ];

  const Table = withMarkTemplateAsActiveAction(TemplatesTable);

  return (
    <Table
      columns={columns}
      templateCategory={TemplateCategoryId.RISK_ASSESSMENT}
      isRowRemovable={() => {
        return true;
      }}
      dataProvider={props.dataProvider}
      confirm={props.confirm}
    />
  );
}

export default withConfirm(RiskAssessmentTemplatesTable);
