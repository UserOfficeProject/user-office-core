import MaterialTable, { Column } from '@material-table/core';
import React, { useContext } from 'react';

import { SettingsContext } from 'context/SettingsContextProvider';
import { Settings } from 'generated/sdk';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const columns: Column<Settings>[] = [
  { title: 'ID', field: 'id', editable: 'never' },
  { title: 'Description', field: 'description' },
  {
    title: 'Settings value',
    field: 'settingsValue',
    emptyValue: '-',
  },
];

const AppSettingsTable = () => {
  const { settings, setSettings } = useContext(SettingsContext);
  const { api } = useDataApiWithFeedback();

  const handleSettingsUpdate = async (settingsUpdatedData: Settings) => {
    await api({
      toastSuccessMessage: `Settings updated`,
    }).updateSettings({
      input: {
        settingsId: settingsUpdatedData.id,
        description: settingsUpdatedData.description,
        settingsValue: settingsUpdatedData.settingsValue,
      },
    });

    const newSettings = settings.map((setting) => ({
      ...setting,
      description:
        settingsUpdatedData.id === setting.id
          ? settingsUpdatedData.description
          : setting.description,
      settingsValue:
        settingsUpdatedData.id === setting.id
          ? settingsUpdatedData.settingsValue
          : setting.settingsValue,
    }));

    setSettings(newSettings);
  };

  return (
    <div data-cy="settings-table">
      <MaterialTable
        icons={tableIcons}
        title={'App settings'}
        columns={columns}
        data={settings}
        options={{
          search: true,
          debounceInterval: 400,
          selectionProps: (rowData: Settings) => ({
            inputProps: {
              'aria-label': `${rowData.id}-select`,
            },
          }),
          pageSize: 20,
        }}
        editable={{
          onRowUpdate: (settingsUpdatedData: Settings) =>
            handleSettingsUpdate(settingsUpdatedData),
        }}
      />
    </div>
  );
};

export default AppSettingsTable;
