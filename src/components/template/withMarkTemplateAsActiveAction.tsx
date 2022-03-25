import { MaterialTableProps } from '@material-table/core';
import DoneIcon from '@mui/icons-material/Done';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { Template, TemplateGroupId } from 'generated/sdk';
import { useActiveTemplateId } from 'hooks/template/useActiveTemplateId';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import { TemplateRowDataType } from './TemplatesTable';

const useStyles = makeStyles((theme) => ({
  inactive: {
    color: theme.palette.grey.A100,
  },
}));

type InputComponentType<T> = T & {
  actions?: MaterialTableProps<TemplateRowDataType>['actions'];
  templateGroup: TemplateGroupId;
};

/**
 * Adds a clickable checkmark to the table indicating which template is active
 * @param Component Input component
 * @returns Wrapped component, what has the checkmark
 */
function withMarkTemplateAsActiveAction<T>(
  Component: React.ComponentType<InputComponentType<T>>
) {
  const WrappedComponent = (props: InputComponentType<T>) => {
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
}

export default withMarkTemplateAsActiveAction;
