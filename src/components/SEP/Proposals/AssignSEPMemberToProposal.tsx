import PropTypes from 'prop-types';
import React from 'react';

import PeopleTable from 'components/user/PeopleTable';
import { SepMember, BasicUserDetails } from 'generated/sdk';
import { useSEPMembersData } from 'hooks/SEP/useSEPMembersData';

export type SepAssignedMember = BasicUserDetails &
  Pick<SepMember, 'roles' | 'roleId'>;

type AssignSEPMemberToProposalProps = {
  sepId: number;
  assignMemberToSEPProposal: (assignedMembers: SepAssignedMember[]) => void;
  assignedMembers?: BasicUserDetails[] | null;
};

const AssignSEPMemberToProposal: React.FC<AssignSEPMemberToProposalProps> = ({
  assignMemberToSEPProposal,
  sepId,
  assignedMembers,
}) => {
  const { loadingMembers, SEPMembersData } = useSEPMembersData(sepId, false);

  const memberRole = (member: SepAssignedMember) =>
    `${member.roles.find(role => role.id === member.roleId)?.title}`;

  const members: SepAssignedMember[] = SEPMembersData
    ? SEPMembersData.filter(
        sepMember =>
          !assignedMembers?.find(
            assignedMember => assignedMember.id === sepMember.userId
          )
      ).map(sepMember => ({
        ...sepMember.user,
        roleId: sepMember.roleId,
        roles: sepMember.roles,
      }))
    : [];

  const columns = [
    { title: 'Name', field: 'firstname' },
    { title: 'Surname', field: 'lastname' },
    {
      title: 'Role',
      render: (rowData: SepAssignedMember) => memberRole(rowData),
    },
    { title: 'Organisation', field: 'organisation' },
  ];

  return (
    <PeopleTable
      title="Select reviewers"
      selection
      data={members}
      isLoading={loadingMembers}
      columns={columns}
      onUpdate={(members: SepAssignedMember[]) =>
        assignMemberToSEPProposal(members)
      }
    />
  );
};

AssignSEPMemberToProposal.propTypes = {
  assignMemberToSEPProposal: PropTypes.func.isRequired,
  sepId: PropTypes.number.isRequired,
  assignedMembers: PropTypes.array,
};

export default AssignSEPMemberToProposal;
