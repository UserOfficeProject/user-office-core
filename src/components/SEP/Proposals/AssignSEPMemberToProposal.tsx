import React from 'react';

import PeopleTable from 'components/user/PeopleTable';
import { BasicUserDetails, Maybe, Role } from 'generated/sdk';
import { useSEPMembersData } from 'hooks/SEP/useSEPMembersData';

export type SepAssignedMember = BasicUserDetails & { role?: Maybe<Role> };

type AssignSEPMemberToProposalProps = {
  sepId: number;
  assignMemberToSEPProposal: (assignedMembers: SepAssignedMember[]) => void;
  assignedMembers?: Array<BasicUserDetails | null>;
};

const memberRole = (member: SepAssignedMember) => `${member.role?.title}`;

const columns = [
  { title: 'Name', field: 'firstname' },
  { title: 'Surname', field: 'lastname' },
  {
    title: 'Role',
    render: (rowData: SepAssignedMember) => memberRole(rowData),
  },
  { title: 'Organisation', field: 'organisation' },
];

const AssignSEPMemberToProposal: React.FC<AssignSEPMemberToProposalProps> = ({
  assignMemberToSEPProposal,
  sepId,
  assignedMembers,
}) => {
  const { loadingMembers, SEPMembersData } = useSEPMembersData(sepId, false);

  const members: SepAssignedMember[] = SEPMembersData
    ? SEPMembersData.filter(
        (sepMember) =>
          !assignedMembers?.find(
            (assignedMember) => assignedMember?.id === sepMember.userId
          )
      ).map((sepMember) => ({
        ...sepMember.user,
        role: sepMember.role ?? null,
      }))
    : [];

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

export default AssignSEPMemberToProposal;
