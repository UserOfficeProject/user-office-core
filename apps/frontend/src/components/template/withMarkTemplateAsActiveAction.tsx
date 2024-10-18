import { MaterialTableProps } from '@material-table/core';
import DoneIcon from '@mui/icons-material/Done';
import React, { useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { Template, TemplateGroupId } from 'generated/sdk';
import { useActiveTemplateId } from 'hooks/template/useActiveTemplateId';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import { TemplateRowDataType } from './TemplatesTable';

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
    const { api } = useDataApiWithFeedback();
    const { activeTemplateId, setActiveTemplateId } = useActiveTemplateId(
      props.templateGroup
    );
    const [seed, setSeed] = useState(Math.random());

    if (activeTemplateId === undefined) {
      return <UOLoader />;
    }

    return (
      <Component
        key={seed}
        {...props}
        actions={[
          (rowData) => ({
            icon: function DoneIconComponent() {
              return rowData.templateId === activeTemplateId ? (
                <DoneIcon data-cy="mark-as-inactive" />
              ) : (
                <DoneIcon
                  sx={(theme) => ({ color: theme.palette.grey.A100 })}
                  data-cy="mark-as-active"
                />
              );
            },
            tooltip:
              rowData.templateId === activeTemplateId
                ? 'Mark as Inactive'
                : 'Mark as active',
            onClick: async (_event, data) => {
              const newActiveTemplateId = (data as Pick<Template, 'templateId'>)
                .templateId;
              await api()
                .setActiveTemplate({
                  templateGroupId: props.templateGroup,
                  templateId: newActiveTemplateId,
                })
                .then(() => {
                  setActiveTemplateId(newActiveTemplateId);
                  setSeed(Math.random());
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
