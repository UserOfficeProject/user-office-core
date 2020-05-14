import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import { IconButton } from '@material-ui/core';
import { DialogContent, Dialog } from '@material-ui/core';
import { Visibility, Delete, Assignment } from '@material-ui/icons';
import GetAppIcon from '@material-ui/icons/GetApp';
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Link } from 'react-router-dom';

import { Review, ReviewStatus } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { useDownloadPDFProposal } from '../../hooks/useDownloadPDFProposal';
import { useProposalsData, ProposalData } from '../../hooks/useProposalsData';
import { tableIcons } from '../../utils/materialIcons';
import DialogConfirmation from '../common/DialogConfirmation';
import AssignProposalToSEP from '../SEP/AssignProposalToSEP';

const ProposalTableOfficer: React.FC = () => {
  const { loading, proposalsData, setProposalsData } = useProposalsData('');
  const [open, setOpen] = React.useState(false);
  const [openAssignment, setOpenAssignment] = React.useState(false);
  const initalSelectedProposals: number[] = [];
  const [selectedProposals, setSelectedProposals] = React.useState(
    initalSelectedProposals
  );
  const downloadPDFProposal = useDownloadPDFProposal();
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();

  const average = (numbers: number[]) => {
    const sum = numbers.reduce(function(sum, value) {
      return sum + value;
    }, 0);

    const avg = sum / numbers.length;

    return avg;
  };

  const absoluteDifference = (numbers: number[]) => {
    if (numbers.length < 2) {
      return NaN;
    }
    numbers = numbers.sort();

    return numbers[numbers.length - 1] - numbers[0];
  };

  const standardDeviation = (numbers: number[]) => {
    if (numbers.length < 2) {
      return NaN;
    }
    const avg = average(numbers);

    const squareDiffs = numbers?.map(function(value) {
      const diff = value - avg;
      const sqrDiff = diff * diff;

      return sqrDiff;
    });

    const avgSquareDiff = average(squareDiffs);

    const stdDev = Math.sqrt(avgSquareDiff);

    return stdDev;
  };

  const getGrades = (reviews: Review[] | null | undefined) =>
    reviews
      ?.filter(review => review.status === ReviewStatus.SUBMITTED)
      .map(review => review.grade!) ?? [];

  /**
   * NOTE: Custom action buttons are here because when we have them inside actions on the material-table
   * and selection flag is true they are not working properly.
   */
  const RowActionButtons = (rowData: ProposalData) => (
    <>
      <IconButton data-cy="view-proposal">
        <Link
          to={`/ProposalReviewUserOfficer/${rowData.id}`}
          style={{ color: 'inherit', textDecoration: 'inherit' }}
        >
          <Visibility />
        </Link>
      </IconButton>
      <IconButton onClick={() => downloadPDFProposal(rowData.id)}>
        <GetAppIcon />
      </IconButton>
    </>
  );

  const columns = [
    {
      title: 'Actions',
      cellStyle: { padding: 0, width: '10%' },
      sorting: false,
      render: RowActionButtons,
    },
    { title: 'Proposal ID', field: 'shortCode' },
    {
      title: 'Title',
      field: 'title',
      width: 'auto',
    },
    { title: 'Time(Days)', field: 'technicalReview.timeAllocation' },
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
      render: (rowData: ProposalData): number =>
        standardDeviation(getGrades(rowData.reviews)),
      customSort: (a: ProposalData, b: ProposalData) =>
        (standardDeviation(getGrades(a.reviews)) || 0) -
        (standardDeviation(getGrades(b.reviews)) || 0),
    },
    {
      title: 'Absolute Difference',
      field: 'absolute',
      render: (rowData: ProposalData): number =>
        absoluteDifference(getGrades(rowData.reviews)),
      customSort: (a: ProposalData, b: ProposalData) =>
        (absoluteDifference(getGrades(a.reviews)) || 0) -
        (absoluteDifference(getGrades(b.reviews)) || 0),
    },
    {
      title: 'Average Score',
      field: 'average',
      render: (rowData: ProposalData): number =>
        average(getGrades(rowData.reviews)),
      customSort: (a: ProposalData, b: ProposalData) =>
        (average(getGrades(a.reviews)) || 0) -
        (average(getGrades(b.reviews)) || 0),
    },
  ];

  const deleteProposals = (): void => {
    selectedProposals.forEach(id => {
      new Promise(async resolve => {
        await api().deleteProposal({ id });
        proposalsData.splice(
          proposalsData.findIndex(val => val.id === id),
          1
        );
        setProposalsData([...proposalsData]);
        resolve();
      });
    });
  };

  const assignProposalToSEP = async (sepId: number): Promise<void> => {
    const assignmentsErrors = await Promise.all(
      selectedProposals.map(async id => {
        const result = await api().assignProposal({ proposalId: id, sepId });

        return result.assignProposal.error;
      })
    );

    const isError = !!assignmentsErrors.join('');
    const message = isError
      ? 'Could not assign all selected proposals to SEP'
      : 'Proposal/s assigned to SEP';
    enqueueSnackbar(message, {
      variant: isError ? 'error' : 'success',
    });
  };

  if (loading) {
    return <p>Loading</p>;
  }

  const GetAppIconComponent = (): JSX.Element => <GetAppIcon />;
  const DeleteIcon = (): JSX.Element => <Delete />;
  const AssignIcon = (): JSX.Element => <Assignment />;

  return (
    <>
      <DialogConfirmation
        title="Delete proposals"
        text="This action will delete proposals and all data associated with them"
        open={open}
        action={deleteProposals}
        handleOpen={setOpen}
      />
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={openAssignment}
        onClose={(): void => setOpenAssignment(false)}
      >
        <DialogContent>
          <AssignProposalToSEP
            assignProposalToSEP={(sepId: number) => assignProposalToSEP(sepId)}
            close={(): void => setOpenAssignment(false)}
          />
        </DialogContent>
      </Dialog>
      <MaterialTable
        icons={tableIcons}
        title={'Proposals'}
        columns={columns}
        data={proposalsData}
        options={{
          search: true,
          selection: true,
          debounceInterval: 400,
          columnsButton: true,
        }}
        actions={[
          {
            icon: GetAppIconComponent,
            tooltip: 'Download proposals',
            onClick: (event, rowData): void => {
              downloadPDFProposal(
                (rowData as ProposalData[]).map(row => row.id).join(',')
              );
            },
            position: 'toolbarOnSelect',
          },
          {
            icon: DeleteIcon,
            tooltip: 'Delete proposals',
            onClick: (event, rowData): void => {
              setOpen(true);
              setSelectedProposals(
                (rowData as ProposalData[]).map((row: ProposalData) => row.id)
              );
            },
            position: 'toolbarOnSelect',
          },
          {
            icon: AssignIcon,
            tooltip: 'Assign proposals to SEP',
            onClick: (event, rowData): void => {
              setOpenAssignment(true);
              setSelectedProposals(
                (rowData as ProposalData[]).map((row: ProposalData) => row.id)
              );
            },
            position: 'toolbarOnSelect',
          },
        ]}
      />
    </>
  );
};

export default ProposalTableOfficer;
