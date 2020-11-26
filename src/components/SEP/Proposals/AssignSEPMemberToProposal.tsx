import Add from '@material-ui/icons/Add';
import MaterialTable from 'material-table';
import PropTypes from 'prop-types';
import React from 'react';

import { SepMember, UserRole } from 'generated/sdk';
import { useSEPMembersData } from 'hooks/SEP/useSEPMembersData';
import { BasicUserDetails } from 'models/User';
import { tableIcons } from 'utils/materialIcons';

type AssignSEPMemberToProposalProps = {
  sepId: number;
  assignMemberToSEPProposal: (user: SepMember) => void;
  assignedMembers?: BasicUserDetails[] | null;
};

const AssignSEPMemberToProposal: React.FC<AssignSEPMemberToProposalProps> = ({
  assignMemberToSEPProposal,
  sepId,
  assignedMembers,
}) => {
  const { loadingMembers, SEPMembersData } = useSEPMembersData(sepId, false);

  const memberRole = (member: SepMember) =>
    `${member.roles.find(role => role.id === member.roleId)?.title}`;

  const columns = [
    { title: 'Name', field: 'user.firstname' },
    { title: 'Surname', field: 'user.lastname' },
    { title: 'Role', render: (rowData: SepMember) => memberRole(rowData) },
    { title: 'Organisation', field: 'user.organisation' },
  ];

  const members = SEPMembersData?.filter(sepMember => {
    if (
      !sepMember.roles.some(
        role => role.shortCode.toUpperCase() === UserRole.SEP_REVIEWER
      )
    ) {
      return false;
    }

    if (
      !assignedMembers?.find(
        assignedMember => assignedMember.id === sepMember.userId
      )
    ) {
      return true;
    }

    return false;
  }) as SepMember[];

  const AddIcon = (): JSX.Element => <Add />;

  return (
    <MaterialTable
      icons={tableIcons}
      columns={columns}
      title={'Select reviewers'}
      data={members}
      isLoading={loadingMembers}
      actions={[
        {
          icon: AddIcon,
          tooltip: 'Add reviewer',
          onClick: (event, rowData) =>
            assignMemberToSEPProposal(rowData as SepMember),
        },
      ]}
      options={{
        search: false,
      }}
    />
  );
};

AssignSEPMemberToProposal.propTypes = {
  assignMemberToSEPProposal: PropTypes.func.isRequired,
  sepId: PropTypes.number.isRequired,
  assignedMembers: PropTypes.array,
};

export default AssignSEPMemberToProposal;
