import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import { Visibility, Delete } from '@material-ui/icons';
import GetAppIcon from '@material-ui/icons/GetApp';
import MaterialTable from 'material-table';
import React, { useState } from 'react';
import { Redirect } from 'react-router';

import { useDataApi } from '../../hooks/useDataApi';
import { useDownloadPDFProposal } from '../../hooks/useDownloadPDFProposal';
import { useProposalsData, ProposalData } from '../../hooks/useProposalsData';
import { tableIcons } from '../../utils/materialIcons';
import DialogConfirmation from '../common/DialogConfirmation';

const ProposalTableOfficer: React.FC = () => {
  const { loading, proposalsData, setProposalsData } = useProposalsData('');
  const [open, setOpen] = React.useState(false);
  const initalSelectedProposals: number[] = [];
  const [selectedProposals, setSelectedProposals] = React.useState(
    initalSelectedProposals
  );
  const downloadPDFProposal = useDownloadPDFProposal();
  const api = useDataApi();
  const columns = [
    { title: 'Proposal ID', field: 'shortCode' },
    { title: 'Title', field: 'title' },
    { title: 'Time(Days)', field: 'technicalReview.timeAllocation' },
    {
      title: 'Technical status',
      render: (rowData: ProposalData): string =>
        rowData.technicalReview
          ? getTranslation(rowData.technicalReview.status as ResourceId)
          : '',
    },
    { title: 'Status', field: 'status' },
  ];

  const [editProposalID, setEditProposalID] = useState(0);

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

  if (editProposalID) {
    return (
      <Redirect push to={`/ProposalReviewUserOfficer/${editProposalID}`} />
    );
  }

  if (loading) {
    return <p>Loading</p>;
  }

  const VisibilityIcon = (): JSX.Element => <Visibility />;
  const GetAppIconComponent = (): JSX.Element => <GetAppIcon />;
  const DeleteIcon = (): JSX.Element => <Delete />;

  return (
    <>
      <DialogConfirmation
        title="Delete proposals"
        text="This action will delete proposals and all data associated with them"
        open={open}
        action={deleteProposals}
        handleOpen={setOpen}
      />
      <MaterialTable
        icons={tableIcons}
        title={'Proposals'}
        columns={columns}
        data={proposalsData}
        options={{
          search: true,
          selection: true,
          debounceInterval: 400,
        }}
        actions={[
          {
            icon: VisibilityIcon,
            tooltip: 'View proposal',
            onClick: (event, rowData): void =>
              setEditProposalID((rowData as ProposalData).id),
            position: 'row',
          },
          {
            icon: GetAppIconComponent,
            tooltip: 'Download proposals',
            onClick: (event, rowData): void => {
              downloadPDFProposal((rowData as ProposalData).id);
            },
            position: 'row',
          },
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
        ]}
      />
    </>
  );
};

export default ProposalTableOfficer;
