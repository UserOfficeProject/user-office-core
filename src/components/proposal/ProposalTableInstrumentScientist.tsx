import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import GetAppIcon from '@material-ui/icons/GetApp';
import Visibility from '@material-ui/icons/Visibility';
import MaterialTable, { Column } from 'material-table';
import React from 'react';
import { Link } from 'react-router-dom';

import { Proposal } from 'generated/sdk';
import { useLocalStorage } from 'hooks/common/useLocalStorage';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { useProposalsData } from 'hooks/proposal/useProposalsData';
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
    Column<Proposal>[] | null
  >('proposalColumnsInstrumentScientist', null);

  /**
   * NOTE: Custom action buttons are here because when we have them inside actions on the material-table
   * and selection flag is true they are not working properly.
   */
  const RowActionButtons = (rowData: Proposal) => {
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

  let columns: Column<Proposal>[] = [
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
      render: rowData =>
        rowData.technicalReview
          ? getTranslation(rowData.technicalReview.status as ResourceId)
          : '',
    },
    {
      title: 'Submitted',
      render: rowData => (rowData.submitted ? 'Yes' : 'No'),
    },
    { title: 'Status', field: 'status.name' },
    {
      title: 'Deviation',
      field: 'deviation',
      hidden: true,
      render: (rowData: Proposal): number =>
        standardDeviation(getGrades(rowData.reviews)),
      customSort: (a: Proposal, b: Proposal) =>
        (standardDeviation(getGrades(a.reviews)) || 0) -
        (standardDeviation(getGrades(b.reviews)) || 0),
    },
    {
      title: 'Absolute Difference',
      field: 'absolute',
      hidden: true,
      render: (rowData: Proposal): number =>
        absoluteDifference(getGrades(rowData.reviews)),
      customSort: (a: Proposal, b: Proposal) =>
        (absoluteDifference(getGrades(a.reviews)) || 0) -
        (absoluteDifference(getGrades(b.reviews)) || 0),
    },
    {
      title: 'Average Score',
      field: 'average',
      hidden: true,
      render: (rowData: Proposal): number =>
        average(getGrades(rowData.reviews)),
      customSort: (a: Proposal, b: Proposal) =>
        (average(getGrades(a.reviews)) || 0) -
        (average(getGrades(b.reviews)) || 0),
    },
    {
      title: 'Final Status',
      field: 'finalStatus',
      render: (rowData: Proposal): string =>
        rowData.finalStatus
          ? getTranslation(rowData.finalStatus as ResourceId)
          : '',
    },
    {
      title: 'Instrument',
      render: (rowData: Proposal): string =>
        rowData.instrument ? rowData.instrument.name : '-',
    },
    {
      title: 'Call',
      render: (rowData: Proposal): string =>
        rowData.call ? rowData.call.shortCode : '-',
      hidden: true,
    },
    {
      title: 'SEP',
      render: (rowData: Proposal): string =>
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
          (proposalColumn: Column<Proposal>) => ({
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
