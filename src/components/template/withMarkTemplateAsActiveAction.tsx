import { makeStyles } from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { Template } from 'generated/sdk';
import { useActiveTemplateId } from 'hooks/template/useActiveTemplateId';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import { TemplatesTableProps } from './TemplatesTable';

const useStyles = makeStyles((theme) => ({
  inactive: {
    color: theme.palette.grey.A100,
  },
}));

const withMarkTemplateAsActiveAction = (
  Component: React.FC<TemplatesTableProps>
) => {
  const WrappedComponent = (props: TemplatesTableProps) => {
    const classes = useStyles();
    const { api } = useDataApiWithFeedback();
    const { activeTemplateId, setActiveTemplateId } = useActiveTemplateId(
      props.templateGroup
    );

    if (activeTemplateId === undefined) {
      return <UOLoader />;
    }

    return (
      <Component
        {...props}
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
            onClick: async (_event, data) => {
              const newActiveTemplateId = (data as Pick<Template, 'templateId'>)
                .templateId;
              await api().setActiveTemplate({
                templateGroupId: props.templateGroup,
                templateId: newActiveTemplateId,
              });
              setActiveTemplateId(newActiveTemplateId);
            },
          }),
        ]}
      />
    );
  };

  return WrappedComponent;
};

export default withMarkTemplateAsActiveAction;
