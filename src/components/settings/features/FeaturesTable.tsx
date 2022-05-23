import MaterialTable, { Column } from '@material-table/core';
import DisabledByDefaultOutlinedIcon from '@mui/icons-material/DisabledByDefaultOutlined';
import DoneOutlined from '@mui/icons-material/DoneOutlined';
import React, { useContext } from 'react';

import { FeatureContext } from 'context/FeatureContextProvider';
import { Feature, FeatureUpdateAction } from 'generated/sdk';
// import { useFeatures } from 'hooks/admin/useFeatures';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

const columns: Column<Feature>[] = [
  { title: 'ID', field: 'id' },
  { title: 'Description', field: 'description' },
  {
    title: 'Enabled',
    field: 'isEnabled',
    lookup: { true: 'Yes', false: 'No' },
  },
];

const FeaturesPage: React.FC<{ confirm: WithConfirmType }> = ({ confirm }) => {
  const { features, setFeatures } = useContext(FeatureContext);
  const { api } = useDataApiWithFeedback();

  const handleBulkFeaturesUpdate = async (
    selectedRowsData: Feature | Feature[],
    action: FeatureUpdateAction
  ) => {
    if (!Array.isArray(selectedRowsData)) {
      return;
    }

    const isEnabled = action === FeatureUpdateAction.ENABLE;

    confirm(
      async () => {
        const featureIds = selectedRowsData.map(
          (selectedRow) => selectedRow.id
        );

        const response = await api({
          toastSuccessMessage: `Features ${isEnabled ? 'enabled' : 'disabled'}`,
        }).updateFeatures({ featureIds, action });

        if (!response.updateFeatures.rejection) {
          const newFeatures = features.map((feature) => ({
            ...feature,
            isEnabled: selectedRowsData.find(
              (selectedRow) => selectedRow.id === feature.id
            )
              ? isEnabled
              : feature.isEnabled,
          }));

          setFeatures(newFeatures);
        }
      },
      {
        title: 'Confirmation',
        description: `Do you really want to ${
          isEnabled ? 'enable' : 'disable'
        } selected features.`,
      }
    )();
  };

  return (
    <div data-cy="features-table">
      <MaterialTable
        icons={tableIcons}
        title={'Proposals'}
        columns={columns}
        data={features}
        options={{
          search: true,
          selection: true,
          headerSelectionProps: {
            inputProps: { 'aria-label': 'Select All Rows' },
          },
          debounceInterval: 400,
          selectionProps: (rowData: Feature) => ({
            inputProps: {
              'aria-label': `${rowData.id}-select`,
            },
          }),
          pageSize: 20,
        }}
        actions={[
          {
            icon: DoneOutlined,
            tooltip: 'Enable selected features',
            onClick: (
              _: React.MouseEventHandler<HTMLButtonElement>,
              selectedRowsData: Feature | Feature[]
            ) =>
              handleBulkFeaturesUpdate(
                selectedRowsData,
                FeatureUpdateAction.ENABLE
              ),
            position: 'toolbarOnSelect',
          },
          {
            icon: DisabledByDefaultOutlinedIcon,
            tooltip: 'Disable selected features',
            onClick: (
              _: React.MouseEventHandler<HTMLButtonElement>,
              selectedRowsData: Feature | Feature[]
            ) =>
              handleBulkFeaturesUpdate(
                selectedRowsData,
                FeatureUpdateAction.DISABLE
              ),
            position: 'toolbarOnSelect',
          },
        ]}
      />
    </div>
  );
};

export default withConfirm(FeaturesPage);
