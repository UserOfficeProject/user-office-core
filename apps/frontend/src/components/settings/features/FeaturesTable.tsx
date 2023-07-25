import MaterialTable, { Column } from '@material-table/core';
import React, { useContext, useState, useEffect } from 'react';

import { FeatureContext } from 'context/FeatureContextProvider';
import { Feature, FeatureUpdateAction } from 'generated/sdk';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

type FeatureWithTableData = Feature & { tableData: { checked: boolean } };

const columns: Column<FeatureWithTableData>[] = [
  { title: 'ID', field: 'id' },
  { title: 'Description', field: 'description' },
];

const FeaturesTable = ({ confirm }: { confirm: WithConfirmType }) => {
  const { features, setFeatures } = useContext(FeatureContext);
  const { api } = useDataApiWithFeedback();
  const [preSelectedFeatures, setPreSelectedFeatures] = useState<
    FeatureWithTableData[]
  >([]);

  useEffect(() => {
    if (features?.length) {
      const featuresWithSelectionField = features.map((feature) => ({
        ...feature,
        tableData: { checked: feature.isEnabled },
      }));

      setPreSelectedFeatures(featuresWithSelectionField);
    }
  }, [features]);

  const handleColumnSelectionChange = (
    _selectedFeatures: FeatureWithTableData[],
    rowData?: FeatureWithTableData
  ) => {
    if (!rowData) {
      return;
    }

    const shouldEnable = rowData.tableData.checked;
    const action = shouldEnable
      ? FeatureUpdateAction.ENABLE
      : FeatureUpdateAction.DISABLE;

    confirm(
      async () => {
        const featureIds = [rowData.id];

        await api({
          toastSuccessMessage: `Feature ${
            shouldEnable ? 'enabled' : 'disabled'
          }`,
        }).updateFeatures({ input: { featureIds, action } });

        const newFeatures = features.map((feature) => ({
          ...feature,
          isEnabled:
            feature.id === rowData.id ? shouldEnable : feature.isEnabled,
        }));

        setFeatures(newFeatures);
      },
      {
        title: 'Confirmation',
        description: `Do you really want to ${
          shouldEnable ? 'enable' : 'disable'
        } ${rowData.id} feature.`,
      }
    )();
  };

  return (
    <div data-cy="features-table">
      <MaterialTable
        icons={tableIcons}
        title={'Features'}
        columns={columns}
        data={preSelectedFeatures}
        onSelectionChange={handleColumnSelectionChange}
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
          showTextRowsSelected: false,
          showSelectAllCheckbox: false,
        }}
      />
    </div>
  );
};

export default withConfirm(FeaturesTable);
