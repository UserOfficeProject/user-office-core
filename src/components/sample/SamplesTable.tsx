import { Tooltip, IconButton } from '@material-ui/core';
import { Visibility } from '@material-ui/icons';
import GetAppIcon from '@material-ui/icons/GetApp';
import MaterialTable, { MaterialTableProps } from 'material-table';
import React from 'react';
import { DecodedValueMap, SetQuery, QueryParamConfig } from 'use-query-params';

import { useDownloadPDFSample } from 'hooks/sample/useDownloadPDFSample';
import { SampleBasic } from 'models/Sample';
import { tableIcons } from 'utils/materialIcons';

type SamplesTableQueryParamsType = {
  call: QueryParamConfig<number | null | undefined>;
  search: QueryParamConfig<string | null | undefined>;
};

const SamplesTable = (
  props: Omit<MaterialTableProps<SampleBasic>, 'columns'> & {
    urlQueryParams: DecodedValueMap<SamplesTableQueryParamsType>;
    setUrlQueryParams: SetQuery<SamplesTableQueryParamsType>;
    setSelectedSample: (sample: SampleBasic) => void;
  }
) => {
  const downloadPDFSample = useDownloadPDFSample();
  const RowActionButtons = (rowData: SampleBasic) => {
    const iconButtonStyle = { padding: '7px' };

    return (
      <>
        <Tooltip title="View sample">
          <IconButton
            style={iconButtonStyle}
            onClick={() => props.setSelectedSample(rowData)}
          >
            <Visibility />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download sample as pdf">
          <IconButton
            data-cy="download-sample"
            onClick={() => downloadPDFSample(rowData.id)}
            style={iconButtonStyle}
          >
            <GetAppIcon />
          </IconButton>
        </Tooltip>
      </>
    );
  };

  const columns = [
    {
      title: 'Actions',
      sorting: false,
      removable: false,
      render: RowActionButtons,
    },
    { title: 'Title', field: 'title' },
    { title: 'Status', field: 'safetyStatus' },
    { title: 'Created', field: 'created' },
  ];

  return (
    <MaterialTable
      icons={tableIcons}
      columns={columns}
      title="Samples"
      onSearchChange={searchText => {
        props.setUrlQueryParams({
          search: searchText ? searchText : undefined,
        });
      }}
      options={{
        ...props.options,
        searchText: props.urlQueryParams.search || undefined,
        selection: true,
      }}
      {...props}
      actions={[
        {
          icon: GetAppIcon,
          tooltip: 'Download sample',
          onClick: (event, rowData) =>
            downloadPDFSample(
              (rowData as SampleBasic[]).map(({ id }) => id).join(',')
            ),
        },
      ]}
    />
  );
};

export default React.memo(
  SamplesTable,
  (prevProps, nextProps) => prevProps.data === nextProps.data
);
