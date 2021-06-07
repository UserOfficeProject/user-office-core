import { makeStyles } from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import { Column } from 'material-table';
import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { ProposalTemplate, Template, TemplateCategoryId } from 'generated/sdk';
import { useActiveTemplateId } from 'hooks/template/useActiveTemplateId';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { TemplateRowDataType, TemplatesTable } from './TemplatesTable';

type VisitationTemplateRowDataType = TemplateRowDataType &
  Record<string, unknown>;

const useStyles = makeStyles((theme) => ({
  inactive: {
    color: theme.palette.grey.A100,
  },
}));

type VisitationTemplatesTableProps = {
  dataProvider: () => Promise<
    Pick<
      ProposalTemplate,
      'templateId' | 'name' | 'description' | 'isArchived' | 'questionaryCount'
    >[]
  >;
  confirm: WithConfirmType;
};

function VisitationTemplatesTable(props: VisitationTemplatesTableProps) {
  const { api } = useDataApiWithFeedback();
  const { activeTemplateId, setActiveTemplateId } = useActiveTemplateId(
    TemplateCategoryId.VISITATION
  );
  const classes = useStyles();

  if (activeTemplateId === undefined) {
    return <UOLoader />;
  }

  const columns: Column<VisitationTemplateRowDataType>[] = [
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
    { title: '# visitations', field: 'questionaryCount' },
  ];

  return (
    <>
      <TemplatesTable
        columns={columns}
        templateCategory={TemplateCategoryId.VISITATION}
        isRowRemovable={() => {
          return true;
        }}
        dataProvider={props.dataProvider}
        confirm={props.confirm}
        actions={[
          (rowData) => ({
            icon: function DoneIconComponent() {
              return rowData.templateId === activeTemplateId ? (
                <DoneIcon />
              ) : (
                <DoneIcon className={classes.inactive} />
              );
            },
            tooltip: 'Mark as active',
            onClick: async (event, data) => {
              const newActiveTemplateId = (data as Pick<Template, 'templateId'>)
                .templateId;
              await api().setActiveTemplate({
                templateCategoryId: TemplateCategoryId.VISITATION,
                templateId: newActiveTemplateId,
              });
              setActiveTemplateId(newActiveTemplateId);
            },
          }),
        ]}
      />
    </>
  );
}

export default withConfirm(VisitationTemplatesTable);
