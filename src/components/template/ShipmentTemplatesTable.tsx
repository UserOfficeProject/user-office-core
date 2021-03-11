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

type SampleTemplateRowDataType = TemplateRowDataType & Record<string, unknown>;

const useStyles = makeStyles((theme) => ({
  inactive: {
    color: theme.palette.grey.A100,
  },
}));

type ShipmentTemplatesTableProps = {
  dataProvider: () => Promise<
    Pick<
      ProposalTemplate,
      'templateId' | 'name' | 'description' | 'isArchived' | 'questionaryCount'
    >[]
  >;
  confirm: WithConfirmType;
};

function ShipmentTemplatesTable(props: ShipmentTemplatesTableProps) {
  const { api } = useDataApiWithFeedback();
  const { activeTemplateId, setActiveTemplateId } = useActiveTemplateId(
    TemplateCategoryId.SHIPMENT_DECLARATION
  );
  const classes = useStyles();

  if (activeTemplateId === undefined) {
    return <UOLoader />;
  }

  const columns: Column<SampleTemplateRowDataType>[] = [
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
    { title: '# shipments', field: 'questionaryCount' },
  ];

  return (
    <>
      <TemplatesTable
        columns={columns}
        templateCategory={TemplateCategoryId.SHIPMENT_DECLARATION}
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
                templateCategoryId: TemplateCategoryId.SHIPMENT_DECLARATION,
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

export default withConfirm(ShipmentTemplatesTable);
