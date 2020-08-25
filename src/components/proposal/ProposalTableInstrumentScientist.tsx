import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import { IconButton } from '@material-ui/core';
import { Visibility, Edit } from '@material-ui/icons';
import GetAppIcon from '@material-ui/icons/GetApp';
import MaterialTable, { Column } from 'material-table';
import React from 'react';
import { Link } from 'react-router-dom';

import { useLocalStorage } from 'hooks/common/useLocalStorage';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import {
  useProposalsData,
  ProposalData,
} from 'hooks/proposal/useProposalsData';
import { tableIcons } from 'utils/materialIcons';
import {
  average,
  absoluteDifference,
  standardDeviation,
  getGrades,
} from 'utils/mathFunctions';

const ProposalTableInstrumentScientist: React.FC = () => {
  const { loading, proposalsData } = useProposalsData({});

  const downloadPDFProposal = useDownloadPDFProposal();
  const [localStorageValue, setLocalStorageValue] = useLocalStorage<
    Column<ProposalData>[] | null
  >('proposalColumnsInstrumentScientist', null);

  /**
   * NOTE: Custom action buttons are here because when we have them inside actions on the material-table
   * and selection flag is true they are not working properly.
   */
  const RowActionButtons = (rowData: ProposalData) => {
    const iconButtonStyle = { padding: '7px' };

    return (
      <>
        <IconButton data-cy="view-proposal" style={iconButtonStyle}>
          <Link
            to={`/ProposalReviewUserOfficer/${rowData.id}`}
            style={{ color: 'inherit', textDecoration: 'inherit' }}
          >
            {rowData.technicalReview && rowData.technicalReview.status ? (
              <Visibility />
            ) : (
              <Edit />
            )}
          </Link>
        </IconButton>
        <IconButton
          onClick={() => downloadPDFProposal(rowData.id)}
          style={iconButtonStyle}
        >
          <GetAppIcon />
        </IconButton>
      </>
    );
  };

  let columns: Column<ProposalData>[] = [
    {
      title: 'Actions',
      cellStyle: { padding: 0, minWidth: 120 },
      sorting: false,
      removable: false,
      render: RowActionButtons,
    },
    { title: 'Proposal ID', field: 'shortCode' },
    {
      title: 'Title',
      field: 'title',
      ...{ width: 'auto' },
    },
    {
      title: 'Time(Days)',
      field: 'technicalReview.timeAllocation',
      hidden: false,
    },
    {
      title: 'Technical status',
      render: (rowData: ProposalData): string =>
        rowData.technicalReview
          ? getTranslation(rowData.technicalReview.status as ResourceId)
          : '',
    },
    { title: 'Status', field: 'status' },
    {
      title: 'Deviation',
      field: 'deviation',
      hidden: true,
      render: (rowData: ProposalData): number =>
        standardDeviation(getGrades(rowData.reviews)),
      customSort: (a: ProposalData, b: ProposalData) =>
        (standardDeviation(getGrades(a.reviews)) || 0) -
        (standardDeviation(getGrades(b.reviews)) || 0),
    },
    {
      title: 'Absolute Difference',
      field: 'absolute',
      hidden: true,
      render: (rowData: ProposalData): number =>
        absoluteDifference(getGrades(rowData.reviews)),
      customSort: (a: ProposalData, b: ProposalData) =>
        (absoluteDifference(getGrades(a.reviews)) || 0) -
        (absoluteDifference(getGrades(b.reviews)) || 0),
    },
    {
      title: 'Average Score',
      field: 'average',
      hidden: true,
      render: (rowData: ProposalData): number =>
        average(getGrades(rowData.reviews)),
      customSort: (a: ProposalData, b: ProposalData) =>
        (average(getGrades(a.reviews)) || 0) -
        (average(getGrades(b.reviews)) || 0),
    },
    {
      title: 'Final Status',
      field: 'finalStatus',
      render: (rowData: ProposalData): string =>
        rowData.finalStatus
          ? getTranslation(rowData.finalStatus as ResourceId)
          : '',
    },
    {
      title: 'Instrument',
      render: (rowData: ProposalData): string =>
        rowData.instrument ? rowData.instrument.name : '-',
    },
    {
      title: 'Call',
      render: (rowData: ProposalData): string =>
        rowData.call ? rowData.call.shortCode : '-',
      hidden: true,
    },
    {
      title: 'SEP',
      render: (rowData: ProposalData): string =>
        rowData.sep ? rowData.sep.code : '-',
      hidden: true,
    },
  ];

  // NOTE: We are remapping only the hidden field because functions like `render` can not be stringified.
  if (localStorageValue) {
    columns = columns.map(column => ({
      ...column,
      hidden: localStorageValue?.find(
        localStorageValueItem => localStorageValueItem.title === column.title
      )?.hidden,
    }));
  }

  return (
    <MaterialTable
      icons={tableIcons}
      title={'Proposals'}
      columns={columns}
      data={proposalsData}
      isLoading={loading}
      options={{
        search: true,
        debounceInterval: 400,
        columnsButton: true,
      }}
      onChangeColumnHidden={collumnChange => {
        const proposalColumns = columns.map(
          (proposalColumn: Column<ProposalData>) => ({
            hidden:
              proposalColumn.title === collumnChange.title
                ? collumnChange.hidden
                : proposalColumn.hidden,
            title: proposalColumn.title,
          })
        );

        setLocalStorageValue(proposalColumns);
      }}
    />
  );
};

export default ProposalTableInstrumentScientist;
